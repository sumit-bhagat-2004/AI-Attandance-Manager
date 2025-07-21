import { subjects, calculateTotalClassesHeld } from './scheduleData';
import { formatDateToLocalString, calculateSubjectAttendance } from './utils';

// Calculate week number in cycle (1-based)
export function getWeekInCycle(date, cycleStartDate) {
  const start = new Date(cycleStartDate);
  const current = new Date(date);
  const diffTime = Math.abs(current - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.ceil(diffDays / 7);
}

// Get week date range (Monday to Sunday)
export function getWeekDateRange(date) {
  const current = new Date(date);
  const dayOfWeek = current.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Calculate Monday of the week
  const monday = new Date(current);
  monday.setDate(current.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  
  // Calculate Sunday of the week
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  
  return {
    start: monday,
    end: sunday,
    startStr: formatDateToLocalString(monday),
    endStr: formatDateToLocalString(sunday)
  };
}

// Check if week is completed (current date is past Sunday of that week)
export function isWeekCompleted(weekStartDate) {
  const now = new Date();
  const weekRange = getWeekDateRange(weekStartDate);
  const weekEndPlusOne = new Date(weekRange.end);
  weekEndPlusOne.setDate(weekEndPlusOne.getDate() + 1);
  
  return now >= weekEndPlusOne;
}

// Generate comprehensive weekly report with AI integration and study plan
export function generateWeeklyReport(userData, weekStartDate, studentName = null, hints = null, generateStudyPlan = true) {
  try {
    const weekRange = getWeekDateRange(weekStartDate);
    const weekInCycle = getWeekInCycle(weekStartDate, new Date(userData.cycleStartDate));
    const isCompleted = isWeekCompleted(weekStartDate);
    
    // Use student name from userData if not provided
    const finalStudentName = studentName || userData.studentName || userData.username || 'Student';
    
    // Initialize counters
    let totalClassesScheduled = 0;
    let totalClassesAttended = 0;
    let totalClassesSkipped = 0;
    let totalUnrecorded = 0;
    
    const subjectWiseReport = {};
    const dailyReport = {};
    
    // Analyze each subject
    Object.keys(subjects).forEach(subjectCode => {
      const subjectName = subjects[subjectCode].name;
      const isLab = subjectCode.startsWith('LAB');
      const isTraining = subjectCode.startsWith('TRAIN');
      
      let attended = 0;
      let skipped = 0;
      let unrecorded = 0;
      let scheduled = 0;
      
      // Check each day of the week
      for (let day = 0; day < 7; day++) {
        const currentDay = new Date(weekRange.start);
        currentDay.setDate(weekRange.start.getDate() + day);
        const dateStr = formatDateToLocalString(currentDay);
        
        if (!dailyReport[dateStr]) {
          dailyReport[dateStr] = {
            date: currentDay,
            dayName: currentDay.toLocaleDateString('en-US', { weekday: 'long' }),
            subjects: {},
            totalScheduled: 0,
            totalAttended: 0,
            totalSkipped: 0,
            totalUnrecorded: 0
          };
        }
        
        // Check if this subject had classes on this day
        const dayData = userData.history?.[dateStr];
        if (dayData && dayData[subjectCode] !== undefined) {
          scheduled++;
          dailyReport[dateStr].totalScheduled++;
          totalClassesScheduled++;
          
          const status = dayData[subjectCode];
          dailyReport[dateStr].subjects[subjectCode] = {
            name: subjectName,
            status: status,
            type: isLab ? 'lab' : isTraining ? 'training' : 'regular'
          };
          
          if (status === 'attended') {
            attended++;
            dailyReport[dateStr].totalAttended++;
            totalClassesAttended++;
          } else if (status === 'skipped') {
            skipped++;
            dailyReport[dateStr].totalSkipped++;
            totalClassesSkipped++;
          } else {
            unrecorded++;
            dailyReport[dateStr].totalUnrecorded++;
            totalUnrecorded++;
          }
        }
      }
      
      if (scheduled > 0) {
        const percentage = attended > 0 ? Math.round((attended / scheduled) * 100) : 0;
        const weight = isLab ? 2 : 1;
        
        subjectWiseReport[subjectCode] = {
          name: subjectName,
          attended: attended,
          skipped: skipped,
          unrecorded: unrecorded,
          scheduled: scheduled,
          percentage: percentage,
          type: isLab ? 'lab' : isTraining ? 'training' : 'regular',
          weight: weight,
          trend: percentage >= 80 ? 'good' : percentage >= 75 ? 'warning' : 'critical'
        };
      }
    });
    
    // Calculate overall week performance
    const weekPercentage = totalClassesScheduled > 0 ? 
      Math.round((totalClassesAttended / totalClassesScheduled) * 100) : 0;
    
    // Get ECA activities for the week
    const ecaActivities = [];
    if (userData.ecaRecords) {
      Object.entries(userData.ecaRecords).forEach(([date, eca]) => {
        const ecaDate = new Date(date);
        if (ecaDate >= weekRange.start && ecaDate <= weekRange.end) {
          ecaActivities.push({
            date: date,
            event: eca.event,
            count: eca.count || 1,
            timestamp: eca.timestamp
          });
        }
      });
    }
    
    // Generate insights and recommendations
    const insights = generateWeeklyInsights(subjectWiseReport, weekPercentage, ecaActivities);
    
    // Generate study plan based on performance
    const studyPlan = generateStudyPlan ? generateWeeklyStudyPlan(subjectWiseReport, insights, finalStudentName) : null;
    
    // Generate AI prompt for enhanced analysis
    const aiPrompt = generateAIPrompt(finalStudentName, subjectWiseReport, weekPercentage, ecaActivities, weekInCycle);
    
    // Calculate overall attendance up to this week
    const overallAttendance = calculateSubjectAttendance ? 
      Object.keys(subjects).reduce((acc, code) => {
        const subjectPercentage = calculateSubjectAttendance(userData, code);
        return acc + subjectPercentage;
      }, 0) / Object.keys(subjects).length : weekPercentage;
    
    const report = {
      // Report metadata - using consistent key format
      id: `${weekInCycle}-${weekRange.startStr}`,
      generatedAt: new Date(),
      studentName: finalStudentName,
      
      // Week information
      weekInCycle: weekInCycle,
      weekRange: {
        start: weekRange.start,
        end: weekRange.end,
        startStr: weekRange.startStr,
        endStr: weekRange.endStr
      },
      isCompleted: isCompleted,
      
      // Summary statistics
      summary: {
        totalClassesScheduled: totalClassesScheduled,
        totalClassesAttended: totalClassesAttended,
        totalClassesSkipped: totalClassesSkipped,
        totalUnrecorded: totalUnrecorded,
        weekPercentage: weekPercentage,
        overallAttendance: Math.round(overallAttendance),
        ecaCount: ecaActivities.length
      },
      
      // Detailed breakdowns
      subjectWiseReport: subjectWiseReport,
      dailyReport: dailyReport,
      ecaActivities: ecaActivities,
      
      // AI hints and insights
      hints: hints,
      insights: insights,
      studyPlan: studyPlan,
      aiPrompt: aiPrompt,
      
      // Performance indicators
      performance: {
        grade: getPerformanceGrade(weekPercentage),
        improvement: calculateImprovementTrend(userData, weekRange),
        criticalSubjects: Object.values(subjectWiseReport)
          .filter(subject => subject.percentage < 75)
          .map(s => s.name),
        excellentSubjects: Object.values(subjectWiseReport)
          .filter(subject => subject.percentage >= 90)
          .map(s => s.name)
      }
    };
    
    return report;
  } catch (error) {
    console.error('Error generating weekly report:', error);
    return null;
  }
}

// Generate AI-powered insights
function generateWeeklyInsights(subjectWiseReport, weekPercentage, ecaActivities) {
  const insights = [];
  const subjects = Object.values(subjectWiseReport);
  
  // Overall performance insight
  if (weekPercentage >= 90) {
    insights.push({
      type: 'success',
      title: '🏆 Excellent Week!',
      message: `Outstanding performance with ${weekPercentage}% attendance. Keep up the great work!`,
      priority: 'high'
    });
  } else if (weekPercentage >= 80) {
    insights.push({
      type: 'good',
      title: '👍 Good Performance',
      message: `Solid week with ${weekPercentage}% attendance. You're on track for your 80% goal.`,
      priority: 'medium'
    });
  } else if (weekPercentage >= 75) {
    insights.push({
      type: 'warning',
      title: '⚠️ Needs Attention',
      message: `${weekPercentage}% attendance is below the 80% target. Focus on consistency next week.`,
      priority: 'high'
    });
  } else {
    insights.push({
      type: 'critical',
      title: '🚨 Critical Alert',
      message: `${weekPercentage}% attendance is concerning. Immediate improvement needed to avoid academic issues.`,
      priority: 'critical'
    });
  }
  
  // Subject-specific insights
  const criticalSubjects = subjects.filter(s => s.percentage < 75);
  if (criticalSubjects.length > 0) {
    insights.push({
      type: 'warning',
      title: '📚 Subject Focus Needed',
      message: `${criticalSubjects.map(s => s.name).join(', ')} need attention. Consider makeup classes.`,
      priority: 'high'
    });
  }
  
  const excellentSubjects = subjects.filter(s => s.percentage >= 95);
  if (excellentSubjects.length > 0) {
    insights.push({
      type: 'success',
      title: '⭐ Subject Excellence',
      message: `Perfect attendance in ${excellentSubjects.map(s => s.name).join(', ')}. Great job!`,
      priority: 'low'
    });
  }
  
  // ECA insights
  if (ecaActivities.length > 0) {
    const totalEcaCredits = ecaActivities.reduce((sum, eca) => sum + eca.count, 0);
    insights.push({
      type: 'info',
      title: '🎯 ECA Participation',
      message: `${totalEcaCredits} ECA credit${totalEcaCredits > 1 ? 's' : ''} earned this week. Great for overall attendance!`,
      priority: 'medium'
    });
  }
  
  // Lab class insights
  const labSubjects = subjects.filter(s => s.type === 'lab');
  const labPerformance = labSubjects.length > 0 ? 
    labSubjects.reduce((sum, s) => sum + s.percentage, 0) / labSubjects.length : 0;
  
  if (labSubjects.length > 0 && labPerformance < 80) {
    insights.push({
      type: 'warning',
      title: '🧪 Lab Focus Required',
      message: `Lab classes average ${Math.round(labPerformance)}%. Remember: labs count as 2x regular classes!`,
      priority: 'high'
    });
  }
  
  return insights;
}

// Get performance grade
function getPerformanceGrade(percentage) {
  if (percentage >= 95) return { grade: 'A+', color: 'emerald', description: 'Exceptional' };
  if (percentage >= 90) return { grade: 'A', color: 'green', description: 'Excellent' };
  if (percentage >= 85) return { grade: 'B+', color: 'blue', description: 'Very Good' };
  if (percentage >= 80) return { grade: 'B', color: 'cyan', description: 'Good' };
  if (percentage >= 75) return { grade: 'C+', color: 'yellow', description: 'Satisfactory' };
  if (percentage >= 70) return { grade: 'C', color: 'orange', description: 'Needs Improvement' };
  return { grade: 'D', color: 'red', description: 'Critical' };
}

// Calculate improvement trend
function calculateImprovementTrend(userData, currentWeekRange) {
  // This is a simplified version - you could expand to compare with previous weeks
  const currentWeekStart = currentWeekRange.start;
  const prevWeekStart = new Date(currentWeekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);
  
  // For now, return neutral - can be enhanced with actual comparison logic
  return {
    direction: 'stable',
    percentage: 0,
    message: 'Maintain consistent performance'
  };
}

// Generate all available weekly reports for the user
export function generateAllWeeklyReports(userData, studentName = null, hints = null) {
  try {
    const reports = [];
    const cycleStart = new Date(userData.cycleStartDate);
    const now = new Date();
    const finalStudentName = studentName || userData.studentName || 'Student';
    
    // Calculate number of weeks in cycle so far
    const totalWeeks = getWeekInCycle(now, cycleStart);
    
    // Generate reports for each week
    for (let week = 1; week <= totalWeeks; week++) {
      const weekStartDate = new Date(cycleStart);
      weekStartDate.setDate(cycleStart.getDate() + (week - 1) * 7);
      
      // Adjust to Monday of that week
      const dayOfWeek = weekStartDate.getDay();
      const mondayOfWeek = new Date(weekStartDate);
      mondayOfWeek.setDate(weekStartDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      
      const report = generateWeeklyReport(userData, mondayOfWeek, finalStudentName, hints);
      if (report) {
        reports.push(report);
      }
    }
    
    return reports;
  } catch (error) {
    console.error('Error generating all weekly reports:', error);
    return [];
  }
}

// Get specific week report
export function getWeeklyReportForWeek(userData, weekNumber, studentName = null, hints = null) {
  try {
    const cycleStart = new Date(userData.cycleStartDate);
    const weekStartDate = new Date(cycleStart);
    weekStartDate.setDate(cycleStart.getDate() + (weekNumber - 1) * 7);
    
    // Adjust to Monday of that week
    const dayOfWeek = weekStartDate.getDay();
    const mondayOfWeek = new Date(weekStartDate);
    mondayOfWeek.setDate(weekStartDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    
    return generateWeeklyReport(userData, mondayOfWeek, studentName, hints);
  } catch (error) {
    console.error(`Error generating report for week ${weekNumber}:`, error);
    return null;
  }
}

// Check if week should be auto-generated (completed but no report exists)
export function shouldAutoGenerateReport(userData, existingReports, weekNumber) {
  try {
    const cycleStart = new Date(userData.cycleStartDate);
    const weekStartDate = new Date(cycleStart);
    weekStartDate.setDate(cycleStart.getDate() + (weekNumber - 1) * 7);
    
    // Check if week is completed
    if (!isWeekCompleted(weekStartDate)) {
      return false;
    }
    
    // Check if report already exists for this week
    const weekRange = getWeekDateRange(weekStartDate);
    const reportExists = existingReports.some(report => 
      report.weekInCycle === weekNumber && 
      report.weekRange.startStr === weekRange.startStr
    );
    
    return !reportExists;
  } catch (error) {
    console.error(`Error checking auto-generation for week ${weekNumber}:`, error);
    return false;
  }
}

// Generate AI prompt for enhanced analysis
function generateAIPrompt(studentName, subjectWiseReport, weekPercentage, ecaActivities, weekInCycle) {
  const subjects = Object.values(subjectWiseReport);
  const criticalSubjects = subjects.filter(s => s.percentage < 75);
  const excellentSubjects = subjects.filter(s => s.percentage >= 90);
  
  let prompt = `Analyze ${studentName}'s academic performance for Week ${weekInCycle}:\n\n`;
  prompt += `Overall Attendance: ${weekPercentage}%\n\n`;
  
  prompt += `Subject Performance:\n`;
  subjects.forEach(subject => {
    prompt += `- ${subject.name}: ${subject.percentage}% (${subject.attended}/${subject.scheduled} classes)\n`;
  });
  
  if (ecaActivities.length > 0) {
    prompt += `\nECA Activities: ${ecaActivities.length} activities completed\n`;
  }
  
  prompt += `\nProvide personalized insights, motivation, and actionable study recommendations for ${studentName}.`;
  
  return prompt;
}

// Generate weekly study plan based on performance
function generateWeeklyStudyPlan(subjectWiseReport, insights, studentName) {
  const subjects = Object.values(subjectWiseReport);
  const criticalSubjects = subjects.filter(s => s.percentage < 75);
  const warningSubjects = subjects.filter(s => s.percentage >= 75 && s.percentage < 85);
  const goodSubjects = subjects.filter(s => s.percentage >= 85);
  
  const studyPlan = {
    title: `Personalized Study Plan for ${studentName}`,
    weeklyGoals: [],
    priorityActions: [],
    studySchedule: {},
    motivationalMessage: ""
  };
  
  // Set weekly goals
  if (criticalSubjects.length > 0) {
    studyPlan.weeklyGoals.push(`🎯 Critical Priority: Improve ${criticalSubjects.map(s => s.name).join(', ')} attendance to 75%+`);
  }
  
  if (warningSubjects.length > 0) {
    studyPlan.weeklyGoals.push(`📈 Growth Target: Boost ${warningSubjects.map(s => s.name).join(', ')} to 85%+ attendance`);
  }
  
  studyPlan.weeklyGoals.push(`🏆 Excellence Goal: Maintain overall attendance above 80%`);
  
  // Priority actions
  if (criticalSubjects.length > 0) {
    studyPlan.priorityActions.push({
      action: "Schedule Makeup Classes",
      subjects: criticalSubjects.map(s => s.name),
      urgency: "high",
      description: "Immediately arrange makeup sessions for these subjects to avoid academic issues"
    });
  }
  
  studyPlan.priorityActions.push({
    action: "Create Daily Study Routine",
    subjects: [...criticalSubjects, ...warningSubjects].map(s => s.name),
    urgency: criticalSubjects.length > 0 ? "high" : "medium",
    description: "Establish consistent study habits for these subjects"
  });
  
  if (goodSubjects.length > 0) {
    studyPlan.priorityActions.push({
      action: "Maintain Excellence",
      subjects: goodSubjects.map(s => s.name),
      urgency: "low",
      description: "Continue current approach for these well-performing subjects"
    });
  }
  
  // Study schedule suggestions
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  days.forEach((day, index) => {
    const dailySubjects = subjects.slice(index % subjects.length, (index % subjects.length) + 2);
    studyPlan.studySchedule[day] = {
      morning: dailySubjects[0] ? `Review ${dailySubjects[0].name} (${dailySubjects[0].percentage < 75 ? 'Priority' : 'Maintenance'})` : 'Free study time',
      evening: dailySubjects[1] ? `Practice ${dailySubjects[1].name} (${dailySubjects[1].percentage < 75 ? 'Priority' : 'Maintenance'})` : 'Revision time'
    };
  });
  
  // Motivational message
  const overallPercentage = subjects.reduce((sum, s) => sum + s.percentage, 0) / subjects.length;
  if (overallPercentage >= 90) {
    studyPlan.motivationalMessage = `🌟 Outstanding work, ${studentName}! You're setting an excellent example. Keep this momentum going!`;
  } else if (overallPercentage >= 80) {
    studyPlan.motivationalMessage = `💪 Great job, ${studentName}! You're on the right track. A little more consistency will get you to excellence!`;
  } else if (overallPercentage >= 70) {
    studyPlan.motivationalMessage = `🎯 ${studentName}, you have great potential! Focus on the priority subjects and you'll see rapid improvement!`;
  } else {
    studyPlan.motivationalMessage = `🚀 ${studentName}, this is your comeback moment! Every great student faces challenges - let's turn this around together!`;
  }
  
  return studyPlan;
}
