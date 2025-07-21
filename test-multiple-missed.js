// Test script to simulate multiple missed classes across different days
// This is for testing purposes only

const testMultipleMissedClasses = async () => {
    const testUser = 'TestUser';
    
    // Simulate missing classes on different days
    const missedClasses = [
        { classCode: 'EC502', date: '2025-07-18', day: 'Friday' }, // Computer Architecture
        { classCode: 'EC503', date: '2025-07-19', day: 'Saturday' }, // Digital Communication
        { classCode: 'EC504', date: '2025-07-20', day: 'Sunday' }, // Digital Signal
    ];

    console.log('🧪 Testing Multiple Missed Classes Scenario');
    console.log('='.repeat(50));

    for (const { classCode, date, day } of missedClasses) {
        console.log(`📅 Day: ${day} (${date})`);
        console.log(`❌ Missed Class: ${classCode}`);
        
        try {
            const response = await fetch('/api/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: 'logAttendance', 
                    payload: { 
                        user: testUser, 
                        classCode, 
                        status: 'skipped', 
                        dateStr: date 
                    } 
                }),
            });
            
            const result = await response.json();
            console.log(`✅ Logged: ${result.needsMakeup ? 'Makeup Required' : 'No Makeup Needed'}`);
        } catch (error) {
            console.error(`❌ Error logging ${classCode}:`, error);
        }
        console.log('-'.repeat(30));
    }

    console.log('🎯 Test completed! Check the UI for makeup alerts and scheduling.');
};

// Export for use in browser console
window.testMultipleMissedClasses = testMultipleMissedClasses;

console.log('🔧 Test functions loaded. Run testMultipleMissedClasses() to test multiple missed classes.');
