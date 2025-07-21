// Test Data Injector for AI Attendance Manager
// This will create realistic attendance history for testing multiple missed classes

import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

// Generate realistic test data for the past 3 weeks
const generateTestData = (username) => {
    const startDate = new Date('2025-07-01'); // Start from July 1st
    const endDate = new Date('2025-07-20'); // Up to today
    const history = {};
    
    // List of all subjects
    const allSubjects = ['EC502', 'EC503', 'EC504', 'EC501', 'PE-EC505A', 'OE-EC506A'];
    
    // Simulate realistic attendance patterns
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        // Skip weekends (0 = Sunday, 6 = Saturday) - but we have Saturday classes
        if (dayOfWeek === 0) { // Skip Sunday
            currentDate.setDate(currentDate.getDate() + 1);
            continue;
        }
        
        // Get schedule for this day (simplified version)
        const scheduleForDay = getScheduleForDay(dayOfWeek);
        
        if (scheduleForDay.length > 0) {
            history[dateStr] = {};
            
            scheduleForDay.forEach(classInfo => {
                // Create realistic attendance patterns
                let status = 'attended';
                
                // Simulate some missed classes (especially recent ones for testing)
                const isRecentDate = currentDate >= new Date('2025-07-15');
                
                if (isRecentDate) {
                    // Recent week: Miss some mandatory classes for testing
                    if (classInfo.code === 'EC502' && dateStr === '2025-07-18') {
                        status = 'skipped'; // Miss Computer Architecture on July 18
                    } else if (classInfo.code === 'EC503' && dateStr === '2025-07-19') {
                        status = 'skipped'; // Miss Digital Communication on July 19
                    } else if (classInfo.code === 'EC504' && dateStr === '2025-07-17') {
                        status = 'skipped'; // Miss Digital Signal on July 17
                    } else if (classInfo.code === 'OE-EC506A' && dateStr === '2025-07-17') {
                        status = 'skipped'; // Miss Soft Skills on July 17 (Wednesday)
                    } else if (Math.random() < 0.1) { // 10% chance of missing other classes
                        status = 'skipped';
                    }
                } else {
                    // Earlier dates: More regular attendance with occasional misses
                    if (Math.random() < 0.05) { // 5% chance of missing
                        status = 'skipped';
                    }
                }
                
                history[dateStr][classInfo.code] = status;
            });
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return {
        username,
        cycleStartDate: new Date('2025-07-01T00:00:00.000Z').toISOString(),
        history,
        // Multiple missed mandatory classes for testing
        makeups: [
            {
                subjectToMakeup: 'EC502', // Computer Architecture - missed July 18
                makeupTarget: 'EC502',
                makeupDate: '2025-07-22', // Scheduled for Tuesday
                makeupTime: '1:30 PM - 2:30 PM',
                missedDate: '2025-07-18'
            },
            {
                subjectToMakeup: 'EC503', // Digital Communication - missed July 19  
                makeupTarget: null,
                makeupDate: null,
                makeupTime: null,
                missedDate: '2025-07-19'
            },
            {
                subjectToMakeup: 'EC504', // Digital Signal Processing - missed July 17
                makeupTarget: null,
                makeupDate: null,
                makeupTime: null,
                missedDate: '2025-07-17'
            },
            {
                subjectToMakeup: 'EC501', // Electromagnetic Waves - missed July 16
                makeupTarget: null,
                makeupDate: null,
                makeupTime: null,
                missedDate: '2025-07-16'
            },
            {
                subjectToMakeup: 'OE-EC506A', // Soft Skills Development - missed July 17
                makeupTarget: 'OE-EC506A',
                makeupDate: '2025-08-20', // Schedule makeup for August 20th (Wednesday)
                makeupTime: '2:30 PM - 4:30 PM',
                missedDate: '2025-07-17'
            }
        ],
        // Legacy single makeup for backward compatibility
        makeup: {
            needed: true,
            subjectToMakeup: 'OE-EC506A', // Soft Skills missed class
            makeupTarget: 'OE-EC506A', // Same subject makeup
            makeupDate: '2025-08-20', // Schedule makeup for August 20th (Wednesday)
            makeupTime: '2:30 PM - 4:30 PM'
        }
    };
};

// Use the actual schedule data for consistency
import { fullSchedule } from './scheduleData.js';

const getScheduleForDay = (dayOfWeek) => {
    return fullSchedule[dayOfWeek] || [];
};

// Function to inject test data
export const injectTestData = async () => {
    console.log('🧪 Injecting test data for multiple missed classes scenario...');
    
    try {
        const client = new MongoClient(uri);
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('attendance');
        
        // Generate comprehensive test data
        const testData = generateTestData('TestUser');
        
        // Update or insert the test data
        await collection.replaceOne(
            { username: 'TestUser' },
            testData,
            { upsert: true }
        );
        
        console.log('✅ Test data injected successfully!');
        console.log('📊 Generated attendance history from July 1-20, 2025');
        console.log('🎯 Multiple missed classes created for testing');
        console.log('🔧 Makeup system activated');
        
        await client.close();
        return true;
    } catch (error) {
        console.error('❌ Error injecting test data:', error);
        return false;
    }
};

// Function to clean up test data (call this after testing)
export const cleanupTestData = async () => {
    console.log('🧹 Cleaning up test data...');
    
    try {
        const client = new MongoClient(uri);
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('attendance');
        
        // Reset to minimal data or delete
        await collection.deleteOne({ username: 'TestUser' });
        
        console.log('✅ Test data cleaned up successfully!');
        
        await client.close();
        return true;
    } catch (error) {
        console.error('❌ Error cleaning up test data:', error);
        return false;
    }
};
