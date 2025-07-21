// Temporary script to create 1 week history for TestUser1 and test date adjustment
// This script should be removed after testing

import { subjects } from './lib/scheduleData.js';

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

// Function to generate 1 week of realistic attendance data
function generate1WeekHistory(username, startDate = null) {
    const history = {};
    const currentDate = startDate ? new Date(startDate) : new Date();
    
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
                // 20% chance to miss training classes
                status = Math.random() < 0.2 ? 'skipped' : 'present';
            } else if (classInfo.code.startsWith('PE-') || classInfo.code.startsWith('OE-')) {
                // 10% chance to miss elective classes
                status = Math.random() < 0.1 ? 'skipped' : 'present';
            }
            
            history[dateStr][classInfo.code] = status;
        });
        
        console.log(`${dateStr} (${date.toLocaleDateString('en-US', { weekday: 'long' })}):`, 
                   Object.keys(history[dateStr]).length, 'classes');
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
    
    console.log(`Generated ${makeups.length} makeup requirements:`, 
                makeups.map(m => `${m.subjectToMakeup} (missed ${m.missedDate})`));
    
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

// Function to temporarily advance the system date for testing
function createDateAdvanceHandler() {
    let dateOffset = 0;
    
    const originalDate = Date;
    
    const advanceDate = (days) => {
        dateOffset += days;
        console.log(`Date advanced by ${days} days. Total offset: ${dateOffset} days`);
        
        // Override Date constructor
        global.Date = function(...args) {
            if (args.length === 0) {
                const now = new originalDate();
                now.setDate(now.getDate() + dateOffset);
                return now;
            }
            return new originalDate(...args);
        };
        
        // Copy static methods
        Object.setPrototypeOf(global.Date, originalDate);
        Object.assign(global.Date, originalDate);
        
        return new global.Date();
    };
    
    const resetDate = () => {
        dateOffset = 0;
        global.Date = originalDate;
        console.log('Date reset to normal');
    };
    
    return { advanceDate, resetDate, getCurrentOffset: () => dateOffset };
}

// Export functions for use
const dateHandler = createDateAdvanceHandler();

// Generate data for TestUser1
const testUserData = generate1WeekHistory('TestUser1');

console.log('\\n=== TEST USER DATA GENERATED ===');
console.log('User:', testUserData.username);
console.log('History days:', Object.keys(testUserData.history).length);
console.log('Makeups required:', testUserData.makeups.length);

// Functions available for testing
export {
    generate1WeekHistory,
    dateHandler,
    testUserData,
    originalSchedule
};

// Console commands for manual testing:
console.log('\\n=== AVAILABLE TEST COMMANDS ===');
console.log('1. Advance date: dateHandler.advanceDate(7) // Advance 7 days');
console.log('2. Reset date: dateHandler.resetDate()');
console.log('3. Check offset: dateHandler.getCurrentOffset()');
console.log('4. Generate new data: generate1WeekHistory("TestUser1", new Date())');
