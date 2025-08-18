import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { subjects, calculateTotalClassesHeld, getEffectiveCycleStartDate, fullSchedule } from './scheduleData';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatTime(timeString) {
  return timeString.replace('-', ' - ');
}

// TIMEZONE FIX: Utility function to convert Date to YYYY-MM-DD format without timezone issues
export function formatDateToLocalString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Parse class time string and return start and end Date objects
export function parseClassTime(classTimeString, date = new Date()) {
  try {
    // Extract time range (e.g., "9:45 AM - 10:45 AM")
    const timeMatch = classTimeString.match(/(\d{1,2}:\d{2}\s*[AP]M)\s*-\s*(\d{1,2}:\d{2}\s*[AP]M)/i);
    
    if (!timeMatch) {
      console.error('Invalid class time format:', classTimeString);
      return { startTime: null, endTime: null };
    }

    const [, startTimeStr, endTimeStr] = timeMatch;

    const parseTime = (timeStr) => {
      const cleanTime = timeStr.trim();
      const [time, meridian] = cleanTime.split(/\s+/);
      const [hours, minutes] = time.split(':').map(Number);
      
      let adjustedHours = hours;
      const isPM = meridian.toLowerCase() === 'pm';
      const isAM = meridian.toLowerCase() === 'am';
      
      if (isPM && hours !== 12) {
        adjustedHours += 12;
      } else if (isAM && hours === 12) {
        adjustedHours = 0;
      }
      
      const dateTime = new Date(date);
      dateTime.setHours(adjustedHours, minutes, 0, 0);
      return dateTime;
    };

    const startTime = parseTime(startTimeStr);
    const endTime = parseTime(endTimeStr);

    return { startTime, endTime };
  } catch (error) {
    console.error('Error parsing class time:', classTimeString, error);
    return { startTime: null, endTime: null };
  }
}

// Check if a class is in the past based on its END time
export function isClassInPast(classTimeString, classDate = new Date()) {
  try {
    const now = new Date();
    const classDateStr = formatDateToLocalString(classDate);
    const todayStr = formatDateToLocalString(now);
    
    // If the class is on a different date
    if (classDateStr !== todayStr) {
      return classDateStr < todayStr;
    }
    
    // Same day - check if class end time has passed
    const { startTime, endTime } = parseClassTime(classTimeString, classDate);
    
    if (!endTime) {
      // If we can't parse the time, assume it's not in the past for safety
      console.warn('Could not parse class time, assuming not past:', classTimeString);
      return false;
    }
    
    // Class is past if current time is after the class END time
    return now > endTime;
  } catch (error) {
    console.error('Error checking if class is in past:', error);
    return false;
  }
}

export function getAttendanceColor(percentage) {
  if (percentage >= 90) return 'from-emerald-500 to-green-600';
  if (percentage >= 80) return 'from-blue-500 to-cyan-600';
  if (percentage >= 75) return 'from-yellow-500 to-orange-500';
  return 'from-red-500 to-rose-600';
}

export function getAttendanceTextColor(percentage) {
  if (percentage >= 80) return 'text-emerald-400';
  if (percentage >= 75) return 'text-yellow-400';
  return 'text-red-400';
}

export function getAttendanceStatusColor(status) {
  switch (status) {
    case 'attended':
      return 'bg-green-600';
    case 'skipped':
      return 'bg-red-600';
    default:
      return 'bg-gray-600';
  }
}

// Calculate overall attendance percentage
export const calculateOverallAttendance = (userData) => {
  try {
    if (!userData || !userData.history) {
      console.warn('No user data or history available');
      return 0;
    }

    if (!subjects) {
      console.error('Subjects not imported properly');
      return 0;
    }

    if (!calculateTotalClassesHeld) {
      console.error('calculateTotalClassesHeld not imported properly');
      return 0;
    }

    // Get all subjects
    const allSubjects = Object.keys(subjects);
    const regularSubjects = allSubjects.filter(
      (code) => !code.startsWith('LAB') && !code.startsWith('TRAIN')
    );
    const labSubjects = allSubjects.filter((code) => code.startsWith('LAB'));

    if (regularSubjects.length === 0 && labSubjects.length === 0) {
      console.warn('No subjects found');
      return 0;
    }

    let totalWeightedAttended = 0;
    let totalWeightedClasses = 0;

    // Calculate regular subjects attendance (1x weight)
    regularSubjects.forEach((code) => {
      try {
        // Count attended classes for this subject
        const attendedCount = Object.values(userData.history).reduce((acc, day) => {
          return acc + (day[code] === 'attended' ? 1 : 0);
        }, 0);

        // Use effective cycle start date (earliest date in history or cycle start date)
        const effectiveStartDate = getEffectiveCycleStartDate(userData);
        
        // Calculate total classes held for this subject
        const totalHeld = calculateTotalClassesHeld(
          code,
          effectiveStartDate,
          new Date()
        );

        // Weight = 1 for regular classes
        totalWeightedAttended += attendedCount * 1;
        totalWeightedClasses += totalHeld * 1;
      } catch (error) {
        console.error(`Error calculating attendance for ${code}:`, error);
      }
    });

    // Calculate lab subjects attendance (2x weight)
    labSubjects.forEach((code) => {
      try {
        // Count attended lab classes
        const attendedCount = Object.values(userData.history).reduce((acc, day) => {
          return acc + (day[code] === 'attended' ? 1 : 0);
        }, 0);

        // Use effective cycle start date (earliest date in history or cycle start date)
        const effectiveStartDate = getEffectiveCycleStartDate(userData);
        
        // Calculate total lab classes held
        const totalHeld = calculateTotalClassesHeld(
          code,
          effectiveStartDate,
          new Date()
        );

        // Weight = 2 for lab classes (they count as 2 regular classes each)
        totalWeightedAttended += attendedCount * 2;
        totalWeightedClasses += totalHeld * 2;
      } catch (error) {
        console.error(`Error calculating lab attendance for ${code}:`, error);
      }
    });

    // Add ECA credits (1x weight each)
    if (userData.ecaRecords) {
      const ecaCredits = Object.values(userData.ecaRecords).reduce((total, eca) => {
        return total + (eca.count || 1);
      }, 0);
      
      // Each ECA credit counts as one attended class (weight = 1)
      totalWeightedAttended += ecaCredits * 1;
      // Note: ECAs don't add to total required classes, they're bonus attendance
    }

    if (totalWeightedClasses === 0) return 100;
    const percentage = Math.round((totalWeightedAttended / totalWeightedClasses) * 100);
    return Math.min(percentage, 100); // Cap at 100%
  } catch (error) {
    console.error('Error in calculateOverallAttendance:', error);
    return 0;
  }
};

