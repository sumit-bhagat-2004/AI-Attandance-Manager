import clientPromise from '../../lib/mongodb';
import { mockDatabase } from '../../lib/mockDatabase';
import { subjects, bunkSchedule, mandatorySchedule, isMandatoryClass, getInitialState, createTestData, getEffectiveCycleStartDate, adjustCycleStartDate } from '../../lib/scheduleData';

function getWeekInCycle(startDate, checkDate) {
    const diffTime = Math.abs(checkDate - startDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const weekNumber = (Math.floor(diffDays / 7) % 5) + 1;
    return weekNumber;
}

// Function to get database collection with fallback to mock database
async function getDatabaseCollection() {
    try {
        // Try to connect to MongoDB
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB || 'attendance_db');
        return db.collection('attendance');
    } catch (error) {
        console.warn('MongoDB connection failed, falling back to mock database:', error.message);
        // Return mock database with same interface
        return mockDatabase;
    }
}

// Function to update week cycle in database based on current date
async function updateWeekCycleInDatabase(collection, user) {
    try {
        const userData = await collection.findOne({ username: user });
        if (!userData) return null;

        const effectiveStartDate = userData.history && Object.keys(userData.history).length > 0 
            ? new Date(Math.min(...Object.keys(userData.history).map(d => new Date(d))))
            : new Date(userData.cycleStartDate);
        
        const currentDate = new Date();
        const currentWeekInCycle = getWeekInCycle(effectiveStartDate, currentDate);
        
        // Update the user data with current week information
        const updateData = {
            currentWeekInCycle,
            lastWeekUpdate: currentDate.toISOString(),
            effectiveCycleStartDate: effectiveStartDate.toISOString()
        };
        
        // Update cycle start date if it's different
        if (effectiveStartDate < new Date(userData.cycleStartDate)) {
            updateData.cycleStartDate = effectiveStartDate.toISOString();
        }
        
        await collection.updateOne(
            { username: user },
            { $set: updateData }
        );
        
        console.log(`Updated week cycle for user ${user}: Week ${currentWeekInCycle}, Effective start: ${effectiveStartDate.toISOString()}`);
        
        return { ...userData, ...updateData };
    } catch (error) {
        console.error('Error updating week cycle:', error);
        return null;
    }
}

