// Temporary database injection script for TestUser1 clean data
// This should be removed after testing

const { MongoClient } = require('mongodb');

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
            
            // Add specific missed classes for testing
            if (dayOfWeek === 2 && classInfo.code === 'EC502') { // Miss EC502 on Tuesday
                status = 'skipped';
                console.log(`  - Missing ${classInfo.code} on ${dateStr} (Tuesday)`);
            } else if (dayOfWeek === 4 && classInfo.code === 'EC501') { // Miss EC501 on Thursday  
                status = 'skipped';
                console.log(`  - Missing ${classInfo.code} on ${dateStr} (Thursday)`);
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

async function injectTestUser1Data() {
    const client = new MongoClient(process.env.MONGODB_URI || 'your-mongodb-connection-string');
    
    try {
        await client.connect();
        const db = client.db(process.env.MONGODB_DB || 'attendance-manager');
        const collection = db.collection('attendance');
        
        // Generate clean data
        const userData = generate1WeekHistory('TestUser1');
        
        // Remove existing TestUser1 data
        await collection.deleteOne({ username: 'TestUser1' });
        console.log('Removed existing TestUser1 data');
        
        // Insert new clean data
        await collection.insertOne(userData);
        console.log('Inserted new clean TestUser1 data');
        
        console.log('\n=== TESTUSER1 DATA SUMMARY ===');
        console.log('Week start:', userData.cycleStartDate.split('T')[0]);
        console.log('History days:', Object.keys(userData.history).length);
        console.log('Missed classes:', userData.makeups.map(m => `${m.subjectToMakeup} on ${m.missedDate}`));
        console.log('Makeup requirements:', userData.makeups.length);
        
        return userData;
        
    } catch (error) {
        console.error('Database injection error:', error);
        throw error;
    } finally {
        await client.close();
    }
}

// Export for use in other scripts
if (require.main === module) {
    // Run directly
    console.log('=== INJECTING TESTUSER1 CLEAN DATA ===');
    injectTestUser1Data()
        .then(() => {
            console.log('✅ TestUser1 clean data injection completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Data injection failed:', error.message);
            process.exit(1);
        });
}

module.exports = { generate1WeekHistory, injectTestUser1Data, originalSchedule };
