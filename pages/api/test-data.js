// API endpoint for test data management
// This is for testing purposes only and should be removed in production

import clientPromise from '../../lib/mongodb';

// Generate realistic test data for the past 3 weeks
const generateTestData = (username) => {
    const startDate = new Date('2025-07-01'); // Start from July 1st
    const endDate = new Date('2025-07-20'); // Up to today
    const history = {};
    
    // Simulate realistic attendance patterns
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        // Skip Sundays
        if (dayOfWeek === 0) {
            currentDate.setDate(currentDate.getDate() + 1);
            continue;
        }
        
        // Get schedule for this day
        const scheduleForDay = getScheduleForDay(dayOfWeek);
        
        if (scheduleForDay.length > 0) {
            history[dateStr] = {};
            
            scheduleForDay.forEach(classInfo => {
                let status = 'attended';
                
                // Create specific missed classes for testing multiple makeup scenarios
                const isRecentDate = currentDate >= new Date('2025-07-15');
                
                if (isRecentDate) {
                    // Recent week: Strategic misses to test makeup system
                    if (classInfo.code === 'EC502' && dateStr === '2025-07-18') {
                        status = 'skipped'; // Miss Computer Architecture (Friday)
                    } else if (classInfo.code === 'EC503' && dateStr === '2025-07-19') {
                        status = 'skipped'; // Miss Digital Communication (Saturday)
                    } else if (classInfo.code === 'EC504' && dateStr === '2025-07-17') {
                        status = 'skipped'; // Miss Digital Signal (Thursday)
                    } else if (classInfo.code === 'EC501' && dateStr === '2025-07-16') {
                        status = 'skipped'; // Miss EM Waves (Wednesday)
                    } else if (Math.random() < 0.08) { // 8% chance of missing other classes
                        status = 'skipped';
                    }
                } else {
                    // Earlier dates: Regular attendance with occasional misses
                    if (Math.random() < 0.03) { // 3% chance of missing
                        status = 'skipped';
                    }
                }
                
                history[dateStr][classInfo.code] = status;
            });
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Create makeups array based on skipped mandatory classes
    const makeups = [];
    
    // Process history to find missed mandatory classes
    Object.entries(history).forEach(([dateStr, dayHistory]) => {
        Object.entries(dayHistory).forEach(([classCode, status]) => {
            if (status === 'skipped' && !classCode.startsWith('LAB') && !classCode.startsWith('TRAIN') && !classCode.startsWith('PE-') && !classCode.startsWith('OE-')) {
                // Check if this is a core mandatory subject
                const coreSubjects = ['EC502', 'EC503', 'EC504', 'EC501'];
                if (coreSubjects.includes(classCode)) {
                    // Check if we already have a makeup for this subject
                    const existingMakeup = makeups.find(m => m.subjectToMakeup === classCode);
                    if (!existingMakeup) {
                        makeups.push({
                            subjectToMakeup: classCode,
                            makeupTarget: null,
                            makeupDate: null,
                            makeupTime: null,
                            missedDate: dateStr
                        });
                    }
                }
            }
        });
    });
    
    return {
        username,
        cycleStartDate: new Date('2025-07-01T00:00:00.000Z').toISOString(),
        history,
        makeups,
        makeup: {
            needed: makeups.length > 0,
            subjectToMakeup: makeups.length > 0 ? makeups[0].subjectToMakeup : null,
            makeupTarget: null,
            makeupDate: null,
            makeupTime: null
        }
    };
};

// Simplified schedule mapping
const getScheduleForDay = (dayOfWeek) => {
    const schedules = {
        1: [{ code: 'EC502', time: '9:45-10:45' }, { code: 'EC503', time: '10:45-11:45' }], // Monday
        2: [{ code: 'PE-EC505A', time: '9:45-10:45' }, { code: 'EC502', time: '1:30-2:30' }, { code: 'EC504', time: '2:30-3:30' }, { code: 'EC503', time: '3:30-4:30' }], // Tuesday
        3: [{ code: 'EC502', time: '9:45-10:45' }, { code: 'PE-EC505A', time: '10:45-11:45' }, { code: 'EC501', time: '1:30-2:30' }, { code: 'OE-EC506A', time: '2:30-3:30' }], // Wednesday
        4: [{ code: 'EC501', time: '9:45-10:45' }, { code: 'EC504', time: '2:30-3:30' }, { code: 'EC503', time: '3:30-4:30' }], // Thursday
        5: [{ code: 'EC502', time: '9:45-10:45' }, { code: 'EC504', time: '11:45-12:45' }, { code: 'PE-EC505A', time: '2:30-3:30' }], // Friday
        6: [{ code: 'EC503', time: '9:45-10:45' }, { code: 'EC501', time: '1:30-2:30' }, { code: 'OE-EC506A', time: '2:30-3:30' }], // Saturday
    };
    
    return schedules[dayOfWeek] || [];
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { action } = req.body;

    try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB);
        const collection = db.collection('attendance');

        if (action === 'inject') {
            console.log('🧪 Injecting comprehensive test data...');
            
            // Generate and inject test data
            const testData = generateTestData('TestUser');
            
            await collection.replaceOne(
                { username: 'TestUser' },
                testData,
                { upsert: true }
            );

            console.log('✅ Test data injection complete!');
            console.log(`📊 Generated ${Object.keys(testData.history).length} days of attendance history`);
            
            // Count missed classes
            let missedCount = 0;
            Object.values(testData.history).forEach(day => {
                Object.values(day).forEach(status => {
                    if (status === 'skipped') missedCount++;
                });
            });
            
            console.log(`🎯 Created ${missedCount} missed classes for testing`);
            
            return res.status(200).json({ 
                message: 'Test data injected successfully',
                stats: {
                    daysGenerated: Object.keys(testData.history).length,
                    missedClasses: missedCount,
                    makeupNeeded: testData.makeup.needed
                }
            });

        } else if (action === 'cleanup') {
            console.log('🧹 Cleaning up test data...');
            
            await collection.deleteOne({ username: 'TestUser' });
            
            console.log('✅ Test data cleanup complete!');
            
            return res.status(200).json({ 
                message: 'Test data cleaned up successfully'
            });

        } else {
            return res.status(400).json({ message: 'Invalid action. Use "inject" or "cleanup"' });
        }

    } catch (error) {
        console.error('❌ Test data operation error:', error);
        return res.status(500).json({ 
            message: 'Error managing test data',
            error: error.message 
        });
    }
}
