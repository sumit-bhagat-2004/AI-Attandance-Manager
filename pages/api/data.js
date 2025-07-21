import clientPromise from '../../lib/mongodb';
import { bunkSchedule, mandatorySchedule, isMandatoryClass, getInitialState, createTestData, getEffectiveCycleStartDate, adjustCycleStartDate } from '../../lib/scheduleData';

function getWeekInCycle(startDate, checkDate) {
    const diffTime = Math.abs(checkDate - startDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const weekNumber = (Math.floor(diffDays / 7) % 5) + 1;
    return weekNumber;
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
        // Connect to MongoDB
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);
        const collection = db.collection('attendance');
        
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
                const { classCode, status, dateStr } = payload;
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
                
                const updateField = `history.${dateStr}.${classCode}`;
                
                // Check if we need to adjust the cycle start date based on attendance history
                const attendanceDate = new Date(dateStr);
                const currentCycleStart = new Date(userData.cycleStartDate);
                let needsCycleAdjustment = false;
                let newCycleStartDate = null;
                
                if (attendanceDate < currentCycleStart) {
                    needsCycleAdjustment = true;
                    newCycleStartDate = attendanceDate.toISOString();
                    console.log(`Adjusting cycle start date from ${userData.cycleStartDate} to ${newCycleStartDate} for user ${user}`);
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
                
                // Initialize makeups array if it doesn't exist
                if (!userData.makeups) {
                    userData.makeups = [];
                }
                
                // Update the specific makeup by index if provided, otherwise find by subject
                let targetMakeupIndex = makeupIndex;
                if (makeupIndex >= 0 && makeupIndex < userData.makeups.length) {
                    // Use the provided index
                    targetMakeupIndex = makeupIndex;
                } else {
                    // Fall back to finding by subject for backward compatibility
                    targetMakeupIndex = userData.makeups.findIndex(m => m.subjectToMakeup === subjectToMakeup);
                }
                
                if (targetMakeupIndex !== -1 && targetMakeupIndex < userData.makeups.length) {
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
                const currentWeek = getWeekInCycle(new Date(userData.cycleStartDate), today);
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
