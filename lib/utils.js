import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { subjects, calculateTotalClassesHeld } from './scheduleData';

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

    // Get all subjects (including labs for weighted calculation)
    const allSubjects = Object.keys(subjects);
    const regularSubjects = allSubjects.filter(
      (code) => !code.startsWith('LAB') && !code.startsWith('TRAIN')
    );
    const labSubjects = allSubjects.filter((code) => code.startsWith('LAB'));

    if (regularSubjects.length === 0) {
      console.warn('No regular subjects found');
      return 0;
    }

    let totalAttended = 0;
    let totalClasses = 0;

    // Calculate regular subjects attendance
    regularSubjects.forEach((code) => {
      try {
        // Count attended classes for this subject
        const attendedCount = Object.values(userData.history).reduce((acc, day) => {
          return acc + (day[code] === 'attended' ? 1 : 0);
        }, 0);

        // Calculate total classes held for this subject
        const totalHeld = calculateTotalClassesHeld(
          code,
          new Date(userData.cycleStartDate),
          new Date()
        );

        totalAttended += attendedCount;
        totalClasses += totalHeld;
      } catch (error) {
        console.error(`Error calculating attendance for ${code}:`, error);
      }
    });

    // Calculate lab subjects attendance (2x weight since they're 2 hours)
    labSubjects.forEach((code) => {
      try {
        // Count attended lab classes
        const attendedCount = Object.values(userData.history).reduce((acc, day) => {
          return acc + (day[code] === 'attended' ? 1 : 0);
        }, 0);

        // Calculate total lab classes held
        const totalHeld = calculateTotalClassesHeld(
          code,
          new Date(userData.cycleStartDate),
          new Date()
        );

        // Lab classes are weighted 2x (equivalent to 2 regular classes)
        totalAttended += attendedCount * 2;
        totalClasses += totalHeld * 2;
      } catch (error) {
        console.error(`Error calculating lab attendance for ${code}:`, error);
      }
    });

    // Add ECA credits if available
    if (userData.ecaRecords) {
      const ecaCredits = Object.values(userData.ecaRecords).reduce((total, eca) => {
        return total + (eca.count || 1);
      }, 0);
      
      // Each ECA credit counts as one attended class
      totalAttended += ecaCredits;
    }

    if (totalClasses === 0) return 100;
    const percentage = Math.round((totalAttended / totalClasses) * 100);
    return Math.min(percentage, 100); // Cap at 100%
  } catch (error) {
    console.error('Error in calculateOverallAttendance:', error);
    return 0;
  }
};

// Calculate subject-specific attendance percentage with lab weighting
export const calculateSubjectAttendance = (userData, subjectCode) => {
  try {
    if (!userData || !userData.history) return 0;

    const attendedCount = Object.values(userData.history).reduce((acc, day) => {
      return acc + (day[subjectCode] === 'attended' ? 1 : 0);
    }, 0);

    const totalHeld = calculateTotalClassesHeld(
      subjectCode,
      new Date(userData.cycleStartDate),
      new Date()
    );

    if (totalHeld === 0) return 100;
    
    // Apply 2x weight if it's a lab subject
    const weight = subjectCode.startsWith('LAB') ? 2 : 1;
    const weightedAttended = attendedCount * weight;
    const weightedTotal = totalHeld * weight;
    
    return Math.round((weightedAttended / weightedTotal) * 100);
  } catch (error) {
    console.error(`Error calculating attendance for ${subjectCode}:`, error);
    return 0;
  }
};