// Calculate subject-specific attendance percentage
export const calculateSubjectAttendance = (userData, subjectCode) => {
  try {
    if (!userData || !userData.history) return 0;

    // Count attended classes for this subject (both legacy and time-based keys)
    const attendedCount = Object.values(userData.history).reduce((acc, day) => {
      let count = 0;
      // Check legacy format (just subject code)
      if (day[subjectCode] === 'attended') count++;
      // Check time-based format (subject-time)
      Object.keys(day).forEach(key => {
        if (key.startsWith(`${subjectCode}-`) && day[key] === 'attended') {
          count++;
        }
      });
      return acc + count;
    }, 0);

    // Use effective cycle start date (earliest date in history or cycle start date)
    const effectiveStartDate = getEffectiveCycleStartDate(userData);
    
    // Calculate total classes held for this subject using adjusted calculation (same as StatsPanel/StatsView)
    const calculateAdjustedTotalClassesHeld = (subjectCode) => {
      let count = 0;
      
      let currentDate = new Date(effectiveStartDate);
      const today = new Date();
      
      while (currentDate <= today) {
        const dayOfWeek = currentDate.getDay();
        const dateStr = formatDateToLocalString(currentDate);
        
        if (fullSchedule[dayOfWeek]) {
          // Count classes for this subject on this day
          let classesForThisSubjectToday = 0;
          
          // First, count how many times this subject appears in the original schedule
          fullSchedule[dayOfWeek].forEach(cls => {
            if (cls.code === subjectCode) {
              classesForThisSubjectToday++;
            }
          });
          
          // Then, adjust for subject changes
          fullSchedule[dayOfWeek].forEach(cls => {
            const changeKey = `${dateStr}-${cls.code}`;
            const change = userData?.subjectChanges?.[changeKey];
            
            if (change) {
              if (cls.code === subjectCode) {
                // This subject was changed to another, so subtract
                classesForThisSubjectToday--;
                
                // If changed to NO_CLASS (holiday), don't add to any subject count
                if (change.newSubject !== 'NO_CLASS' && change.newSubject === subjectCode) {
                  // Edge case: if somehow changed to itself, add back
                  classesForThisSubjectToday++;
                }
              } else if (change.newSubject === subjectCode && change.newSubject !== 'NO_CLASS') {
                // Another subject was changed to this subject (and not to holiday), so add
                classesForThisSubjectToday++;
              }
            }
          });
          
          count += classesForThisSubjectToday;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return count;
    };
    
    const totalHeld = calculateAdjustedTotalClassesHeld(subjectCode);

    if (totalHeld === 0) return 100;
    
    // Calculate base percentage
    let basePercentage = Math.round((attendedCount / totalHeld) * 100);
    
    // For lab subjects, they inherently have more weight in the overall calculation
    // but the individual subject percentage remains as attended/total for that subject
    // The weighting is applied in the overall calculation, not the individual subject calculation
    
    // However, if this is a lab subject and ECAs can boost it, let's factor that in
    if (subjectCode.startsWith('LAB') && userData.ecaRecords) {
      // For lab subjects, ECA credits can help boost attendance
      // This is because labs are critical and ECA participation shows engagement
      const ecaCredits = Object.values(userData.ecaRecords).reduce((total, eca) => {
        return total + (eca.count || 1);
      }, 0);
      
      // Apply a small ECA bonus for labs (up to 5% bonus, max 2 ECA credits counted)
      const ecaBonus = Math.min(Math.floor(ecaCredits / 2) * 2.5, 5);
      basePercentage = Math.min(basePercentage + ecaBonus, 100);
    }
    
    return Math.max(0, Math.min(100, basePercentage)); // Ensure percentage is between 0-100
  } catch (error) {
    console.error(`Error calculating attendance for ${subjectCode}:`, error);
    return 0;
  }
};

// Robust function to get attendance status for a class with fallback to legacy format
export const getRobustAttendanceStatus = (userData, classCode, dateStr, classTime = null) => {
  try {
    if (!userData?.history?.[dateStr]) return null;

    const dayHistory = userData.history[dateStr];
    
    // Try time-based key first (for multiple classes per day)
    if (classTime) {
      const timeBasedKey = `${classCode}-${classTime}`;
      if (dayHistory[timeBasedKey]) {
        return dayHistory[timeBasedKey];
      }
    }
    
    // Fallback to legacy format (just subject code)
    return dayHistory[classCode] || null;
  } catch (error) {
    console.error('Error getting robust attendance status:', error);
    return null;
  }
};
