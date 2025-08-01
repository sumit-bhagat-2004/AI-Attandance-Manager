export const subjects = {
  'EC502': { name: 'Computer Architecture' }, 
  'PE-EC505A': { name: 'Nano Electronics' }, 
  'EC504': { name: 'Digital Signal Processing' }, 
  'EC503': { name: 'Digital Communication' }, 
  'EC501': { name: 'Electromagnetic Waves' }, 
  'OE-EC506A': { name: 'Soft Skills Development' }, 
  'MC-HU581': { name: 'Management & Communication' }, 
  'LAB-DCEM': { name: 'DC & EM Waves Lab' }, 
  'LAB-DSC': { name: 'Digital Signal Comm Lab' }, 
  'LAB-EMDS': { name: 'EM Waves & DS Lab' }, 
  'TRAIN-EET': { name: 'Electronics Engineering Training' }, 
  'TRAIN-JAVA': { name: 'JAVA Programming Training' },
  'TRAIN-AAT': { name: 'Advanced Aptitude Training' }, 
  'TRAIN-JAVIOT': { name: 'JAVA & IoT Lab Training' },
};

export const fullSchedule = {
  2: [ // Tuesday
    { time: '9:45 AM - 10:45 AM', code: 'PE-EC505A' },
    { time: '10:45 AM - 12:45 PM', code: 'LAB-DCEM' },
    { time: '1:30 PM - 2:30 PM', code: 'EC502' },
    { time: '2:30 PM - 3:30 PM', code: 'EC504' },
    { time: '3:30 PM - 4:30 PM', code: 'EC503' },
  ],
  3: [ // Wednesday
    { time: '9:45 AM - 10:45 AM', code: 'EC502' },
    { time: '10:45 AM - 11:45 AM', code: 'PE-EC505A' },
    { time: '11:45 AM - 12:45 PM', code: 'TRAIN-EET' },
    { time: '1:30 PM - 2:30 PM', code: 'EC501' },
    { time: '2:30 PM - 3:30 PM', code: 'OE-EC506A' },
    { time: '3:30 PM - 4:30 PM', code: 'TRAIN-JAVA' },
  ],
  4: [ // Thursday
    { time: '9:45 AM - 10:45 AM', code: 'EC501' },
    { time: '10:45 AM - 12:45 PM', code: 'LAB-DSC' },
    { time: '1:30 PM - 2:30 PM', code: 'EC504' },
    { time: '2:30 PM - 3:30 PM', code: 'EC503' },
    { time: '3:30 PM - 4:30 PM', code: 'MC-HU581' },
  ],
  5: [ // Friday
    { time: '9:45 AM - 10:45 AM', code: 'EC502' },
    { time: '10:45 AM - 11:45 AM', code: 'TRAIN-JAVA' },
    { time: '11:45 AM - 12:45 PM', code: 'EC504' },
    { time: '1:30 PM - 2:30 PM', code: 'PE-EC505A' },
    { time: '2:30 PM - 4:30 PM', code: 'TRAIN-JAVIOT' },
  ],
  6: [ // Saturday
    { time: '9:45 AM - 10:45 AM', code: 'EC503' },
    { time: '10:45 AM - 12:45 PM', code: 'LAB-EMDS' },
    { time: '1:30 PM - 2:30 PM', code: 'EC501' },
    { time: '2:30 PM - 3:30 PM', code: 'OE-EC506A' },
    { time: '3:30 PM - 4:30 PM', code: 'TRAIN-AAT' },
  ],
};

