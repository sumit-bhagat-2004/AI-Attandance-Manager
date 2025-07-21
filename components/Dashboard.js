import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClerk } from '@clerk/nextjs';
import { 
    UserIcon, 
    CalendarDaysIcon, 
    TableCellsIcon,
    SparklesIcon,
    TrophyIcon,
    BellIcon,
    BookOpenIcon,
    AcademicCapIcon,
    Bars3Icon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { LogOut } from 'lucide-react';
import Confetti from 'react-confetti';
import ScheduleView from './ScheduleView';
import CalendarView from './CalendarView';
import StatsPanel from './StatsPanel';
import StatsView from './StatsView';
import MakeupSection from './MakeupSection';
import MakeupView from './MakeupView';
import GeminiResultModal from './GeminiResultModal';
import MakeupModal from './MakeupModal';
import ECAManagerModal from './ECAManagerModal';
import ReportManagerModal from './ReportManagerModal';
import PWAInstallPrompt from './PWAInstallPrompt';
import Footer from './Footer';
import { cn, formatDate } from '../lib/utils';
import { subjects, calculateTotalClassesHeld, getEffectiveCycleStartDate } from '../lib/scheduleData';
import { DateControlPanel } from '../lib/dateUtils';
import { generateWeeklyReport, generateAllWeeklyReports, getWeeklyReportForWeek, shouldAutoGenerateReport } from '../lib/weeklyReportGenerator';

// Local implementation with proper weightings
const calculateOverallAttendanceLocal = (userData) => {
  try {
    if (!userData || !userData.history) return 0;

    const allSubjects = Object.keys(subjects);
    const regularSubjects = allSubjects.filter(
      (code) => !code.startsWith('LAB') && !code.startsWith('TRAIN')
    );
    const labSubjects = allSubjects.filter((code) => code.startsWith('LAB'));

    if (regularSubjects.length === 0 && labSubjects.length === 0) return 0;

    let totalWeightedAttended = 0;
    let totalWeightedClasses = 0;

    // Calculate regular subjects (weight = 1)
    regularSubjects.forEach((code) => {
      const attendedCount = Object.values(userData.history).reduce((acc, day) => {
        return acc + (day[code] === 'attended' ? 1 : 0);
      }, 0);

      // Use effective cycle start date (earliest date in history or cycle start date)
      const effectiveStartDate = getEffectiveCycleStartDate(userData);
      
      const totalHeld = calculateTotalClassesHeld(
        code,
        effectiveStartDate,
        new Date()
      );

      // Regular subjects have weight = 1
      totalWeightedAttended += attendedCount * 1;
      totalWeightedClasses += totalHeld * 1;
    });

    // Calculate lab subjects (weight = 2)
    labSubjects.forEach((code) => {
      const attendedCount = Object.values(userData.history).reduce((acc, day) => {
        return acc + (day[code] === 'attended' ? 1 : 0);
      }, 0);

      // Use effective cycle start date (earliest date in history or cycle start date)
      const effectiveStartDate = getEffectiveCycleStartDate(userData);
      
      const totalHeld = calculateTotalClassesHeld(
        code,
        effectiveStartDate,
        new Date()
      );

      // Lab subjects have weight = 2
      totalWeightedAttended += attendedCount * 2;
      totalWeightedClasses += totalHeld * 2;
    });

    // Add ECA credits (weight = 1 each)
    if (userData.ecaRecords) {
      const ecaCredits = Object.values(userData.ecaRecords).reduce((total, eca) => {
        return total + (eca.count || 1);
      }, 0);
      
      // Each ECA adds 1 weighted attendance point
      totalWeightedAttended += ecaCredits * 1;
    }

    if (totalWeightedClasses === 0) return 100;
    return Math.min(Math.round((totalWeightedAttended / totalWeightedClasses) * 100), 100);
  } catch (error) {
    console.error('Error calculating overall attendance:', error);
    return 0;
  }
};

export default function Dashboard({ currentUser, userFullName, userProfilePicture, onLogout }) {
    const { signOut } = useClerk();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('schedule');
    const [geminiResult, setGeminiResult] = useState({ show: false, title: '', content: '', isLoading: false });
    const [showConfetti, setShowConfetti] = useState(false);
    const [showMakeupModal, setShowMakeupModal] = useState(false);
    const [selectedMakeupSubject, setSelectedMakeupSubject] = useState(null);
    const [selectedMakeupIndex, setSelectedMakeupIndex] = useState(0);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showECAModal, setShowECAModal] = useState(false);
    const [isAddingECA, setIsAddingECA] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [weeklyReports, setWeeklyReports] = useState([]);
    const [isGeneratingReports, setIsGeneratingReports] = useState(false);

    // Debug: Log the current user
    console.log('🏠 Dashboard user:', currentUser);

    // Handle logout with Clerk
    const handleLogout = async () => {
        try {
            await signOut();
            onLogout();
        } catch (error) {
            console.error('Error signing out:', error);
            onLogout();
        }
    };

    // Update current date every second to reflect time travel changes
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentDate(new Date());
        }, 1000);
        
        return () => clearInterval(interval);
    }, []);

    // Reusable function to fetch user data
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/data?user=${currentUser}`);
            if (response.ok) {
                const data = await response.json();
                setUserData(data);
            } else {
                console.error("Failed to fetch user data");
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentUser]);

    // Trigger confetti for achievements
    useEffect(() => {
        if (userData && !loading) {
            const overallPercentage = calculateOverallAttendanceLocal(userData);
            
            // Trigger confetti for excellent attendance (>= 90%)
            if (overallPercentage >= 90) {
                const hasTriggeredToday = localStorage.getItem(`confetti-${currentUser}-${new Date().toDateString()}`);
                if (!hasTriggeredToday) {
                    setShowConfetti(true);
                    setTimeout(() => setShowConfetti(false), 3000);
                    localStorage.setItem(`confetti-${currentUser}-${new Date().toDateString()}`, 'true');
                }
            }
        }
    }, [userData, loading, currentUser]);

    const updateUserData = (newUserData) => {
        setUserData(newUserData);
    };

    const handleMakeupSelection = async (targetClass, makeupInfo = null) => {
        try {
            // Use provided makeupInfo or fall back to current state
            const subjectToMakeup = makeupInfo?.subject || selectedMakeupSubject || userData.makeup?.subjectToMakeup;
            const makeupIndex = makeupInfo?.index !== undefined ? makeupInfo.index : selectedMakeupIndex;

            const response = await fetch('/api/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    action: 'setMakeup', 
                    payload: { 
                        user: currentUser, 
                        targetClass,
                        subjectToMakeup,
                        makeupIndex
                    } 
                }),
            });
            const data = await response.json();
            if (response.ok) {
                updateUserData(data.updatedData);
                setShowMakeupModal(false);
                setSelectedMakeupSubject(null);
                setSelectedMakeupIndex(0);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error("Failed to set makeup class:", error);
        }
    };

    // Handle makeup class rescheduling - only if more optional classes available and no pending makeups
    const handleRescheduleMakeup = async (subjectToMakeup, makeupIndex) => {
        try {
            // Check if rescheduling is allowed
            const currentMakeups = userData.makeups || [];
            const pendingMakeups = currentMakeups.filter(m => !m.makeupTarget);
            
            if (pendingMakeups.length > 1) {
                alert("Please complete all pending makeup selections before rescheduling.");
                return;
            }

            // Check if more optional classes are available
            const response = await fetch('/api/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'checkOptionalClasses',
                    payload: { user: currentUser, subjectToMakeup }
                }),
            });
            
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message);
            }

            if (!data.hasMoreOptionalClasses) {
                alert("No more optional classes available for rescheduling. All available slots are occupied.");
                return;
            }

            // Open makeup modal for rescheduling
            setSelectedMakeupSubject(subjectToMakeup);
            setSelectedMakeupIndex(makeupIndex);
            setShowMakeupModal(true);
            
        } catch (error) {
            console.error("Failed to reschedule makeup:", error);
            alert("Error rescheduling makeup class. Please try again.");
        }
    };

    // Handle makeup class removal
    const handleRemoveMakeup = async (subjectToMakeup, makeupIndex) => {
        try {
            const confirmed = window.confirm(
                "Are you sure you want to remove this makeup class? This will affect your mandatory attendance requirements."
            );
            
            if (!confirmed) return;

            const response = await fetch('/api/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'removeMakeup',
                    payload: { 
                        user: currentUser, 
                        subjectToMakeup,
                        makeupIndex
                    }
                }),
            });
            
            const data = await response.json();
            if (response.ok) {
                updateUserData(data.updatedData);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error("Failed to remove makeup:", error);
            alert("Error removing makeup class. Please try again.");
        }
    };

    // Generate enhanced AI prompt with comprehensive context
    const generateEnhancedAIPrompt = async (report, studentName) => {
        const dateRange = `${new Date(report.weekRange.start).toLocaleDateString()} to ${new Date(report.weekRange.end).toLocaleDateString()}`;
        const subjects = Object.values(report.subjectWiseReport);
        const criticalSubjects = subjects.filter(s => s.percentage < 75);
        const excellentSubjects = subjects.filter(s => s.percentage >= 90);
        const averageSubjects = subjects.filter(s => s.percentage >= 75 && s.percentage < 90);
        const missedClasses = subjects.filter(s => s.attended < s.scheduled);
        
        // Calculate total classes and detailed statistics
        const totalScheduled = subjects.reduce((sum, s) => sum + s.scheduled, 0);
        const totalAttended = subjects.reduce((sum, s) => sum + s.attended, 0);
        const totalMissed = totalScheduled - totalAttended;
        
        // Fetch class topics/hints for this period
        let classHints = '';
        let detailedTopics = [];
        try {
            const hintsResponse = await fetch(`/api/topics?user=${currentUser}&dateRange=${report.weekRange.startStr}_${report.weekRange.endStr}`);
            if (hintsResponse.ok) {
                const hintsData = await hintsResponse.json();
                detailedTopics = hintsData.topics;
                classHints = hintsData.topics.map(topic => 
                    `• ${topic.subjectName} (${topic.date}): ${topic.topicHint}`
                ).join('\n');
            }
        } catch (error) {
            console.log('No class hints available for this period');
        }
        
        let prompt = `You are an expert academic advisor and motivational coach. Create an EXTREMELY DETAILED, COMPREHENSIVE, and LONG academic performance analysis and study plan for ${studentName}. This report must be substantial - minimum 2000 words with extensive detail in every section.\n\n`;
        
        prompt += `**STUDENT PROFILE & CONTEXT:**\n`;
        prompt += `Student Name: ${studentName}\n`;
        prompt += `Analysis Period: Week ${report.weekInCycle} (${dateRange})\n`;
        prompt += `Week Performance: ${report.summary.weekPercentage}% attendance\n`;
        prompt += `Cumulative Performance: ${report.summary.overallAttendance}% overall attendance\n`;
        prompt += `Total Classes This Week: ${totalScheduled} scheduled, ${totalAttended} attended, ${totalMissed} missed\n`;
        prompt += `Academic Phase: ${report.isCompleted ? 'Week Completed - Comprehensive Final Analysis' : 'Week In Progress - Detailed Interim Assessment'}\n`;
        prompt += `Report Generation Date: ${new Date().toLocaleDateString()}\n\n`;
        
        prompt += `**COMPREHENSIVE SUBJECT-BY-SUBJECT ANALYSIS:**\n`;
        prompt += `Provide detailed analysis for each subject with extensive commentary:\n\n`;
        
        subjects.forEach((subject, index) => {
            const typeWeight = subject.type === 'lab' ? 'Laboratory (2x Weight)' : 
                             subject.type === 'training' ? 'Training/Practical' : 'Theory/Lecture';
            const missedCount = subject.scheduled - subject.attended;
            const statusIcon = subject.percentage < 75 ? '🔴 CRITICAL' : 
                             subject.percentage >= 90 ? '🟢 EXCELLENT' : '🟡 MODERATE';
            const attendanceGrade = subject.percentage >= 95 ? 'A+' : 
                                  subject.percentage >= 90 ? 'A' : 
                                  subject.percentage >= 85 ? 'B+' : 
                                  subject.percentage >= 80 ? 'B' : 
                                  subject.percentage >= 75 ? 'C+' : 
                                  subject.percentage >= 70 ? 'C' : 
                                  subject.percentage >= 65 ? 'D' : 'F';
            
            prompt += `${index + 1}. **${subject.name}** ${statusIcon}\n`;
            prompt += `   • Course Type: ${typeWeight}\n`;
            prompt += `   • Attendance Performance: ${subject.percentage}% (Grade: ${attendanceGrade})\n`;
            prompt += `   • Classes Statistics: ${subject.attended} attended out of ${subject.scheduled} scheduled\n`;
            if (missedCount > 0) {
                prompt += `   • ⚠️ Classes Missed: ${missedCount} (${((missedCount/subject.scheduled)*100).toFixed(1)}% absence rate)\n`;
                prompt += `   • Missing Class Impact: ${missedCount < 2 ? 'Minor impact' : missedCount < 4 ? 'Moderate concern' : 'Major academic risk'}\n`;
            }
            prompt += `   • Performance Trend: ${subject.percentage < 75 ? 'DECLINING - Requires immediate intervention and recovery plan' : 
                                               subject.percentage >= 90 ? 'EXCELLENT - Maintain this outstanding performance' : 
                                               'STABLE - Has potential for improvement'}\n`;
            
            // Add topic-specific details if available
            const subjectTopics = detailedTopics.filter(t => t.subjectName === subject.name);
            if (subjectTopics.length > 0) {
                prompt += `   • Topics Covered This Week:\n`;
                subjectTopics.forEach(topic => {
                    prompt += `     - ${topic.date}: ${topic.topicHint}\n`;
                });
            }
            prompt += `\n`;
        });
        
        if (classHints) {
            prompt += `**DETAILED WEEKLY CURRICULUM COVERAGE:**\n`;
            prompt += `${classHints}\n\n`;
        }
        
        prompt += `**CRITICAL AREAS REQUIRING IMMEDIATE ATTENTION:**\n`;
        if (criticalSubjects.length > 0) {
            criticalSubjects.forEach(subject => {
                const missedCount = subject.scheduled - subject.attended;
                prompt += `• **${subject.name}** - ${subject.percentage}% attendance (URGENT)\n`;
                prompt += `  - Risk Level: HIGH - Below minimum 75% requirement\n`;
                prompt += `  - Missing Classes: ${missedCount} out of ${subject.scheduled}\n`;
                prompt += `  - Immediate Actions Required: Attend all remaining classes, arrange makeup sessions, intensive study plan\n`;
                prompt += `  - Academic Consequences: Risk of failing attendance requirement, potential debarment from exams\n`;
                prompt += `  - Recovery Timeline: Immediate action required within next 1-2 weeks\n\n`;
            });
        } else {
            prompt += `✅ Excellent news ${studentName}! No subjects are currently in critical status. All subjects meet minimum attendance requirements.\n\n`;
        }
        
        if (excellentSubjects.length > 0) {
            prompt += `**OUTSTANDING ACHIEVEMENTS & STRENGTHS:**\n`;
            excellentSubjects.forEach(subject => {
                prompt += `🌟 **${subject.name}** - ${subject.percentage}% attendance (EXEMPLARY)\n`;
                prompt += `  - Performance Level: OUTSTANDING - Exceeds expectations\n`;
                prompt += `  - Consistency: ${subject.attended}/${subject.scheduled} - Highly reliable attendance pattern\n`;
                prompt += `  - Academic Advantage: Strong foundation for excellent exam performance\n`;
                prompt += `  - Maintenance Strategy: Continue current approach, consider peer mentoring opportunities\n\n`;
            });
        }
        
        if (averageSubjects.length > 0) {
            prompt += `**SUBJECTS WITH IMPROVEMENT POTENTIAL:**\n`;
            averageSubjects.forEach(subject => {
                const missedCount = subject.scheduled - subject.attended;
                prompt += `📈 **${subject.name}** - ${subject.percentage}% attendance (GOOD, CAN IMPROVE)\n`;
                prompt += `  - Current Status: Meeting requirements but has room for excellence\n`;
                prompt += `  - Missed Opportunities: ${missedCount} classes missed\n`;
                prompt += `  - Improvement Potential: Can achieve 90%+ with focused effort\n`;
                prompt += `  - Action Plan: Maintain current attendance, minimize future absences\n\n`;
            });
        }
        
        if (report.summary.ecaCount > 0) {
            prompt += `**EXTRACURRICULAR ENGAGEMENT ANALYSIS:**\n`;
            prompt += `🏆 Outstanding holistic development! ${studentName} completed ${report.summary.ecaCount} extracurricular activities this week.\n`;
            prompt += `• Benefits: Demonstrates well-rounded personality, leadership skills, time management\n`;
            prompt += `• Academic Balance: Successfully managing academics alongside extracurricular commitments\n`;
            prompt += `• Career Advantage: ECA participation enhances college applications and career prospects\n`;
            prompt += `• Recommendation: Continue balanced approach between academics and extracurricular activities\n\n`;
        }
        
        prompt += `**MANDATORY DETAILED STUDY PLAN & RECOVERY STRATEGY:**\n`;
        prompt += `Create an extensive, day-by-day study plan with the following mandatory sections:\n\n`;
        
        prompt += `**WEEKLY STUDY SCHEDULE (Minimum 1000 words):**\n`;
        prompt += `1. **Monday to Friday Daily Schedule:**\n`;
        prompt += `   - Create hour-by-hour study schedule from 6 AM to 10 PM\n`;
        prompt += `   - Include specific time slots for each subject\n`;
        prompt += `   - Allocate extra time for critical subjects\n`;
        prompt += `   - Include break times, meal times, and recreation\n`;
        prompt += `   - Specify study techniques for each time slot\n\n`;
        
        prompt += `2. **Weekend Intensive Study Plan:**\n`;
        prompt += `   - Saturday: Deep dive into most challenging subjects\n`;
        prompt += `   - Sunday: Review, practice tests, and preparation for upcoming week\n`;
        prompt += `   - Include time for completing pending assignments\n`;
        prompt += `   - Schedule for catching up on missed class topics\n\n`;
        
        prompt += `**SUBJECT-SPECIFIC RECOVERY PLANS:**\n`;
        if (missedClasses.length > 0) {
            missedClasses.forEach(subject => {
                const missedCount = subject.scheduled - subject.attended;
                prompt += `\n**${subject.name} Recovery Plan:**\n`;
                prompt += `• Classes Missed: ${missedCount}\n`;
                prompt += `• Recovery Strategy: [Provide detailed 500+ word recovery plan]\n`;
                prompt += `• Study Materials Needed: [List specific resources]\n`;
                prompt += `• Timeline: [Detailed weekly schedule to catch up]\n`;
                prompt += `• Assessment Method: [How to test understanding]\n`;
                prompt += `• Peer Support: [Collaboration strategies]\n`;
            });
        }
        
        prompt += `\n**ATTENDANCE IMPROVEMENT STRATEGY (Minimum 800 words):**\n`;
        prompt += `Create a comprehensive attendance improvement plan including:\n`;
        prompt += `1. **Root Cause Analysis:** Identify why classes were missed\n`;
        prompt += `2. **Prevention Strategies:** Specific steps to avoid future absences\n`;
        prompt += `3. **Motivation Techniques:** Personal motivation strategies\n`;
        prompt += `4. **Accountability System:** How to track and maintain attendance\n`;
        prompt += `5. **Support System:** Who can help maintain consistency\n`;
        prompt += `6. **Contingency Plans:** What to do when unavoidable absences occur\n\n`;
        
        prompt += `**MOTIVATIONAL SECTION (Minimum 600 words):**\n`;
        prompt += `1. **Personal Achievements Recognition:** Celebrate ${studentName}'s successes\n`;
        prompt += `2. **Growth Mindset Development:** How challenges lead to growth\n`;
        prompt += `3. **Future Vision:** Connect current efforts to future goals\n`;
        prompt += `4. **Success Visualization:** Paint a picture of academic success\n`;
        prompt += `5. **Daily Affirmations:** Positive statements for daily motivation\n`;
        prompt += `6. **Milestone Celebrations:** How to reward progress\n\n`;
        
        prompt += `**RESOURCE RECOMMENDATIONS (Minimum 400 words):**\n`;
        prompt += `1. **Study Materials:** Textbooks, online resources, apps\n`;
        prompt += `2. **Study Groups:** How to form and participate effectively\n`;
        prompt += `3. **Faculty Support:** How to seek help from professors\n`;
        prompt += `4. **Technology Tools:** Apps and platforms for learning\n`;
        prompt += `5. **Time Management Tools:** Planners, apps, techniques\n`;
        prompt += `6. **Health and Wellness:** Resources for maintaining balance\n\n`;
        
        prompt += `**WEEKLY GOALS & TARGETS (Minimum 300 words):**\n`;
        prompt += `Set specific, measurable, achievable, relevant, and time-bound (SMART) goals:\n`;
        prompt += `1. **This Week's Targets:** Immediate goals for the next 7 days\n`;
        prompt += `2. **Monthly Objectives:** Goals for the next 4 weeks\n`;
        prompt += `3. **Semester Vision:** Long-term academic targets\n`;
        prompt += `4. **Progress Metrics:** How to measure success\n`;
        prompt += `5. **Review Schedule:** When and how to assess progress\n\n`;
        
        prompt += `**MANDATORY FORMATTING & LENGTH REQUIREMENTS:**\n`;
        prompt += `- Total response must be minimum 2000 words\n`;
        prompt += `- Use proper markdown formatting with headers, bullet points, and emphasis\n`;
        prompt += `- Address ${studentName} directly throughout using their name frequently\n`;
        prompt += `- Include specific examples and actionable advice\n`;
        prompt += `- Make it personal, encouraging, and motivational\n`;
        prompt += `- Use emojis and visual elements to make it engaging\n`;
        prompt += `- Include time-specific recommendations and deadlines\n`;
        prompt += `- Provide both short-term and long-term guidance\n\n`;
        
        prompt += `Remember: This is ${studentName}'s personal academic roadmap. Make it comprehensive, detailed, inspiring, and actionable. Every section should be substantial and provide real value for their academic journey.`;
        
        return prompt;
    };

    // ECA Management Functions
    const handleAddECA = async (ecaData) => {
        setIsAddingECA(true);
        try {
            const response = await fetch('/api/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'logECA',
                    payload: {
                        user: currentUser,
                        ...ecaData
                    }
                }),
            });
            
            const data = await response.json();
            if (response.ok) {
                // Refresh user data to show updated attendance
                await fetchData();
                
                // Show success notification
                setGeminiResult({ 
                    show: true, 
                    title: '✅ ECA Added Successfully!', 
                    content: `${ecaData.event} has been recorded and will boost your attendance percentage.`, 
                    isLoading: false 
                });
                
                setTimeout(() => {
                    setGeminiResult(prev => ({ ...prev, show: false }));
                }, 3000);
                
                // Close modal
                setShowECAModal(false);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error("Failed to add ECA:", error);
            setGeminiResult({ 
                show: true, 
                title: '❌ Error Adding ECA', 
                content: error.message, 
                isLoading: false 
            });
        } finally {
            setIsAddingECA(false);
        }
    };

    const handleUpdateECA = async (originalDate, updatedData) => {
        setIsAddingECA(true);
        try {
            const response = await fetch('/api/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'updateECA',
                    payload: {
                        user: currentUser,
                        originalDate,
                        ...updatedData
                    }
                }),
            });
            
            const data = await response.json();
            if (response.ok) {
                await fetchData();
                setGeminiResult({ 
                    show: true, 
                    title: '✅ ECA Updated Successfully!', 
                    content: `${updatedData.event} has been updated.`, 
                    isLoading: false 
                });
                setTimeout(() => setGeminiResult(prev => ({ ...prev, show: false })), 3000);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error("Failed to update ECA:", error);
            setGeminiResult({ 
                show: true, 
                title: '❌ Error Updating ECA', 
                content: error.message, 
                isLoading: false 
            });
        } finally {
            setIsAddingECA(false);
        }
    };

    const handleDeleteECA = async (date) => {
        setIsAddingECA(true);
        try {
            const response = await fetch('/api/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'deleteECA',
                    payload: {
                        user: currentUser,
                        date
                    }
                }),
            });
            
            const data = await response.json();
            if (response.ok) {
                await fetchData();
                setGeminiResult({ 
                    show: true, 
                    title: '✅ ECA Deleted Successfully!', 
                    content: 'ECA record has been removed.', 
                    isLoading: false 
                });
                setTimeout(() => setGeminiResult(prev => ({ ...prev, show: false })), 3000);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error("Failed to delete ECA:", error);
            setGeminiResult({ 
                show: true, 
                title: '❌ Error Deleting ECA', 
                content: error.message, 
                isLoading: false 
            });
        } finally {
            setIsAddingECA(false);
        }
    };

    // Weekly Report Functions
    const loadWeeklyReports = async () => {
        try {
            const response = await fetch('/api/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'getWeeklyReports',
                    payload: { user: currentUser }
                }),
            });
            
            const data = await response.json();
            if (response.ok) {
                setWeeklyReports(data.reports || []);
            } else {
                console.error('Failed to load weekly reports:', data.message);
            }
        } catch (error) {
            console.error('Error loading weekly reports:', error);
        }
    };

    const generateAndSaveWeeklyReports = async () => {
        setIsGeneratingReports(true);
        try {
            const studentName = userFullName || userData.studentName || userData.username || 'Student';
            
            // Show initial progress
            setGeminiResult({ 
                show: true, 
                title: 'Generating AI-Enhanced Weekly Reports...', 
                content: `🔄 Creating comprehensive reports for ${studentName}...`, 
                isLoading: true 
            });
            
            const allReports = generateAllWeeklyReports(userData, studentName);
            let enhancedReports = [];
            
            // Process each report with AI enhancement
            for (const [index, report] of allReports.entries()) {
                try {
                    // Update progress
                    setGeminiResult(prev => ({ 
                        ...prev, 
                        content: `🤖 Enhancing Week ${report.weekInCycle} report with AI insights...` 
                    }));
                    
                    // Generate enhanced AI prompt with better structure and class hints
                    const enhancedPrompt = await generateEnhancedAIPrompt(report, studentName);
                    
                    // Get AI insights
                    const aiResponse = await fetch('/api/gemini', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            type: 'weeklyReport', 
                            payload: { 
                                history: userData.history,
                                customPrompt: enhancedPrompt,
                                studentName: studentName,
                                weekData: {
                                    weekNumber: report.weekInCycle,
                                    dateRange: `${report.weekRange.startStr} to ${report.weekRange.endStr}`,
                                    performance: report.summary.weekPercentage
                                }
                            } 
                        }),
                    });
                    
                    const aiData = await aiResponse.json();
                    
                    if (aiResponse.ok) {
                        // Combine structured report with AI insights
                        report.aiInsights = aiData.result;
                        report.enhancementTimestamp = new Date();
                    }
                    
                    enhancedReports.push(report);
                    
                } catch (error) {
                    console.error(`Error enhancing Week ${report.weekInCycle}:`, error);
                    // Keep the report without AI enhancement
                    enhancedReports.push(report);
                }
            }
            
            // Update progress
            setGeminiResult(prev => ({ 
                ...prev, 
                content: `💾 Saving ${enhancedReports.length} enhanced reports to database...` 
            }));
            
            // Save enhanced reports to database
            for (const report of enhancedReports) {
                // Check if report already exists
                const existingReport = weeklyReports.find(r => 
                    r.weekInCycle === report.weekInCycle && 
                    r.weekRange.startStr === report.weekRange.startStr
                );
                
                // Only save if it's new or if week is completed and changed
                if (!existingReport || (report.isCompleted && JSON.stringify(existingReport) !== JSON.stringify(report))) {
                    await fetch('/api/data', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: 'saveWeeklyReport',
                            payload: { 
                                user: currentUser,
                                report: report
                            }
                        }),
                    });
                }
            }
            
            // Reload reports from database
            await loadWeeklyReports();
            
            // Show success with enhanced message
            const completedReports = enhancedReports.filter(r => r.isCompleted).length;
            const inProgressReports = enhancedReports.length - completedReports;
            
            let successMessage = `✅ Generated ${enhancedReports.length} AI-enhanced reports for ${studentName}!\n\n`;
            successMessage += `📊 ${completedReports} completed weeks analyzed\n`;
            if (inProgressReports > 0) {
                successMessage += `🔄 ${inProgressReports} in-progress weeks tracked\n`;
            }
            successMessage += `🤖 All reports include personalized AI insights and study plans`;
            
            setGeminiResult({ 
                show: true, 
                title: '🎉 AI-Enhanced Reports Ready!', 
                content: successMessage, 
                isLoading: false 
            });
            
            // Show confetti for celebration
            setShowConfetti(true);
            setTimeout(() => {
                setShowConfetti(false);
                setGeminiResult(prev => ({ ...prev, show: false }));
            }, 4000);
            
        } catch (error) {
            console.error('Error generating enhanced weekly reports:', error);
            setGeminiResult({ 
                show: true, 
                title: '❌ Error Generating Enhanced Reports', 
                content: `Failed to generate AI-enhanced reports: ${error.message}`, 
                isLoading: false 
            });
        } finally {
            setIsGeneratingReports(false);
        }
    };

    const handleViewReport = (report) => {
        setGeminiResult({ 
            show: true, 
            title: `📊 Week ${report.weekInCycle} Report - ${report.studentName}`, 
            content: formatReportForDisplay(report), 
            isLoading: false 
        });
    };

    const handleDeleteReport = async (reportId) => {
        try {
            const response = await fetch('/api/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'deleteWeeklyReport',
                    payload: { 
                        user: currentUser,
                        reportId: reportId
                    }
                }),
            });
            
            if (response.ok) {
                await loadWeeklyReports();
                setGeminiResult({ 
                    show: true, 
                    title: '✅ Report Deleted', 
                    content: 'Weekly report has been removed successfully.', 
                    isLoading: false 
                });
                setTimeout(() => setGeminiResult(prev => ({ ...prev, show: false })), 2000);
            } else {
                throw new Error('Failed to delete report');
            }
        } catch (error) {
            console.error('Error deleting report:', error);
            setGeminiResult({ 
                show: true, 
                title: '❌ Error Deleting Report', 
                content: error.message, 
                isLoading: false 
            });
        }
    };

    // Load weekly reports when component mounts and when userData changes
    useEffect(() => {
        if (userData && currentUser) {
            loadWeeklyReports();
        }
    }, [userData, currentUser]);

    // Format report for display in modal
    const formatReportForDisplay = (report) => {
        const dateRange = `${new Date(report.weekRange.start).toLocaleDateString()} - ${new Date(report.weekRange.end).toLocaleDateString()}`;
        const summary = report.summary;
        
        let content = `**Week ${report.weekInCycle} Summary (${dateRange})**\n\n`;
        content += `📊 **Overall Performance**: ${summary.weekPercentage}% (${summary.totalClassesAttended}/${summary.totalClassesScheduled} classes)\n`;
        content += `📈 **Overall Attendance**: ${summary.overallAttendance}%\n`;
        content += `🎯 **ECA Activities**: ${summary.ecaCount}\n\n`;
        
        content += `**Subject Performance**:\n`;
        Object.values(report.subjectWiseReport).forEach(subject => {
            const badge = subject.type === 'lab' ? '🧪' : subject.type === 'training' ? '🏋️' : '📚';
            content += `${badge} ${subject.name}: ${subject.percentage}% (${subject.attended}/${subject.scheduled})\n`;
        });
        
        if (report.insights && report.insights.length > 0) {
            content += `\n**Key Insights**:\n`;
            report.insights.slice(0, 3).forEach(insight => {
                content += `${insight.title}\n${insight.message}\n\n`;
            });
        }
        
        return content;
    };

    // Format enhanced report with AI insights and study plan
    const formatEnhancedReportForDisplay = (report) => {
        const dateRange = `${new Date(report.weekRange.start).toLocaleDateString()} - ${new Date(report.weekRange.end).toLocaleDateString()}`;
        const summary = report.summary;
        
        let content = `**🎓 AI-Enhanced Weekly Report for ${report.studentName}**\n`;
        content += `**Week ${report.weekInCycle} (${dateRange})**\n\n`;
        
        // Performance Summary
        content += `## 📊 Performance Overview\n`;
        content += `**Overall Performance**: ${summary.weekPercentage}% (${summary.totalClassesAttended}/${summary.totalClassesScheduled} classes)\n`;
        content += `**Cumulative Attendance**: ${summary.overallAttendance}%\n`;
        content += `**ECA Participation**: ${summary.ecaCount} activities\n`;
        content += `**Performance Grade**: ${report.performance?.grade?.grade || 'N/A'}\n\n`;
        
        // Subject Breakdown
        content += `## 📚 Subject Performance\n`;
        Object.values(report.subjectWiseReport).forEach(subject => {
            const badge = subject.type === 'lab' ? '🧪' : subject.type === 'training' ? '🏋️' : '📚';
            const trendIcon = subject.trend === 'good' ? '📈' : subject.trend === 'warning' ? '⚠️' : '📉';
            content += `${badge} **${subject.name}**: ${subject.percentage}% (${subject.attended}/${subject.scheduled}) ${trendIcon}\n`;
        });
        content += `\n`;
        
        // Study Plan
        if (report.studyPlan) {
            content += `## 📋 Personalized Study Plan\n`;
            content += `${report.studyPlan.motivationalMessage}\n\n`;
            
            if (report.studyPlan.weeklyGoals.length > 0) {
                content += `**Weekly Goals:**\n`;
                report.studyPlan.weeklyGoals.forEach(goal => content += `• ${goal}\n`);
                content += `\n`;
            }
            
            if (report.studyPlan.priorityActions.length > 0) {
                content += `**Priority Actions:**\n`;
                report.studyPlan.priorityActions.forEach(action => {
                    const urgencyIcon = action.urgency === 'high' ? '🚨' : action.urgency === 'medium' ? '⚠️' : '📝';
                    content += `${urgencyIcon} **${action.action}**: ${action.description}\n`;
                    if (action.subjects.length > 0) {
                        content += `   Subjects: ${action.subjects.join(', ')}\n`;
                    }
                    content += `\n`;
                });
            }
        }
        
        // AI Insights
        if (report.aiInsights) {
            content += `## 🤖 AI Insights & Recommendations\n`;
            content += report.aiInsights + `\n\n`;
        }
        
        // Key Insights
        if (report.insights && report.insights.length > 0) {
            content += `## 💡 System Insights\n`;
            report.insights.slice(0, 4).forEach(insight => {
                const icon = insight.type === 'success' ? '✅' : 
                           insight.type === 'warning' ? '⚠️' : 
                           insight.type === 'critical' ? '🚨' : 'ℹ️';
                content += `${icon} **${insight.title}**\n${insight.message}\n\n`;
            });
        }
        
        return content;
    };

    if (loading || !userData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"
                    />
                    <h2 className="text-2xl font-bold text-white mb-2">Loading Dashboard</h2>
                    <p className="text-gray-400">Preparing your attendance data...</p>
                </div>
            </div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.5,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.4 }
        }
    };

    return (
        <>
            {/* Confetti Effect */}
            {showConfetti && (
                <Confetti
                    width={typeof window !== 'undefined' ? window.innerWidth : 300}
                    height={typeof window !== 'undefined' ? window.innerHeight : 200}
                    recycle={false}
                    numberOfPieces={200}
                    colors={['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444']}
                />
            )}
            
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="min-h-screen text-white p-4 md:p-6"
            >
                <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.header 
                    variants={itemVariants}
                    className="flex justify-between items-center pb-6 mb-6 border-b border-gray-700/50"
                >
                    {/* Logo and User Info */}
                    <div className="flex items-center space-x-4">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl blur opacity-75"></div>
                            <div className="relative bg-gradient-to-r from-cyan-500 to-purple-600 p-3 rounded-xl">
                                <BookOpenIcon className="h-6 w-6 md:h-8 md:w-8 text-white" />
                            </div>
                        </motion.div>
                        <div>
                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gradient">EduTrack AI</h1>
                            <div className="flex items-center space-x-2 mt-1">
                                {userProfilePicture ? (
                                    <div className="flex items-center space-x-2">
                                        <motion.img 
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            src={userProfilePicture} 
                                            alt="Profile"
                                            className="h-6 w-6 md:h-8 md:w-8 rounded-full border-2 border-cyan-400 object-cover cursor-pointer transition-all duration-200 hover:border-cyan-300 hover:shadow-lg hover:shadow-cyan-400/25"
                                            title="Profile Picture"
                                        />
                                        <p className="text-gray-400 text-sm md:text-base">Welcome, <span className="text-cyan-400 font-semibold">{userFullName}</span></p>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <UserIcon className="h-4 w-4 text-gray-400" />
                                        <p className="text-gray-400 text-sm md:text-base">Welcome, <span className="text-cyan-400 font-semibold">{userFullName}</span></p>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs md:text-sm text-gray-500 mt-1">{formatDate(currentDate)}</p>
                        </div>
                    </div>
                    
                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-3">
                        <div className="flex bg-gray-800/50 rounded-xl p-1">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setView('schedule')}
                                className={cn(
                                    "flex items-center px-3 py-2 rounded-lg font-medium transition-all duration-200",
                                    view === 'schedule'
                                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
                                        : "text-gray-400 hover:text-gray-300"
                                )}
                            >
                                <BookOpenIcon className="h-4 w-4 mr-2" />
                                Schedule
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setView('stats')}
                                className={cn(
                                    "flex items-center px-3 py-2 rounded-lg font-medium transition-all duration-200",
                                    view === 'stats'
                                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
                                        : "text-gray-400 hover:text-gray-300"
                                )}
                            >
                                <TrophyIcon className="h-4 w-4 mr-2" />
                                Stats
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setView('makeup')}
                                className={cn(
                                    "flex items-center px-3 py-2 rounded-lg font-medium transition-all duration-200",
                                    view === 'makeup'
                                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
                                        : "text-gray-400 hover:text-gray-300"
                                )}
                            >
                                <BellIcon className="h-4 w-4 mr-2" />
                                Makeup
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setView('calendar')}
                                className={cn(
                                    "flex items-center px-3 py-2 rounded-lg font-medium transition-all duration-200",
                                    view === 'calendar'
                                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
                                        : "text-gray-400 hover:text-gray-300"
                                )}
                            >
                                <CalendarDaysIcon className="h-4 w-4 mr-2" />
                                Calendar
                            </motion.button>
                        </div>
                        
                        {/* ECA Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowECAModal(true)}
                            className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg"
                            title="Add Extra Curricular Activity"
                        >
                            <AcademicCapIcon className="h-4 w-4 mr-2" />
                            Add ECA
                        </motion.button>
                        
                        {/* PWA Install Button */}
                        <PWAInstallPrompt 
                            variant="button" 
                            isVisible={true}
                            onClose={() => {}}
                        />
                        
                        {/* Profile Picture Section */}
                        {userProfilePicture && (
                            <motion.div 
                                whileHover={{ scale: 1.02 }}
                                className="flex items-center space-x-2 px-3 py-2 bg-gray-800/30 rounded-xl border border-gray-700/50 hover:bg-gray-800/50 hover:border-cyan-500/30 transition-all duration-200 cursor-pointer"
                                title={`Signed in as ${userFullName}`}
                            >
                                <motion.img 
                                    whileHover={{ scale: 1.1 }}
                                    src={userProfilePicture} 
                                    alt="Profile"
                                    className="h-8 w-8 rounded-full border-2 border-cyan-400 object-cover transition-all duration-200 hover:border-cyan-300 hover:shadow-lg hover:shadow-cyan-400/25"
                                />
                                <span className="text-gray-300 text-sm font-medium hidden xl:block">{userFullName}</span>
                            </motion.div>
                        )}
                        
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleLogout}
                            className="flex items-center px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 hover:text-red-300 rounded-xl font-semibold transition-all duration-200"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </motion.button>
                    </div>
                    
                    {/* Mobile Hamburger Menu */}
                    <div className="lg:hidden">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="flex items-center justify-center w-10 h-10 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-colors duration-200"
                        >
                            {isMobileMenuOpen ? (
                                <XMarkIcon className="h-6 w-6 text-gray-300" />
                            ) : (
                                <Bars3Icon className="h-6 w-6 text-gray-300" />
                            )}
                        </motion.button>
                    </div>
                </motion.header>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="lg:hidden mb-6 overflow-hidden"
                        >
                            <div className="bg-gray-800/30 rounded-xl p-4 space-y-3">
                                {/* Profile Section - Mobile */}
                                {userProfilePicture && (
                                    <motion.div 
                                        whileHover={{ scale: 1.02 }}
                                        className="flex items-center space-x-3 pb-3 border-b border-gray-700/50 hover:bg-gray-700/20 rounded-lg p-2 -m-2 transition-all duration-200 cursor-pointer"
                                        title={`Signed in as ${userFullName}`}
                                    >
                                        <motion.img 
                                            whileHover={{ scale: 1.1 }}
                                            src={userProfilePicture} 
                                            alt="Profile"
                                            className="h-10 w-10 rounded-full border-2 border-cyan-400 object-cover transition-all duration-200 hover:border-cyan-300 hover:shadow-lg hover:shadow-cyan-400/25"
                                        />
                                        <div>
                                            <p className="text-white font-medium">{userFullName}</p>
                                            <p className="text-gray-400 text-sm">{currentUser}@aot.edu.in</p>
                                        </div>
                                    </motion.div>
                                )}
                                
                                {/* Navigation Buttons */}
                                <div className="grid grid-cols-2 gap-2">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            setView('schedule');
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className={cn(
                                            "flex items-center justify-center px-3 py-3 rounded-lg font-medium transition-all duration-200",
                                            view === 'schedule'
                                                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
                                                : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
                                        )}
                                    >
                                        <BookOpenIcon className="h-4 w-4 mr-2" />
                                        Schedule
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            setView('stats');
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className={cn(
                                            "flex items-center justify-center px-3 py-3 rounded-lg font-medium transition-all duration-200",
                                            view === 'stats'
                                                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
                                                : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
                                        )}
                                    >
                                        <TrophyIcon className="h-4 w-4 mr-2" />
                                        Stats
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            setView('makeup');
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className={cn(
                                            "flex items-center justify-center px-3 py-3 rounded-lg font-medium transition-all duration-200",
                                            view === 'makeup'
                                                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
                                                : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
                                        )}
                                    >
                                        <BellIcon className="h-4 w-4 mr-2" />
                                        Makeup
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            setView('calendar');
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className={cn(
                                            "flex items-center justify-center px-3 py-3 rounded-lg font-medium transition-all duration-200",
                                            view === 'calendar'
                                                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
                                                : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
                                        )}
                                    >
                                        <CalendarDaysIcon className="h-4 w-4 mr-2" />
                                        Calendar
                                    </motion.button>
                                </div>
                                
                                {/* ECA and PWA Buttons - Mobile */}
                                <div className="grid grid-cols-2 gap-2 border-t border-gray-700/50 pt-3 mt-3">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            setShowECAModal(true);
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="flex items-center justify-center px-3 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg"
                                        title="Add Extra Curricular Activity"
                                    >
                                        <AcademicCapIcon className="h-4 w-4 mr-2" />
                                        Add ECA
                                    </motion.button>
                                    
                                    <div className="flex items-center justify-center">
                                        <PWAInstallPrompt 
                                            variant="button" 
                                            isVisible={true}
                                            onClose={() => setIsMobileMenuOpen(false)}
                                        />
                                    </div>
                                </div>
                                
                                {/* Date Control Panel - Mobile */}
                                <div className="border-t border-gray-700/50 pt-3 mt-3">
                                    <p className="text-xs text-gray-400 mb-2 text-center">🕰️ Time Machine</p>
                                    <DateControlPanel />
                                </div>
                                
                                {/* Logout Button */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        handleLogout();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="w-full flex items-center justify-center px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 hover:text-red-300 rounded-lg font-semibold transition-all duration-200"
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Logout
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Report Manager Button - Enhanced with AI Integration */}
                <motion.div variants={itemVariants} className="mb-8">
                    <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowReportModal(true)}
                        className="w-full lg:w-auto relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                        <div className="relative flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-white">
                            <motion.div
                                animate={{ 
                                    rotate: [0, 10, -10, 0],
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{ 
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            >
                                <SparklesIcon className="h-6 w-6" />
                            </motion.div>
                            <span className="text-lg">AI-Enhanced Weekly Reports & Study Plans</span>
                            {weeklyReports.length > 0 && (
                                <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                                    {weeklyReports.length}
                                </span>
                            )}
                        </div>
                    </motion.button>
                </motion.div>

                {/* Date Control Panel - Desktop (hidden on mobile) */}
                <motion.div variants={itemVariants} className="hidden lg:block mb-6">
                    <div className="bg-gray-800/30 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm text-gray-400">🕰️ Time Machine</span>
                        </div>
                        <DateControlPanel />
                    </div>
                </motion.div>

                {/* Main Content - Dynamic Layout Based on View */}
                <div className={cn(
                    "grid gap-6",
                    view === 'schedule' 
                        ? "grid-cols-1 xl:grid-cols-3" 
                        : "grid-cols-1"
                )}>
                    {/* Main Schedule Section - Full width on top for mobile, 2/3 width on desktop */}
                    <motion.div 
                        variants={itemVariants}
                        className={cn(
                            view === 'schedule' ? "xl:col-span-2 order-1" : "col-span-1"
                        )}
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={view}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="h-full"
                            >
                                {view === 'schedule' ? (
                                    <ScheduleView 
                                        user={currentUser} 
                                        userData={userData} 
                                        updateUserData={updateUserData} 
                                        setGeminiResult={setGeminiResult}
                                        setShowConfetti={setShowConfetti}
                                        onOpenMakeupModal={(subject, index = 0) => {
                                            setSelectedMakeupSubject(subject);
                                            setSelectedMakeupIndex(index);
                                            setShowMakeupModal(true);
                                        }}
                                    />
                                ) : view === 'stats' ? (
                                    <StatsView userData={userData} />
                                ) : view === 'makeup' ? (
                                    <MakeupView 
                                        userData={userData}
                                        subjects={subjects}
                                        onMakeupSelect={handleMakeupSelection}
                                    />
                                ) : view === 'calendar' ? (
                                    <CalendarView userData={userData} currentUser={currentUser} />
                                ) : (
                                    <ScheduleView 
                                        user={currentUser} 
                                        userData={userData} 
                                        updateUserData={updateUserData} 
                                        setGeminiResult={setGeminiResult}
                                        setShowConfetti={setShowConfetti}
                                        onOpenMakeupModal={(subject, index = 0) => {
                                            setSelectedMakeupSubject(subject);
                                            setSelectedMakeupIndex(index);
                                            setShowMakeupModal(true);
                                        }}
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>

                    {/* Side Panel - Stats and Makeup combined in Schedule view */}
                    {view === 'schedule' && (
                        <motion.div variants={itemVariants} className="xl:col-span-1 order-2">
                            <div className="space-y-6">
                                {/* Stats Section - Compact */}
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <motion.div
                                            whileHover={{ scale: 1.1 }}
                                            className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg"
                                        >
                                            <TrophyIcon className="h-4 w-4 text-white" />
                                        </motion.div>
                                        <h2 className="text-lg font-bold text-white">Stats</h2>
                                    </div>
                                    <StatsPanel userData={userData} />
                                </div>
                                
                                {/* Makeup Section - Compact */}
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <motion.div
                                            whileHover={{ scale: 1.1 }}
                                            className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg"
                                        >
                                            <BellIcon className="h-4 w-4 text-white" />
                                        </motion.div>
                                        <h2 className="text-lg font-bold text-white">Makeup</h2>
                                    </div>
                                    <MakeupSection 
                                        userData={userData}
                                        onSelectMakeup={handleMakeupSelection}
                                        onOpenMakeupModal={(subject, index = 0) => {
                                            setSelectedMakeupSubject(subject);
                                            setSelectedMakeupIndex(index);
                                            setShowMakeupModal(true);
                                        }}
                                        onRescheduleMakeup={handleRescheduleMakeup}
                                        onRemoveMakeup={handleRemoveMakeup}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <Footer />

            {/* AI Result Modal */}
            <AnimatePresence>
                {geminiResult.show && (
                    <GeminiResultModal 
                        result={geminiResult} 
                        onClose={() => setGeminiResult({ show: false, title: '', content: '', isLoading: false })} 
                    />
                )}
            </AnimatePresence>

            {/* Makeup Modal */}
            <AnimatePresence>
                {showMakeupModal && (
                    <MakeupModal 
                        userData={userData} 
                        onSelect={handleMakeupSelection} 
                        onClose={() => {
                            setShowMakeupModal(false);
                            setSelectedMakeupSubject(null);
                            setSelectedMakeupIndex(0);
                        }}
                        selectedSubject={selectedMakeupSubject} 
                    />
                )}
            </AnimatePresence>

            {/* ECA Manager Modal */}
            <ECAManagerModal
                isOpen={showECAModal}
                onClose={() => setShowECAModal(false)}
                onSubmit={handleAddECA}
                onUpdate={handleUpdateECA}
                onDelete={handleDeleteECA}
                isLoading={isAddingECA}
                userData={userData}
            />

            {/* Report Manager Modal */}
            <ReportManagerModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                reports={weeklyReports}
                onDeleteReport={handleDeleteReport}
                onViewReport={handleViewReport}
                onGenerateReport={generateAndSaveWeeklyReports}
                isGenerating={isGeneratingReports}
            />

            {/* Confetti Celebration */}
            {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-50">
                    <Confetti 
                        width={window.innerWidth} 
                        height={window.innerHeight} 
                        numberOfPieces={200} 
                        recycle={false} 
                        gravity={0.2} 
                        initialVelocityY={20}
                        tweenDuration={5000}
                        onConfettiComplete={() => setShowConfetti(false)}
                    />
                </div>
            )}
            </motion.div>
        </>
    );
}
