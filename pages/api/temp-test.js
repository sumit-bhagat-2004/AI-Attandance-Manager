// Temporary API endpoint for TestUser1 clean data injection
import { subjects } from '../../lib/scheduleData.js';

// Clean schedule without Sunday test classes
const originalSchedule = {
  1: [], // Monday - No classes
  2: [ // Tuesday
    { time: '9:45-10:45', code: 'PE-EC505A' },
    { time: '10:45-12:45', code: 'LAB-TUE' },
    { time: '1:30-2:30', code: 'EC502' },
    { time: '2:30-3:30', code: 'EC504' },
    { time: '3:30-4:30', code: 'EC503' },
  ],
  3: [ // Wednesday
    { time: '9:45-10:45', code: 'EC502' },
    { time: '10:45-11:45', code: 'PE-EC505A' },
    { time: '11:45-12:45', code: 'TRAIN-EET' },
    { time: '1:30-2:30', code: 'EC501' },
    { time: '2:30-3:30', code: 'OE-EC506A' },
    { time: '3:30-4:30', code: 'TRAIN-AAT' },
  ],
  4: [ // Thursday
    { time: '9:45-10:45', code: 'EC501' },
    { time: '10:45-12:45', code: 'LAB-THU' },
    { time: '2:30-3:30', code: 'EC504' },
    { time: '3:30-4:30', code: 'EC503' },
    { time: '4:30-5:30', code: 'MC-HU581' },
  ],
  5: [ // Friday
    { time: '9:45-10:45', code: 'EC502' },
    { time: '11:45-12:45', code: 'EC504' },
    { time: '2:30-3:30', code: 'PE-EC505A' },
    { time: '3:30-4:30', code: 'TRAIN-IOT' },
  ],
  6: [ // Saturday
    { time: '9:45-10:45', code: 'EC503' },
    { time: '10:45-12:45', code: 'LAB-SAT' },
    { time: '1:30-2:30', code: 'EC501' },
    { time: '2:30-3:30', code: 'OE-EC506A' },
  ],
};

function generate1WeekHistory(username) {
    const history = {};
    const currentDate = new Date();
    
    // Go back to the start of the week (Monday)
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1);
    
    console.log(`Generating 1 week history for ${username} starting from: ${weekStart.toDateString()}`);
    
    // Generate 7 days of history
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + dayOffset);
        
        const dateStr = date.toISOString().split('T')[0];
        const dayOfWeek = date.getDay();
        
        // Skip Sunday (day 0) as no classes
        if (dayOfWeek === 0) {
            history[dateStr] = {};
            continue;
        }
        
        const daySchedule = originalSchedule[dayOfWeek] || [];
        history[dateStr] = {};
        
        daySchedule.forEach((classInfo) => {
            let status = 'present';
            
            // Add some realistic attendance patterns
            if (dayOfWeek === 2 && classInfo.code === 'EC502') { // Miss EC502 on Tuesday
                status = 'skipped';
            } else if (dayOfWeek === 4 && classInfo.code === 'EC501') { // Miss EC501 on Thursday
                status = 'skipped';
            } else if (classInfo.code.startsWith('TRAIN-')) {
                // 15% chance to miss training classes
                status = Math.random() < 0.15 ? 'skipped' : 'present';
            } else if (classInfo.code.startsWith('PE-') || classInfo.code.startsWith('OE-')) {
                // 10% chance to miss elective classes
                status = Math.random() < 0.1 ? 'skipped' : 'present';
            }
            
            history[dateStr][classInfo.code] = status;
        });
    }
    
    // Create makeups array for missed core classes
    const makeups = [];
    Object.entries(history).forEach(([dateStr, dayHistory]) => {
        Object.entries(dayHistory).forEach(([classCode, status]) => {
            if (status === 'skipped' && ['EC501', 'EC502', 'EC503', 'EC504'].includes(classCode)) {
                const existingMakeup = makeups.find(m => m.subjectToMakeup === classCode);
                if (!existingMakeup) {
                    makeups.push({
                        subjectToMakeup: classCode,
                        makeupTarget: null,
                        makeupDate: null,
                        makeupTime: null,
                        missedDate: dateStr,
                        status: 'pending'
                    });
                }
            }
        });
    });
    
    return {
        username,
        cycleStartDate: weekStart.toISOString(),
        history,
        makeups,
        makeup: {
            needed: makeups.length > 0,
            subjectToMakeup: makeups[0]?.subjectToMakeup || null,
            makeupTarget: null,
            makeupDate: null,
            makeupTime: null
        }
    };
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { action, targetUser = 'TestUser1', dateOffset = 0 } = req.body;

        if (action === 'generateCleanWeek') {
            const userData = generate1WeekHistory(targetUser);
            
            console.log('Generated clean 1-week data:', {
                user: userData.username,
                historyDays: Object.keys(userData.history).length,
                makeupCount: userData.makeups.length,
                makeupSubjects: userData.makeups.map(m => m.subjectToMakeup)
            });

            res.status(200).json({
                message: 'Clean 1-week history generated successfully',
                userData,
                stats: {
                    historyDays: Object.keys(userData.history).length,
                    makeupCount: userData.makeups.length,
                    makeupSubjects: userData.makeups.map(m => m.subjectToMakeup),
                    weekStart: userData.cycleStartDate.split('T')[0]
                }
            });

        } else if (action === 'advanceDate') {
            // This is a simulation - in real implementation, you'd adjust the system date context
            const currentDate = new Date();
            const advancedDate = new Date(currentDate.getTime() + (dateOffset * 24 * 60 * 60 * 1000));
            
            res.status(200).json({
                message: `Date simulation advanced by ${dateOffset} days`,
                originalDate: currentDate.toISOString().split('T')[0],
                advancedDate: advancedDate.toISOString().split('T')[0],
                note: 'This is a simulation. Real date advancement would require system-level changes.'
            });

        } else {
            res.status(400).json({ message: 'Invalid action. Use "generateCleanWeek" or "advanceDate"' });
        }

    } catch (error) {
        console.error('Temp test script error:', error);
        res.status(500).json({ 
            message: 'Error in temp test script', 
            error: error.message 
        });
    }
}