export const bunkSchedule = {
  // Permanent recommended bunks (every week)
  'permanent': {
    3: ['TRAIN-JAVA'], // Wednesday: 3:30 PM - 4:30 PM - JAVA Theory
    5: ['TRAIN-JAVA', 'TRAIN-JAVIOT'], // Friday: 10:45 AM - 11:45 AM - JAVA Theory & 2:30 PM - 4:30 PM - JAVA/IOT Lab
    6: ['TRAIN-AAT'] // Saturday: 3:30 PM - 4:30 PM - AAT (Advanced Aptitude Training)
  },
  
  // Week 1: Free Tuesday Afternoon - Focus: bunk all classes on Tuesday afternoon
  1: { 
    2: ['EC502', 'EC504', 'EC503'] // Tuesday: 1:30 PM - Computer Architecture, 2:30 PM - Digital Signal, 3:30 PM - Digital Communication
  }, 
  
  // Week 2: Late Start on Wednesday - Focus: bunk the two morning classes on Wednesday
  2: { 
    3: ['EC502', 'PE-EC505A'] // Wednesday: 9:45 AM - Computer Architecture, 10:45 AM - Nano Electronics
  }, 
  
  // Week 3: Free Thursday Afternoon - Focus: bunk all classes on Thursday afternoon
  3: { 
    4: ['EC503', 'MC-HU581'] // Thursday: 2:30 PM - Digital Communication, 3:30 PM - MC-HU581 (EC504 moved to 1:30 PM, no longer afternoon)
  }, 
  
  // Week 4: Late Start on Friday - Focus: bunk two core classes on Friday morning
  4: { 
    5: ['EC502', 'EC504'] // Friday: 9:45 AM - Computer Architecture, 11:45 AM - Digital Signal
  }, 
  
  // Week 5: Distributed Bunks - Focus: distribute bunks across multiple days to complete the 80% cycle
  5: { 
    2: ['PE-EC505A'], // Tuesday: 9:45 AM - Nano Electronics
    3: ['OE-EC506A'], // Wednesday: 2:30 PM - Soft Skill
    4: ['EC501'], // Thursday: 9:45 AM - EM Waves
    6: ['EC503', 'EC501'] // Saturday: 9:45 AM - Digital Communication, 1:30 PM - EM Waves
  },
};

// 5-Week Mandatory Schedule for 80% Attendance Strategy
export const mandatorySchedule = {
  // Week 1: Mandatory Classes (Must Attend) - Focus: Free Tuesday afternoon
  1: {
    2: ['PE-EC505A', 'LAB-DCEM'], // Tuesday: Nano Electronics (9:45) + Lab (10:45) always mandatory
    3: ['EC502', 'PE-EC505A', 'TRAIN-EET', 'EC501', 'OE-EC506A'], // Wednesday: All except permanent bunks
    4: ['EC501', 'LAB-DSC', 'EC504', 'EC503', 'MC-HU581'], // Thursday: All classes + Lab always mandatory
    5: ['EC502', 'EC504', 'PE-EC505A'], // Friday: All except permanent bunks
    6: ['EC503', 'LAB-EMDS', 'EC501', 'OE-EC506A'] // Saturday: All except permanent bunks
  },
  
  // Week 2: Mandatory Classes (Must Attend) - Focus: Late start on Wednesday
  2: {
    2: ['PE-EC505A', 'LAB-DCEM', 'EC502', 'EC504', 'EC503'], // Tuesday: All classes + Lab always mandatory
    3: ['TRAIN-EET', 'EC501', 'OE-EC506A'], // Wednesday: Selected classes only (skipping morning)
    4: ['EC501', 'LAB-DSC', 'EC504', 'EC503', 'MC-HU581'], // Thursday: All classes + Lab always mandatory
    5: ['EC502', 'EC504', 'PE-EC505A'], // Friday: All except permanent bunks
    6: ['EC503', 'LAB-EMDS', 'EC501', 'OE-EC506A'] // Saturday: All except permanent bunks
  },
  
  // Week 3: Mandatory Classes (Must Attend) - Focus: Free Thursday afternoon
  3: {
    2: ['PE-EC505A', 'LAB-DCEM', 'EC502', 'EC504', 'EC503'], // Tuesday: All classes + Lab always mandatory
    3: ['EC502', 'PE-EC505A', 'TRAIN-EET', 'EC501', 'OE-EC506A'], // Wednesday: All except permanent bunks
    4: ['EC501', 'LAB-DSC', 'EC504'], // Thursday: Morning + 1:30 PM class only (shifted from 2:30)
    5: ['EC502', 'EC504', 'PE-EC505A'], // Friday: All except permanent bunks
    6: ['EC503', 'LAB-EMDS', 'EC501', 'OE-EC506A'] // Saturday: All except permanent bunks
  },
  
  // Week 4: Mandatory Classes (Must Attend) - Focus: Late start on Friday
  4: {
    2: ['PE-EC505A', 'LAB-DCEM', 'EC502', 'EC504', 'EC503'], // Tuesday: All classes + Lab always mandatory
    3: ['EC502', 'PE-EC505A', 'TRAIN-EET', 'EC501', 'OE-EC506A'], // Wednesday: All except permanent bunks
    4: ['EC501', 'LAB-DSC', 'EC504', 'EC503', 'MC-HU581'], // Thursday: All classes + Lab always mandatory
    5: ['PE-EC505A'], // Friday: Selected classes only (skipping morning core classes)
    6: ['EC503', 'LAB-EMDS', 'EC501', 'OE-EC506A'] // Saturday: All except permanent bunks
  },
  
  // Week 5: Mandatory Classes (Must Attend) - Focus: Distributed bunks
  5: {
    2: ['LAB-DCEM', 'EC502', 'EC504', 'EC503'], // Tuesday: Selected classes + Lab (10:45) always mandatory
    3: ['EC502', 'PE-EC505A', 'TRAIN-EET', 'EC501'], // Wednesday: Selected classes (skipping Soft Skill)
    4: ['LAB-DSC', 'EC504', 'EC503', 'MC-HU581'], // Thursday: Selected classes + Lab (10:45) always mandatory
    5: ['EC502', 'EC504', 'PE-EC505A'], // Friday: All except permanent bunks
    6: ['LAB-EMDS', 'OE-EC506A'] // Saturday: Selected classes + Lab (10:45) always mandatory
  }
};