export default async function handler(req, res) {
    try {
        // Get database collection (MongoDB or fallback to mock)
        const collection = await getDatabaseCollection();
        
        if (req.method === 'GET') {
            const { user } = req.query;
            let data = await collection.findOne({ username: user });
            
            if (!data) {
                // Create test data for specific test users
                if (user === 'TestUser' || user === 'Demo' || user.toLowerCase().includes('test')) {
                    data = createTestData(user);
                    console.log('Created test data for user:', user);
                } else {
                    data = getInitialState(user);
                }
                await collection.insertOne(data);
            } else {
                // Adjust cycle start date for existing users based on attendance history
                const originalCycleStartDate = data.cycleStartDate;
                data = adjustCycleStartDate(data);
                
                // Update database if cycle start date was adjusted
                if (data.cycleStartDate !== originalCycleStartDate) {
                    console.log(`Auto-adjusting cycle start date for user ${user} from ${originalCycleStartDate} to ${data.cycleStartDate}`);
                    await collection.updateOne(
                        { username: user },
                        { $set: { cycleStartDate: data.cycleStartDate } }
                    );
                }
            }
            
            // Always update week cycle information
            data = await updateWeekCycleInDatabase(collection, user) || data;
            
            res.status(200).json(data);
        } else if (req.method === 'POST') {
            const { action, payload } = req.body;
            const { user } = payload;
            
            let userData = await collection.findOne({ username: user });
            if (!userData) {
                return res.status(404).json({ message: "User data not found." });
            }

            let needsMakeup = false;

            if (action === 'logAttendance') {
                const { classCode, status, dateStr, classTime } = payload;
                const checkDate = new Date(dateStr);
                const dayOfWeek = checkDate.getDay();
                
                // Use effective cycle start date for week calculation
                const effectiveStartDate = userData.history && Object.keys(userData.history).length > 0 
                    ? new Date(Math.min(...Object.keys(userData.history).map(d => new Date(d)), checkDate))
                    : new Date(Math.min(new Date(userData.cycleStartDate), checkDate));
                    
                const weekInCycle = getWeekInCycle(effectiveStartDate, checkDate);
                
                // Check if this is a designated makeup class
                const isDesignatedMakeup = userData.makeup.makeupTarget && 
                                         userData.makeup.makeupDate === dateStr && 
                                         userData.makeup.makeupTarget === classCode;
                
                // Use the mandatorySchedule to determine if class is mandatory for this week
                const isClassMandatory = isMandatoryClass(weekInCycle, dayOfWeek, classCode);
                
                // A class is mandatory if it's in the mandatorySchedule or is a designated makeup
                const isMandatory = isClassMandatory || isDesignatedMakeup;
                
                // Create unique attendance key: include time if available for multiple classes per day
                // Format: "classCode" or "classCode-time" for backward compatibility
                const attendanceKey = classTime ? `${classCode}-${classTime}` : classCode;
                const updateField = `history.${dateStr}.${attendanceKey}`;
                
                // Check if we need to adjust the cycle start date based on attendance history
                // Only adjust if user hasn't manually set their cycle start date
                const attendanceDate = new Date(dateStr);
                const currentCycleStart = new Date(userData.cycleStartDate);
                let needsCycleAdjustment = false;
                let newCycleStartDate = null;
                
                // Only auto-adjust cycle start if user hasn't manually set it
                if (!userData.userSetCycleStart && attendanceDate < currentCycleStart) {
                    needsCycleAdjustment = true;
                    newCycleStartDate = attendanceDate.toISOString();
                    console.log(`Auto-adjusting cycle start date from ${userData.cycleStartDate} to ${newCycleStartDate} for user ${user}`);
                }
                
                // Handle removing attendance records
                if (status === 'unrecorded') {
                    // Remove the attendance record
                    await collection.updateOne(
                        { username: user },
                        { $unset: { [updateField]: "" } }
                    );
                    
                    // If there was a makeup requirement for this class on this date, remove it
                    if (userData.makeups) {
                        const makeupIndex = userData.makeups.findIndex(m => 
                            m.makeupTarget === classCode && m.makeupDate === dateStr
                        );
                        if (makeupIndex !== -1) {
                            userData.makeups.splice(makeupIndex, 1);
                            
                            // Update legacy single makeup
                            userData.makeup = { 
                                needed: userData.makeups.length > 0, 
                                subjectToMakeup: userData.makeups[0]?.subjectToMakeup || null, 
                                makeupTarget: userData.makeups[0]?.makeupTarget || null,
                                makeupDate: userData.makeups[0]?.makeupDate || null,
                                makeupTime: userData.makeups[0]?.makeupTime || null
                            };
                            
                            await collection.updateOne(
                                { username: user },
                                { $set: { makeup: userData.makeup, makeups: userData.makeups } }
                            );
                        }
                    }
                }
                // If skipping a mandatory class (excluding labs and training), set makeup needed
                else if (status === 'skipped' && isMandatory && !classCode.startsWith('LAB') && !classCode.startsWith('TRAIN')) {
                    // Initialize makeups array if it doesn't exist
                    if (!userData.makeups) {
                        userData.makeups = [];
                    }
                    
                    // Check if this subject already has a makeup requirement
                    const existingMakeup = userData.makeups.find(m => m.subjectToMakeup === classCode);
                    if (!existingMakeup) {
                        userData.makeups.push({
                            subjectToMakeup: classCode,
                            makeupTarget: null,
                            makeupDate: null,
                            makeupTime: null,
                            missedDate: dateStr
                        });
                        needsMakeup = true;
                    }
                    
                    // Keep legacy single makeup for backward compatibility
                    userData.makeup = { 
                        needed: userData.makeups.length > 0, 
                        subjectToMakeup: userData.makeups[0]?.subjectToMakeup || null, 
                        makeupTarget: userData.makeups[0]?.makeupTarget || null,
                        makeupDate: userData.makeups[0]?.makeupDate || null,
                        makeupTime: userData.makeups[0]?.makeupTime || null
                    };
                    
                    await collection.updateOne(
                        { username: user },
                        needsCycleAdjustment 
                            ? { $set: { [updateField]: status, makeup: userData.makeup, makeups: userData.makeups, cycleStartDate: newCycleStartDate } }
                            : { $set: { [updateField]: status, makeup: userData.makeup, makeups: userData.makeups } }
                    );
                } 
                // If attending a designated makeup class, clear the makeup requirement
                else if (status === 'attended' && isDesignatedMakeup) {
                    // Remove from makeups array
                    if (userData.makeups) {
                        userData.makeups = userData.makeups.filter(m => m.makeupTarget !== classCode);
                    }
                    
                    // Update legacy single makeup
                    userData.makeup = { 
                        needed: userData.makeups && userData.makeups.length > 0, 
                        subjectToMakeup: userData.makeups?.[0]?.subjectToMakeup || null, 
                        makeupTarget: userData.makeups?.[0]?.makeupTarget || null,
                        makeupDate: userData.makeups?.[0]?.makeupDate || null,
                        makeupTime: userData.makeups?.[0]?.makeupTime || null
                    };
                    
                    await collection.updateOne(
                        { username: user },
                        needsCycleAdjustment 
                            ? { $set: { [updateField]: status, makeup: userData.makeup, makeups: userData.makeups, cycleStartDate: newCycleStartDate } }
                            : { $set: { [updateField]: status, makeup: userData.makeup, makeups: userData.makeups } }
                    );
                }
                // Regular attendance logging
                else {
                    await collection.updateOne(
                        { username: user },
                        needsCycleAdjustment 
                            ? { $set: { [updateField]: status, makeup: userData.makeup, makeups: userData.makeups, cycleStartDate: newCycleStartDate } }
                            : { $set: { [updateField]: status, makeup: userData.makeup, makeups: userData.makeups } }
                    );
                }
            } else if (action === 'setMakeup') {
                const { targetClass, subjectToMakeup, makeupIndex = 0 } = payload;
                
                // Validate targetClass payload
                if (!targetClass || typeof targetClass !== 'object') {
                    return res.status(400).json({ 
                        message: 'Invalid targetClass: Missing or invalid target class data' 
                    });
                }
                
                if (!targetClass.code || !targetClass.date || !targetClass.time) {
                    return res.status(400).json({ 
                        message: 'Invalid targetClass: Missing required properties (code, date, time)',
                        received: targetClass
                    });
                }
                
                // Initialize makeups array if it doesn't exist
                if (!userData.makeups) {
                    userData.makeups = [];
                }
                
                // Find or create the makeup entry
                let targetMakeupIndex = -1;
                
                // First, try to use the provided index if it's valid and the makeup exists
                if (makeupIndex >= 0 && makeupIndex < userData.makeups.length) {
                    targetMakeupIndex = makeupIndex;
                } else {
                    // For new makeups, always create a new entry (allow multiple makeups for same subject)
                    // Only update existing if explicitly targeting an existing makeup by valid index
                    targetMakeupIndex = -1;
                }
                
                // If no valid existing makeup found, create a new one
                if (targetMakeupIndex === -1) {
                    // Create new makeup entry (allows multiple makeups for same subject)
                    const newMakeup = {
                        subjectToMakeup: subjectToMakeup,
                        makeupTarget: targetClass.code,
                        makeupDate: targetClass.date,
                        makeupTime: targetClass.time,
                        status: 'scheduled',
                        createdAt: new Date().toISOString()
                    };
                    userData.makeups.push(newMakeup);
                    targetMakeupIndex = userData.makeups.length - 1;
                } else {
                    // Update existing makeup entry
                    userData.makeups[targetMakeupIndex].makeupTarget = targetClass.code;
                    userData.makeups[targetMakeupIndex].makeupDate = targetClass.date;
                    userData.makeups[targetMakeupIndex].makeupTime = targetClass.time;
                    userData.makeups[targetMakeupIndex].status = 'scheduled';
                }
                
                // Update legacy single makeup for backward compatibility
                userData.makeup = {
                    needed: userData.makeups.length > 0,
                    subjectToMakeup: userData.makeups[0]?.subjectToMakeup || null,
                    makeupTarget: userData.makeups[0]?.makeupTarget || null,
                    makeupDate: userData.makeups[0]?.makeupDate || null,
                    makeupTime: userData.makeups[0]?.makeupTime || null
                };
                
                await collection.updateOne(
                    { username: user },
                    { $set: { makeup: userData.makeup, makeups: userData.makeups } }
                );
            } else if (action === 'logECA') {
                const { date, event, numberOfECAs } = payload;
                
                // Initialize ECA field if it doesn't exist
                if (!userData.ecaRecords) {
                    userData.ecaRecords = {};
                }
                
                const ecaField = `ecaRecords.${date}`;
                const ecaData = {
                    event: event,
                    count: parseInt(numberOfECAs) || 1,
                    timestamp: new Date()
                };
                
                await collection.updateOne(
                    { username: user },
                    { $set: { [ecaField]: ecaData } }
                );
            } else if (action === 'updateECA') {
                const { originalDate, date, event, numberOfECAs } = payload;
                
                // Initialize ECA field if it doesn't exist
                if (!userData.ecaRecords) {
                    userData.ecaRecords = {};
                }
                
                // If date changed, remove old record and add new one
                if (originalDate !== date) {
                    await collection.updateOne(
                        { username: user },
                        { $unset: { [`ecaRecords.${originalDate}`]: "" } }
                    );
                }
                
                const ecaField = `ecaRecords.${date}`;
                const ecaData = {
                    event: event,
                    count: parseInt(numberOfECAs) || 1,
                    timestamp: new Date()
                };
                
                await collection.updateOne(
                    { username: user },
                    { $set: { [ecaField]: ecaData } }
                );
            } else if (action === 'deleteECA') {
                const { date } = payload;
                
                await collection.updateOne(
                    { username: user },
                    { $unset: { [`ecaRecords.${date}`]: "" } }
                );
            } else if (action === 'saveWeeklyReport') {
                const { report } = payload;
                
                // Initialize weeklyReports field if it doesn't exist
                if (!userData.weeklyReports) {
                    userData.weeklyReports = {};
                }
                
                // Store report with unique key (week + start date)
                const reportKey = `${report.weekInCycle}-${report.weekRange.startStr}`;
                const reportField = `weeklyReports.${reportKey}`;
                
                await collection.updateOne(
                    { username: user },
                    { $set: { [reportField]: report } }
                );
            } else if (action === 'deleteWeeklyReport') {
                const { reportId } = payload;
                
                await collection.updateOne(
                    { username: user },
                    { $unset: { [`weeklyReports.${reportId}`]: "" } }
                );
            } else if (action === 'getWeeklyReports') {
                // Return all stored weekly reports
                const reports = userData.weeklyReports ? Object.values(userData.weeklyReports) : [];
                return res.status(200).json({ reports });
            } else if (action === 'checkOptionalClasses') {
                // Check if more optional classes are available for makeup rescheduling
                const { subjectToMakeup } = payload;
                
                // Get current makeups for this subject
                const currentMakeups = userData.makeups || [];
                const subjectMakeups = currentMakeups.filter(m => m.subjectToMakeup === subjectToMakeup);
                
                // Check bunk schedule for available optional classes
                const today = new Date();
                const currentWeek = getWeekInCycle(getEffectiveCycleStartDate(userData), today);
                const availableOptionalClasses = [];
                
                // Look ahead 4 weeks for optional classes
                for (let week = currentWeek; week <= currentWeek + 4; week++) {
                    const actualWeek = ((week - 1) % 5) + 1;
                    if (bunkSchedule[actualWeek]) {
                        Object.keys(bunkSchedule[actualWeek]).forEach(day => {
                            const dayClasses = bunkSchedule[actualWeek][day];
                            if (dayClasses && dayClasses[subjectToMakeup]) {
                                const dateToCheck = new Date(today);
                                dateToCheck.setDate(dateToCheck.getDate() + ((week - currentWeek) * 7) + (parseInt(day) - today.getDay()));
                                
                                // Check if this date is not already used for makeup
                                const isAlreadyUsed = subjectMakeups.some(m => m.makeupDate === dateToCheck.toISOString().split('T')[0]);
                                
                                if (!isAlreadyUsed) {
                                    availableOptionalClasses.push({
                                        date: dateToCheck.toISOString().split('T')[0],
                                        day: day,
                                        week: actualWeek
                                    });
                                }
                            }
                        });
                    }
                }
                
                return res.status(200).json({ 
                    hasMoreOptionalClasses: availableOptionalClasses.length > 0,
                    availableClasses: availableOptionalClasses
                });
                
            } else if (action === 'removeMakeup') {
                // Remove a specific makeup class
                const { subjectToMakeup, makeupIndex } = payload;
                
                if (!userData.makeups || userData.makeups.length === 0) {
                    return res.status(400).json({ message: "No makeups found to remove." });
                }
                
                // Find and remove the makeup
                let makeupFound = false;
                if (makeupIndex >= 0 && makeupIndex < userData.makeups.length) {
                    const removedMakeup = userData.makeups[makeupIndex];
                    if (removedMakeup.subjectToMakeup === subjectToMakeup) {
                        userData.makeups.splice(makeupIndex, 1);
                        makeupFound = true;
                    }
                }
                
                if (!makeupFound) {
                    return res.status(400).json({ message: "Makeup class not found." });
                }
                
                // Update legacy single makeup
                userData.makeup = { 
                    needed: userData.makeups.length > 0, 
                    subjectToMakeup: userData.makeups[0]?.subjectToMakeup || null, 
                    makeupTarget: userData.makeups[0]?.makeupTarget || null,
                    makeupDate: userData.makeups[0]?.makeupDate || null,
                    makeupTime: userData.makeups[0]?.makeupTime || null
                };
                
                // Update database
                await collection.updateOne(
                    { username: user },
                    { $set: { makeup: userData.makeup, makeups: userData.makeups } }
                );
                
            } else if (action === 'setCycleStart') {
                const { cycleStartDate } = payload;
                
                // Validate the date
                const newStartDate = new Date(cycleStartDate);
                if (isNaN(newStartDate.getTime())) {
                    return res.status(400).json({ message: "Invalid cycle start date provided." });
                }
                
                // Update the cycle start date in database
                await collection.updateOne(
                    { username: user },
                    { 
                        $set: { 
                            cycleStartDate: newStartDate.toISOString(),
                            // Reset any automatic cycle adjustments
                            lastCycleAdjustment: new Date().toISOString(),
                            userSetCycleStart: true // Flag to indicate user manually set this
                        } 
                    }
                );
                
                console.log(`User ${user} set cycle start date to: ${newStartDate.toISOString()}`);
                
            } else if (action === 'changeSubject') {
                // Handle class subject change due to teacher absence or holiday
                const { originalSubject, newSubject, date, reason } = payload;
                
                // Initialize subjectChanges if it doesn't exist
                if (!userData.subjectChanges) userData.subjectChanges = {};
                
                const dateStr = new Date(date).toISOString().split('T')[0];
                const changeKey = `${dateStr}-${originalSubject}`;
                
                // Handle special case for 'NO_CLASS' (holiday/no class)
                if (newSubject === 'NO_CLASS') {
                    // Store as holiday/no class
                    userData.subjectChanges[changeKey] = {
                        originalSubject: originalSubject,
                        newSubject: 'NO_CLASS',
                        changeDate: new Date().toISOString(),
                        reason: reason || 'holiday',
                        isHoliday: true
                    };
                } else {
                    // Regular subject change
                    userData.subjectChanges[changeKey] = {
                        originalSubject: originalSubject,
                        newSubject: newSubject,
                        changeDate: new Date().toISOString(),
                        reason: reason || 'teacher_absence',
                        isHoliday: false
                    };
                }
                
                // Update in database
                await collection.updateOne(
                    { username: user },
                    { $set: { subjectChanges: userData.subjectChanges } }
                );
                
                return res.status(200).json({ 
                    message: newSubject === 'NO_CLASS' ? "Class marked as holiday" : "Subject changed successfully", 
                    updatedData: userData 
                });
                
            } else if (action === 'removeSubjectChange') {
                // Handle removing subject change or holiday marking
                const { originalSubject, date } = payload;
                
                if (!userData.subjectChanges) {
                    return res.status(400).json({ message: "No subject changes found" });
                }
                
                const dateStr = new Date(date).toISOString().split('T')[0];
                const changeKey = `${dateStr}-${originalSubject}`;
                
                if (userData.subjectChanges[changeKey]) {
                    delete userData.subjectChanges[changeKey];
                    
                    // Update in database
                    await collection.updateOne(
                        { username: user },
                        { $set: { subjectChanges: userData.subjectChanges } }
                    );
                    
                    return res.status(200).json({ 
                        message: "Subject change removed successfully", 
                        updatedData: userData 
                    });
                } else {
                    return res.status(404).json({ message: "Subject change not found" });
                }
                
            } else if (action === 'createTestCredits') {
                // Create some test past credit data for debugging
                const testDate1 = '2025-07-15'; // Tuesday - Week 1, Day 2
                const testDate2 = '2025-07-23'; // Wednesday - Week 2, Day 3  
                const testDate3 = '2025-08-01'; // Friday - Week 3, Day 5
                
                // Initialize history if it doesn't exist
                if (!userData.history) userData.history = {};
                
                // Create test attendance records where user attended recommended bunks
                // Week 1, Tuesday: EC502 is a recommended bunk
                if (!userData.history[testDate1]) userData.history[testDate1] = {};
                userData.history[testDate1]['EC502'] = 'attended';
                
                // Week 2, Wednesday: EC502 is a recommended bunk  
                if (!userData.history[testDate2]) userData.history[testDate2] = {};
                userData.history[testDate2]['EC502'] = 'attended';
                
                // Add some TRAIN-JAVA permanent bunks (always bunks on Friday)
                if (!userData.history[testDate3]) userData.history[testDate3] = {};
                userData.history[testDate3]['TRAIN-JAVA'] = 'attended';
                
                // Also create some mandatory classes that were skipped to need makeup
                userData.history[testDate1]['EC503'] = 'skipped'; // Need makeup for this
                
                // Initialize makeups if not exist
                if (!userData.makeups) userData.makeups = [];
                if (!userData.makeups.some(m => m.subjectToMakeup === 'EC503')) {
                    userData.makeups.push({
                        subjectToMakeup: 'EC503',
                        makeupTarget: null,
                        makeupDate: null,
                        makeupTime: null,
                        missedDate: testDate1
                    });
                }
                
                // Update in database
                await collection.updateOne(
                    { username: user },
                    { 
                        $set: { 
                            history: userData.history,
                            makeups: userData.makeups,
                            cycleStartDate: new Date('2025-07-15T00:00:00.000Z').toISOString()
                        } 
                    }
                );
                
                return res.status(200).json({ 
                    message: "Test credits created",
                    testData: {
                        createdAttendance: {
                            [testDate1]: { 'EC502': 'attended', 'EC503': 'skipped' },
                            [testDate2]: { 'EC502': 'attended' },
                            [testDate3]: { 'TRAIN-JAVA': 'attended' }
                        },
                        cycleStartDate: '2025-07-15T00:00:00.000Z'
                    }
                });
                
            } else if (action === 'debugUserData') {
                // Debug endpoint to check user's data structure
                const debugInfo = {
                    username: user,
                    cycleStartDate: userData.cycleStartDate,
                    historyKeys: Object.keys(userData.history || {}),
                    historyCount: Object.keys(userData.history || {}).length,
                    usedPastMakeups: userData.usedPastMakeups || [],
                    makeups: userData.makeups || [],
                    sampleHistory: {},
                    bunkSchedule: bunkSchedule, // Include bunk schedule for reference
                    subjects: subjects // Include subjects for reference
                };
                
                // Get first few history entries as samples  
                const historyEntries = Object.entries(userData.history || {}).slice(0, 10);
                historyEntries.forEach(([date, dayData]) => {
                    debugInfo.sampleHistory[date] = dayData;
                });
                
                return res.status(200).json(debugInfo);
                
            } else if (action === 'getAvailablePastClasses') {
                // Get past attended recommended bunk classes for makeup
                const pastClasses = [];
                const usedCredits = userData.usedPastMakeups || [];
                
                console.log(`\n=== Getting past classes for user ${user} ===`);
                console.log('History dates:', Object.keys(userData.history || {}));
                
                
                // Helper function to get all dates when a specific class was a recommended bunk
                const getDatesWhenClassWasRecommendedBunk = (classCode) => {
                    const recommendedDates = [];
                    
                    console.log(`\n--- Checking class ${classCode} ---`);
                    
                    // Check each date in user's history
                    Object.keys(userData.history || {}).forEach(dateStr => {
                        const classDate = new Date(dateStr);
                        const dayOfWeek = classDate.getDay();
                        
                        // Get the cycle start date - ensure it's a valid date
                        const cycleStartDate = userData.cycleStartDate ? new Date(userData.cycleStartDate) : new Date('2025-07-15');
                        
                        // Make sure both dates are at start of day for accurate calculation
                        const classDateStart = new Date(classDate);
                        classDateStart.setHours(0, 0, 0, 0);
                        const cycleStartDateStart = new Date(cycleStartDate);
                        cycleStartDateStart.setHours(0, 0, 0, 0);
                        
                        const diffTime = classDateStart.getTime() - cycleStartDateStart.getTime();
                        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                        const weekInCycle = (Math.floor(diffDays / 7) % 5) + 1;
                        
                        console.log(`    Date ${dateStr}: class=${classDateStart.toDateString()}, cycle=${cycleStartDateStart.toDateString()}, diffDays=${diffDays}, week=${weekInCycle}, day=${dayOfWeek}`);
                        
                        
                        // Check if this class was a permanent recommended bunk on this day
                        const permanentBunks = bunkSchedule['permanent']?.[dayOfWeek] || [];
                        const isPermanentBunk = permanentBunks.includes(classCode);
                        
                        // Check if this class was a weekly recommended bunk for this week/day
                        const weeklyBunks = bunkSchedule[weekInCycle]?.[dayOfWeek] || [];
                        const isWeeklyBunk = weeklyBunks.includes(classCode);
                        
                        if (isPermanentBunk || isWeeklyBunk) {
                            console.log(`  ${dateStr}: Week ${weekInCycle}, Day ${dayOfWeek} - ${classCode} is a ${isPermanentBunk ? 'permanent' : 'weekly'} bunk`);
                            recommendedDates.push({
                                date: dateStr,
                                weekInCycle: weekInCycle,
                                dayOfWeek: dayOfWeek,
                                bunkType: isPermanentBunk ? 'permanent' : 'weekly'
                            });
                        }
                    });
                    
                    return recommendedDates;
                };
                
                // Get all unique class codes from user's attendance history
                const attendedClasses = new Set();
                Object.entries(userData.history || {}).forEach(([dateStr, dayHistory]) => {
                    Object.entries(dayHistory).forEach(([classCode, status]) => {
                        if (status === 'attended') {
                            attendedClasses.add(classCode);
                        }
                    });
                });
                
                console.log('All attended classes:', Array.from(attendedClasses));
                
                // For each attended class, find dates when it was a recommended bunk
                attendedClasses.forEach(classCode => {
                    const recommendedDates = getDatesWhenClassWasRecommendedBunk(classCode);
                    
                    recommendedDates.forEach(dateInfo => {
                        const { date: dateStr } = dateInfo;
                        
                        // Check if user actually attended this class on this date
                        const wasAttended = userData.history[dateStr]?.[classCode] === 'attended';
                        
                        // Check if this specific date+class combination was already used as makeup credit
                        const isAlreadyUsed = usedCredits.some(used => 
                            used.creditDate === dateStr && used.creditClass === classCode
                        );
                        
                        console.log(`${classCode} on ${dateStr}: attended=${wasAttended}, used=${isAlreadyUsed}`);
                        
                        // Only include if: attended + was recommended bunk + not already used
                        if (wasAttended && !isAlreadyUsed) {
                            pastClasses.push({
                                date: dateStr,
                                class: classCode,
                                className: subjects[classCode]?.name || classCode,
                                available: true,
                                wasRecommendedBunk: true,
                                bunkType: dateInfo.bunkType,
                                weekInCycle: dateInfo.weekInCycle
                            });
                            console.log(`  ✅ Added as past credit: ${classCode} on ${dateStr}`);
                        }
                    });
                });
                
                console.log(`\n=== RESULT: ${pastClasses.length} past credits found ===`);
                
                return res.status(200).json({ 
                    availablePastClasses: pastClasses,
                    totalCredits: pastClasses.length,
                    usedCredits: usedCredits.length,
                    explanation: `Found ${pastClasses.length} attended classes that were recommended bunks and can be used as makeup credits`
                });
                
            } else if (action === 'usePastNonMandatory') {
                // Use past recommended bunk class for makeup
                const { makeupIndex, pastClassDate, pastClassCode } = payload;
                
                // Initialize arrays if they don't exist
                if (!userData.usedPastMakeups) userData.usedPastMakeups = [];
                if (!userData.makeups) userData.makeups = [];
                
                // Validate that the makeup index exists
                if (makeupIndex >= userData.makeups.length) {
                    return res.status(400).json({ 
                        message: "Invalid makeup index provided." 
                    });
                }
                
                // Validate that the past class was actually attended
                const wasAttended = userData.history?.[pastClassDate]?.[pastClassCode] === 'attended';
                if (!wasAttended) {
                    return res.status(400).json({ 
                        message: "This class was not attended on the specified date." 
                    });
                }
                
                // Validate that this class was a recommended bunk on that date
                const classDate = new Date(pastClassDate);
                const dayOfWeek = classDate.getDay();
                
                // Get the cycle start date - ensure it's a valid date
                const cycleStartDate = userData.cycleStartDate ? new Date(userData.cycleStartDate) : new Date('2025-07-15');
                
                // Make sure both dates are at start of day for accurate calculation
                const classDateStart = new Date(classDate);
                classDateStart.setHours(0, 0, 0, 0);
                const cycleStartDateStart = new Date(cycleStartDate);
                cycleStartDateStart.setHours(0, 0, 0, 0);
                
                const diffTime = classDateStart.getTime() - cycleStartDateStart.getTime();
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                const weekInCycle = (Math.floor(diffDays / 7) % 5) + 1;
                
                const permanentBunks = bunkSchedule['permanent']?.[dayOfWeek] || [];
                const weeklyBunks = bunkSchedule[weekInCycle]?.[dayOfWeek] || [];
                const wasRecommendedBunk = permanentBunks.includes(pastClassCode) || weeklyBunks.includes(pastClassCode);
                
                if (!wasRecommendedBunk) {
                    return res.status(400).json({ 
                        message: "This class was not a recommended bunk on the specified date." 
                    });
                }
                
                // Check if this credit has already been used
                const alreadyUsed = userData.usedPastMakeups.some(used => 
                    used.creditDate === pastClassDate && used.creditClass === pastClassCode
                );
                
                if (alreadyUsed) {
                    return res.status(400).json({ 
                        message: "This makeup credit has already been used." 
                    });
                }
                
                // Mark the makeup as completed using past credit
                const targetMakeup = userData.makeups[makeupIndex];
                
                // Record the usage in the tracking array BEFORE removing the makeup
                userData.usedPastMakeups.push({
                    creditDate: pastClassDate,
                    creditClass: pastClassCode,
                    creditClassName: subjects[pastClassCode]?.name || pastClassCode,
                    usedDate: new Date().toISOString(),
                    makeupIndex: makeupIndex,
                    forSubject: targetMakeup.subjectToMakeup,
                    forSubjectName: subjects[targetMakeup.subjectToMakeup]?.name || targetMakeup.subjectToMakeup,
                    weekInCycle: weekInCycle,
                    wasRecommendedBunk: true,
                    completionDate: new Date().toISOString(),
                    pastCreditUsed: {
                        date: pastClassDate,
                        class: pastClassCode,
                        className: subjects[pastClassCode]?.name || pastClassCode,
                        usedOn: new Date().toISOString(),
                        wasRecommendedBunk: true,
                        weekInCycle: weekInCycle
                    }
                });
                
                // REMOVE the makeup from the makeups array completely
                userData.makeups.splice(makeupIndex, 1);
                
                // Update legacy single makeup for backward compatibility
                userData.makeup = {
                    needed: userData.makeups.length > 0,
                    subjectToMakeup: userData.makeups[0]?.subjectToMakeup || null,
                    makeupTarget: userData.makeups[0]?.makeupTarget || null,
                    makeupDate: userData.makeups[0]?.makeupDate || null,
                    makeupTime: userData.makeups[0]?.makeupTime || null
                };
                
                // Update in database
                await collection.updateOne(
                    { username: user },
                    { 
                        $set: { 
                            usedPastMakeups: userData.usedPastMakeups,
                            makeups: userData.makeups,
                            makeup: userData.makeup
                        } 
                    }
                );
                
                console.log(`User ${user} used past credit: ${pastClassCode} (${pastClassDate}) for makeup of ${targetMakeup.subjectToMakeup}`);
                
                return res.status(200).json({ 
                    message: "Makeup credit applied successfully",
                    updatedData: userData,
                    creditUsed: {
                        class: pastClassCode,
                        date: pastClassDate,
                        forSubject: targetMakeup.subjectToMakeup
                    }
                });
                
            } else if (action === 'updateUserData') {
                const { userData: newUserData } = payload;
                console.log(`Updating user data for ${user}`);
                
                // Update the entire user data
                await collection.updateOne(
                    { username: user },
                    { $set: newUserData }
                );
                
                return res.status(200).json({ 
                    message: "User data updated successfully",
                    updatedData: newUserData
                });
                
            } else {
                return res.status(400).json({ message: "Invalid action." });
            }

            const updatedData = await collection.findOne({ username: user });
            res.status(200).json({ updatedData, needsMakeup });
        } else {
            res.status(405).end(); // Method Not Allowed
        }
    } catch (error) {
        console.error('MongoDB API Error:', error);
        res.status(500).json({ 
            message: 'MongoDB connection error', 
            error: error.message,
            details: 'Please check your MongoDB Atlas connection and network settings'
        });
    }
}