// Check if a class is mandatory for the given week in cycle
export const isMandatoryClass = (weekInCycle, dayOfWeek, classCode) => {
    const mandatoryClasses = mandatorySchedule[weekInCycle]?.[dayOfWeek] || [];
    return mandatoryClasses.includes(classCode);
};

// Get available makeup opportunities for a missed subject
export const getAvailableMakeupClasses = (missedSubjectCode, currentWeek, weeksAhead = 10) => {
    const opportunities = [];
    
    for (let weekOffset = 0; weekOffset < weeksAhead; weekOffset++) {
        const targetWeek = ((currentWeek + weekOffset - 1) % 5) + 1;
        const bunkDays = bunkSchedule[targetWeek] || {};
        
        Object.entries(bunkDays).forEach(([dayOfWeek, bunkableClasses]) => {
            if (bunkableClasses.includes(missedSubjectCode)) {
                // Find the schedule for this day
                const daySchedule = fullSchedule[parseInt(dayOfWeek)] || [];
                const matchingClasses = daySchedule.filter(cls => cls.code === missedSubjectCode);
                
                matchingClasses.forEach(cls => {
                    opportunities.push({
                        week: targetWeek,
                        dayOfWeek: parseInt(dayOfWeek),
                        classCode: missedSubjectCode,
                        time: cls.time,
                        weekOffset
                    });
                });
            }
        });
    }
    
    return opportunities;
};

export const getInitialState = (username) => {
    // Start the week cycle from today instead of a fixed past Tuesday
    const today = new Date();
    const cycleStartDate = new Date(today);
    cycleStartDate.setHours(0, 0, 0, 0); // Set to start of day
    
    return {
        username,
        cycleStartDate: cycleStartDate.toISOString(),
        history: {},
        makeups: [], // Initialize empty makeups array for multiple makeup support
        usedPastMakeups: [], // Track past classes used as makeup credits
        makeup: { 
            needed: false, 
            subjectToMakeup: null, 
            makeupTarget: null, 
            makeupDate: null, 
            makeupTime: null 
        },
    };
};

export const calculateTotalClassesHeld = (subjectCode, semesterStartDate, today) => {
    let count = 0;
    let currentDate = new Date(semesterStartDate);
    while (currentDate <= today) {
        const dayOfWeek = currentDate.getDay();
        if (fullSchedule[dayOfWeek]) {
            for (const cls of fullSchedule[dayOfWeek]) {
                if (cls.code === subjectCode) {
                    count++;
                }
            }
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return count;
};

// Function to get the effective cycle start date based on attendance history
export const getEffectiveCycleStartDate = (userData) => {
    if (!userData) {
        return new Date(); // Fallback to current date
    }
    
    // If user has manually set their cycle start date, always use that
    if (userData.userSetCycleStart) {
        return new Date(userData.cycleStartDate);
    }
    
    // Legacy behavior for auto-adjustment
    if (!userData.history || Object.keys(userData.history).length === 0) {
        // No history, return current cycle start date
        return new Date(userData.cycleStartDate);
    }
    
    // Get all dates from history
    const historyDates = Object.keys(userData.history).map(dateStr => new Date(dateStr));
    const earliestHistoryDate = new Date(Math.min(...historyDates));
    const currentCycleStart = new Date(userData.cycleStartDate);
    
    // Return the earlier of the two dates
    return earliestHistoryDate < currentCycleStart ? earliestHistoryDate : currentCycleStart;
};

// Function to adjust user data cycle start date based on attendance history
export const adjustCycleStartDate = (userData) => {
    if (!userData) return userData;
    
    const effectiveStartDate = getEffectiveCycleStartDate(userData);
    
    // Update the cycle start date if needed
    if (effectiveStartDate < new Date(userData.cycleStartDate)) {
        userData.cycleStartDate = effectiveStartDate.toISOString();
    }
    
    return userData;
};

// Week calculation function for components
export const getWeekInCycle = (startDate, checkDate) => {
    const diffTime = Math.abs(checkDate - startDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return (Math.floor(diffDays / 7) % 5) + 1;
};

// Function to create test data with attendance history
export const createTestData = (username) => {
    const testHistory = {};
    const startDate = new Date('2025-07-15'); // Cycle start date (Tuesday)
    
    // Create sample attendance history for past few days
    const dates = [
        '2025-07-15', // Tuesday - Week 1
        '2025-07-16', // Wednesday - Week 1  
        '2025-07-17', // Thursday - Week 1
        '2025-07-18', // Friday - Week 1
        '2025-07-19', // Saturday - Week 1
    ];
    
    dates.forEach((dateStr) => {
        const testDate = new Date(dateStr);
        const dayOfWeek = testDate.getDay();
        
        if (fullSchedule[dayOfWeek]) {
            const dayHistory = {};
            
            fullSchedule[dayOfWeek].forEach((cls) => {
                // Create realistic missed classes for testing multiple makeups
                if (dateStr === '2025-07-18' && cls.code === 'EC502') {
                    dayHistory[cls.code] = 'skipped'; // Missed Computer Architecture on Friday
                } else if (dateStr === '2025-07-19' && cls.code === 'EC503') {
                    dayHistory[cls.code] = 'skipped'; // Missed Digital Communication on Saturday  
                } else if (dateStr === '2025-07-17' && cls.code === 'EC504') {
                    dayHistory[cls.code] = 'skipped'; // Missed Digital Signal on Thursday
                } else {
                    dayHistory[cls.code] = Math.random() > 0.3 ? 'attended' : 'skipped';
                }
            });
            
            testHistory[dateStr] = dayHistory;
        }
    });
    
    return {
        username,
        cycleStartDate: new Date('2025-07-15T00:00:00.000Z').toISOString(),
        history: testHistory,
        // Multiple missed mandatory classes for testing
        makeups: [
            {
                subjectToMakeup: 'EC502', // Computer Architecture
                makeupTarget: null,
                makeupDate: null,
                makeupTime: null,
                missedDate: '2025-07-18'
            },
            {
                subjectToMakeup: 'EC503', // Digital Communication  
                makeupTarget: null,
                makeupDate: null,
                makeupTime: null,
                missedDate: '2025-07-19'
            },
            {
                subjectToMakeup: 'EC504', // Digital Signal Processing
                makeupTarget: null,
                makeupDate: null,
                makeupTime: null,
                missedDate: '2025-07-17'
            }
        ],
        // Legacy single makeup for backward compatibility
        makeup: { 
            needed: true, 
            subjectToMakeup: 'EC502', 
            makeupTarget: null, 
            makeupDate: null, 
            makeupTime: null 
        }, // Need makeup for Computer Architecture
    };
};
