import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarIcon, ClockIcon, BookOpenIcon, Cog6ToothIcon, SunIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import ClassCard from './ClassCard';
import MakeupModal from './MakeupModal';
import MakeupAlert from './MakeupAlert';
import DayManagerModal from './DayManagerModal';
import { fullSchedule, bunkSchedule, mandatorySchedule, isMandatoryClass, subjects, getEffectiveCycleStartDate, getWeekInCycle, calculateTotalClassesHeld } from '../lib/scheduleData';
import { cn, formatDate, formatDateToLocalString, isClassInPast, calculateSubjectAttendance } from '../lib/utils';

export default function ScheduleView({ 
    user, 
    userData, 
    updateUserData, 
    setGeminiResult, 
    setShowConfetti, 
    onOpenMakeupModal,
    showAITopics = true,
    showSubjectChange = true,
    showMakeup = true
}) {
    const [today, setToday] = useState(new Date());
    const [showMakeupModal, setShowMakeupModal] = useState(false);
    const [showDayManagerModal, setShowDayManagerModal] = useState(false);
    const currentUser = user; // Store current user for passing to components

    // Update today's date every second to reflect time travel changes
    useEffect(() => {
        const interval = setInterval(() => {
            setToday(new Date());
        }, 1000);
        
        return () => clearInterval(interval);
    }, []);

    // Day management functions
    const getTodayKey = () => {
        return formatDateToLocalString(today);
    };

    const getTodayOverrides = () => {
        const todayKey = getTodayKey();
        const currentDayOfWeek = today.getDay();
        const currentDayClasses = fullSchedule[currentDayOfWeek] || [];
        
        // Check if all classes are marked as holiday
        const allClassesHoliday = currentDayClasses.length > 0 && 
            currentDayClasses.every(classInfo => {
                const changeKey = `${todayKey}-${classInfo.code}`;
                const change = userData?.subjectChanges?.[changeKey];
                return change?.isHoliday === true;
            });
        
        // Check if classes have been changed to form a routine override
        let routineOverride = null;
        if (currentDayClasses.length > 0 && !allClassesHoliday) {
            // Try to determine which day this matches by checking the pattern of subject changes
            const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            
            for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
                if (dayIndex === currentDayOfWeek) continue; // Skip current day
                
                const targetDayClasses = fullSchedule[dayIndex] || [];
                let matches = 0;
                let total = Math.max(currentDayClasses.length, targetDayClasses.length);
                
                for (let i = 0; i < total; i++) {
                    const currentClass = currentDayClasses[i];
                    const targetClass = targetDayClasses[i];
                    
                    if (currentClass) {
                        const changeKey = `${todayKey}-${currentClass.code}`;
                        const change = userData?.subjectChanges?.[changeKey];
                        
                        if (targetClass) {
                            // Should be changed to target class
                            if (change?.newSubject === targetClass.code) {
                                matches++;
                            } else if (!change) {
                                // No change, should match original
                                if (currentClass.code === targetClass.code) {
                                    matches++;
                                }
                            }
                        } else {
                            // Should be marked as no class
                            if (change?.newSubject === 'NO_CLASS') {
                                matches++;
                            }
                        }
                    }
                }
                
                // If most classes match this pattern, consider it a routine override
                if (matches >= total * 0.8 && total > 0) {
                    routineOverride = dayNames[dayIndex];
                    break;
                }
            }
        }
        
        return {
            isHoliday: allClassesHoliday,
            routineOverride: routineOverride
        };
    };

    const handleMarkHoliday = async (isHoliday) => {
        const todayKey = getTodayKey();
        const effectiveDayOfWeek = routineOverride ? 
            (['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(routineOverride)) : 
            today.getDay();
        
        const classesToModify = fullSchedule[effectiveDayOfWeek] || [];
        
        try {
            if (isHoliday) {
                // Mark all classes on this day as holiday using existing system
                for (const classInfo of classesToModify) {
                    const response = await fetch('/api/data', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: 'changeSubject',
                            payload: {
                                user: currentUser,
                                originalSubject: classInfo.code,
                                newSubject: 'NO_CLASS',
                                date: todayKey,
                                reason: 'holiday'
                            }
                        })
                    });
                    
                    if (!response.ok) {
                        throw new Error(`Failed to mark ${classInfo.code} as holiday`);
                    }
                }
                toast.success('🏖️ Day marked as holiday!');
            } else {
                // Remove holiday status from all classes on this day
                for (const classInfo of classesToModify) {
                    const response = await fetch('/api/data', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: 'removeSubjectChange',
                            payload: {
                                user: currentUser,
                                originalSubject: classInfo.code,
                                date: todayKey
                            }
                        })
                    });
                    
                    if (!response.ok) {
                        throw new Error(`Failed to remove holiday from ${classInfo.code}`);
                    }
                }
                toast.success('📚 Holiday removed!');
            }
            
            // Refresh user data to reflect changes
            const refreshResponse = await fetch(`/api/data?user=${encodeURIComponent(currentUser)}`);
            if (refreshResponse.ok) {
                const refreshedData = await refreshResponse.json();
                updateUserData(refreshedData);
            }
            
        } catch (error) {
            toast.error('Failed to update day settings');
            console.error('Error updating day settings:', error);
        }
    };

    const handleChangeRoutine = async (dayKey) => {
        const todayKey = getTodayKey();
        const currentDayOfWeek = today.getDay();
        const currentDayClasses = fullSchedule[currentDayOfWeek] || [];
        
        try {
            if (dayKey === null) {
                // Reset to original day routine - remove all subject changes for this day
                for (const classInfo of currentDayClasses) {
                    const response = await fetch('/api/data', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: 'removeSubjectChange',
                            payload: {
                                user: currentUser,
                                originalSubject: classInfo.code,
                                date: todayKey
                            }
                        })
                    });
                    
                    if (!response.ok) {
                        console.warn(`Failed to remove subject change for ${classInfo.code}`);
                    }
                }
                toast.success('📅 Day routine reset to original!');
            } else {
                // Change to different day's routine
                const dayKeyToIndex = { 
                    'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3, 
                    'thursday': 4, 'friday': 5, 'saturday': 6 
                };
                const targetDayOfWeek = dayKeyToIndex[dayKey];
                const targetDayClasses = fullSchedule[targetDayOfWeek] || [];
                
                // First, remove existing changes for this day
                for (const classInfo of currentDayClasses) {
                    await fetch('/api/data', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: 'removeSubjectChange',
                            payload: {
                                user: currentUser,
                                originalSubject: classInfo.code,
                                date: todayKey
                            }
                        })
                    });
                }
                
                // Apply new routine by changing each class
                const maxClasses = Math.max(currentDayClasses.length, targetDayClasses.length);
                
                for (let i = 0; i < maxClasses; i++) {
                    const currentClass = currentDayClasses[i];
                    const targetClass = targetDayClasses[i];
                    
                    if (currentClass) {
                        if (targetClass) {
                            // Change current class to target class
                            const response = await fetch('/api/data', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    action: 'changeSubject',
                                    payload: {
                                        user: currentUser,
                                        originalSubject: currentClass.code,
                                        newSubject: targetClass.code,
                                        date: todayKey,
                                        reason: `routine_change_to_${dayKey}`
                                    }
                                })
                            });
                            
                            if (!response.ok) {
                                console.warn(`Failed to change ${currentClass.code} to ${targetClass.code}`);
                            }
                        } else {
                            // No corresponding class in target day - mark as no class
                            const response = await fetch('/api/data', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    action: 'changeSubject',
                                    payload: {
                                        user: currentUser,
                                        originalSubject: currentClass.code,
                                        newSubject: 'NO_CLASS',
                                        date: todayKey,
                                        reason: `routine_change_to_${dayKey}_no_class`
                                    }
                                })
                            });
                            
                            if (!response.ok) {
                                console.warn(`Failed to mark ${currentClass.code} as no class`);
                            }
                        }
                    }
                }
                
                const dayName = dayKey.charAt(0).toUpperCase() + dayKey.slice(1);
                toast.success(`📅 Day routine changed to ${dayName}!`);
            }
            
            // Refresh user data to reflect changes
            const refreshResponse = await fetch(`/api/data?user=${encodeURIComponent(currentUser)}`);
            if (refreshResponse.ok) {
                const refreshedData = await refreshResponse.json();
                updateUserData(refreshedData);
            }
            
        } catch (error) {
            toast.error('Failed to update day routine');
            console.error('Error updating day routine:', error);
        }
    };

    const handleToggleAttendance = async (classCode, status, classTime) => {
        const dateStr = formatDateToLocalString(today);
        const todayStr = formatDateToLocalString(new Date());
        const isPastDate = dateStr < todayStr;
        
        // Check if this is a makeup class that's being attended
        const isMakeupClass = showMakeup && userData.makeup.needed && 
                              userData.makeup.makeupTarget === classCode && 
                              userData.makeup.makeupDate === todayStr &&
                              status === 'attended';
        
        // Handle removing attendance records
        if (status === 'unrecorded') {
            const confirmed = window.confirm(
                `🗑️ Remove attendance record?\n\n` +
                `Subject: ${subjects[classCode]?.name}\n` +
                `Date: ${today.toLocaleDateString()}\n\n` +
                `This will clear the attendance record for this class.`
            );
            if (!confirmed) return;
        }
        // If marking attendance for past classes, show confirmation for mandatory classes
        else if (isPastDate) {
            const effectiveCycleStart = getEffectiveCycleStartDate(userData);
            const currentWeek = getWeekInCycle(effectiveCycleStart, today);
            const dayOfWeek = today.getDay();
            const isMandatory = isMandatoryClass(currentWeek, dayOfWeek, classCode);
            
            if (isMandatory && status === 'skipped') {
                const confirmed = window.confirm(
                    `⚠️ You're marking a past MANDATORY class as skipped.\n\n` +
                    `Subject: ${subjects[classCode]?.name}\n` +
                    `Date: ${today.toLocaleDateString()}\n\n` +
                    `This will require a makeup class. Are you sure?`
                );
                if (!confirmed) return;
            } else if (isPastDate) {
                const confirmed = window.confirm(
                    `📅 Recording past attendance:\n\n` +
                    `Subject: ${subjects[classCode]?.name}\n` +
                    `Date: ${today.toLocaleDateString()}\n` +
                    `Status: ${status === 'attended' ? 'Attended' : 'Skipped'}\n\n` +
                    `Confirm this attendance record?`
                );
                if (!confirmed) return;
            }
        }
        // Special confirmation for makeup classes
        else if (isMakeupClass) {
            const confirmed = window.confirm(
                `✅ Complete makeup class?\n\n` +
                `Subject: ${subjects[classCode]?.name}\n` +
                `Date: ${today.toLocaleDateString()}\n\n` +
                `This will mark your makeup requirement as completed and remove it from the schedule.`
            );
            if (!confirmed) return;
        }
        
        const payload = { 
            user, 
            classCode, 
            status, 
            dateStr,
            classTime, // Include class time for unique attendance tracking
            isMakeupClass // Pass this flag to the API
        };
        
        const toastId = toast.loading(
            status === 'unrecorded' 
                ? 'Removing attendance record...'
                : `Recording ${status === 'attended' ? 'attendance' : 'absence'}...`,
            {
                icon: status === 'unrecorded' ? '🗑️' : (status === 'attended' ? '✅' : '❌')
            }
        );

        try {
            const response = await fetch('/api/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'logAttendance', payload }),
            });
            const data = await response.json();
            if (response.ok) {
                updateUserData(data.updatedData);
                
                if (status === 'unrecorded') {
                    toast.success(
                        `Attendance record removed for ${subjects[classCode]?.name}`,
                        { id: toastId }
                    );
                } else {
                    // Special handling for completed makeup classes
                    if (isMakeupClass) {
                        toast.success(
                            `🎉 Makeup class completed! ${subjects[classCode]?.name}`,
                            { 
                                id: toastId,
                                duration: 5000,
                                style: {
                                    background: 'rgba(34, 197, 94, 0.1)',
                                    border: '1px solid rgba(34, 197, 94, 0.3)',
                                    color: 'rgb(34, 197, 94)',
                                }
                            }
                        );
                        
                        // Show confetti for makeup completion
                        if (setShowConfetti) {
                            setShowConfetti(true);
                        }
                    } else {
                        toast.success(
                            `${status === 'attended' ? 'Attendance recorded!' : 'Absence logged'} for ${subjects[classCode]?.name}`,
                            { id: toastId }
                        );
                    }
                    
                    // If skipping a mandatory class, show makeup modal immediately
                    if (showMakeup && data.needsMakeup && !isMakeupClass) {
                        toast('⚠️ Makeup class required!', {
                            duration: 4000,
                            style: {
                                background: 'rgba(251, 191, 36, 0.1)',
                                border: '1px solid rgba(251, 191, 36, 0.3)',
                                color: 'rgb(251, 191, 36)',
                            },
                        });
                        // Open makeup modal after a short delay
                        setTimeout(() => {
                            onOpenMakeupModal();
                        }, 1500);
                    }
                }
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error("Failed to log attendance:", error);
            toast.error(`Failed to record: ${error.message}`, { id: toastId });
        }
    };

    const handleMakeupSelection = async (targetClass) => {
        const toastId = toast.loading('Setting up makeup class...', {
            icon: '🔄'
        });
        
        try {
            const response = await fetch('/api/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'setMakeup', payload: { user, targetClass } }),
            });
            const data = await response.json();
            if (response.ok) {
                updateUserData(data.updatedData);
                setShowMakeupModal(false);
                
                toast.success(
                    `Makeup class scheduled! 📅 ${subjects[targetClass.code]?.name}`,
                    { 
                        id: toastId,
                        duration: 5000 
                    }
                );
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error("Failed to set makeup class:", error);
            toast.error(`Failed to schedule makeup: ${error.message}`, { id: toastId });
        }
    };

    const handleGetClassTopics = async (classCode, hint = null, classDate = null) => {
        setGeminiResult({ show: true, title: `Generating topics...`, content: '', isLoading: true });
        
        const toastId = toast.loading('AI is analyzing class topics...', {
            icon: '🤖'
        });
        
        try {
            const payload = { classCode };
            if (hint && hint.trim()) {
                payload.hint = hint.trim();
            }
            
            // Add user and date for storage
            if (currentUser && classDate) {
                payload.user = currentUser;
                payload.date = classDate;
            }
            
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'classTopics', payload }),
            });
            const data = await response.json();
            if (response.ok) {
                setGeminiResult({ 
                    show: true, 
                    title: `Key Topics for ${subjects[classCode].name}${hint ? ' (With Your Hint)' : ''}`, 
                    content: data.result, 
                    isLoading: false 
                });
                
                // Store the AI content if user and date are provided
                if (currentUser && classDate) {
                    try {
                        await fetch('/api/topics', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                action: 'store_ai_content',
                                payload: { 
                                    user: currentUser, 
                                    classCode, 
                                    date: classDate, 
                                    aiContent: data.result, 
                                    topicHint: hint 
                                }
                            }),
                        });
                    } catch (storeError) {
                        console.warn('Failed to store AI content:', storeError);
                    }
                }
                
                toast.success('AI analysis complete! ✨', { 
                    id: toastId,
                    duration: 3000 
                });
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            setGeminiResult({ show: true, title: 'Error', content: error.message, isLoading: false });
            toast.error(`AI analysis failed: ${error.message}`, { id: toastId });
        }
    };
    
    // Handle subject change due to teacher absence
    const handleSubjectChange = async (classCode, newSubject, classDate) => {
        try {
            // Handle refresh signal from revert holiday
            if (newSubject === '__REFRESH__') {
                // Just fetch the latest user data to refresh the UI
                const response = await fetch(`/api/data?user=${currentUser}`);
                if (response.ok) {
                    const data = await response.json();
                    updateUserData(data);
                    toast.success('Holiday reverted successfully', {
                        icon: "🔄",
                        style: {
                            borderRadius: '10px',
                            background: '#1f2937',
                            color: '#f3f4f6',
                            border: '1px solid #10b981'
                        }
                    });
                }
                return;
            }

            const response = await fetch('/api/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'changeSubject',
                    payload: {
                        user: currentUser,
                        originalSubject: classCode,
                        newSubject,
                        date: formatDateToLocalString(classDate),
                        reason: 'Teacher absence'
                    }
                }),
            });
            
            const data = await response.json();
            if (response.ok) {
                updateUserData(data.updatedData);
                // Handle different subject change types for toast message
                const successMessage = newSubject === 'NO_CLASS' 
                    ? 'Class marked as holiday' 
                    : `Subject changed to ${subjects[newSubject]?.name}`;
                
                toast.success(successMessage, {
                    icon: newSubject === 'NO_CLASS' ? "🏖️" : "📚",
                    style: {
                        borderRadius: '10px',
                        background: '#1f2937',
                        color: '#f3f4f6',
                        border: '1px solid #10b981'
                    }
                });
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Failed to change subject:', error);
            
            // Handle specific error cases
            let errorMessage = 'Unknown error occurred';
            if (error.message.includes('MongoDB connection error')) {
                errorMessage = 'Database connection failed. Using local mode.';
            } else if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Network error. Check your connection.';
            } else {
                errorMessage = error.message;
            }
            
            toast.error(`Failed to change subject: ${errorMessage}`, {
                icon: "❌",
                style: {
                    borderRadius: '10px',
                    background: '#1f2937',
                    color: '#f3f4f6',
                    border: '1px solid #ef4444'
                }
            });
        }
    };
    
    // Get day overrides for today (derived from existing subject changes)
    const todayOverrides = getTodayOverrides();
    const isHoliday = todayOverrides.isHoliday || false;
    const routineOverride = todayOverrides.routineOverride;
    
    // Use the original day's classes - subject changes will be handled by ClassCard
    const dayOfWeek = today.getDay();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const todaysClasses = fullSchedule[dayOfWeek] || [];
    const currentDayName = dayNames[dayOfWeek];
    
    // For display purposes, show what day's routine is being shown
    const effectiveDayName = routineOverride ? 
        dayNames[['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(routineOverride)] : 
        currentDayName;
    
    // Calculate week in cycle for determining recommended bunks (using effective cycle start like StatsView)
    const effectiveCycleStart = getEffectiveCycleStartDate(userData);
    const weekInCycle = getWeekInCycle(effectiveCycleStart, today);
    
    // Get daily bunks for recommended bunk logic (weekly + permanent) - use original day
    const weeklyBunks = bunkSchedule[weekInCycle]?.[dayOfWeek] || [];
    const permanentBunks = bunkSchedule['permanent']?.[dayOfWeek] || [];
    const dailyBunks = [...weeklyBunks, ...permanentBunks];
    
    const getAttendanceStatus = (classCode, classTime) => {
        const dateStr = formatDateToLocalString(today);
        
        // Check if subject was changed for this class on this date
        const changeKey = `${dateStr}-${classCode}`;
        const change = userData?.subjectChanges?.[changeKey];
        
        // Create attendance keys with time for multiple classes per day
        const timeBasedKey = classTime ? `${classCode}-${classTime}` : classCode;
        const timeBasedNewKey = change && classTime ? `${change.newSubject}-${classTime}` : change?.newSubject;
        
        if (change) {
            // For changed subjects, check multiple possible keys for backward compatibility:
            // 1. New subject with time (current format)
            // 2. New subject without time (legacy format)
            // 3. Original subject with time (fallback)
            // 4. Original subject without time (legacy fallback)
            return userData.history[dateStr]?.[timeBasedNewKey] || 
                   userData.history[dateStr]?.[change.newSubject] ||
                   userData.history[dateStr]?.[timeBasedKey] ||
                   userData.history[dateStr]?.[classCode] || null;
        }
        
        // For regular classes, check both time-based and legacy keys
        return userData.history[dateStr]?.[timeBasedKey] || 
               userData.history[dateStr]?.[classCode] || null;
    };
    
    const isRecommendedBunk = (classCode) => {
        return dailyBunks.includes(classCode);
    };
    
    const isMakeupTarget = (classCode, classTime) => {
        if (!userData.makeup.needed || !userData.makeup.makeupTarget) return false;
        
        // Check if today matches the makeup date and if the class matches the makeup target
        const todayStr = formatDateToLocalString(today);
        const makeupDate = userData.makeup.makeupDate;
        const makeupTarget = userData.makeup.makeupTarget;
        
        // Debug logging
        const isMatch = todayStr === makeupDate && classCode === makeupTarget;
        if (isMatch) {
            console.log('🎯 ScheduleView FOUND MAKEUP:', { todayStr, makeupDate, makeupTarget, classCode });
        }
        
        // For makeup classes, we only need to match the date and subject code
        // Time matching can be flexible since makeup classes might not have exact time matches
        return todayStr === makeupDate && classCode === makeupTarget;
    };

    // Calculate overall percentage using simple average (same logic as StatsPanel)
    const calculateOverallPercentage = () => {
        try {
            if (!userData || !userData.history) return 0;

            // Get ALL subjects including training (same as updated StatsPanel.js)
            const allSubjects = Object.keys(subjects);

            if (allSubjects.length === 0) return 0;

            // Calculate simple average of individual subject percentages (same as StatsPanel.js line 60)
            const totalPercentage = allSubjects.reduce((sum, code) => {
                const percentage = calculateSubjectAttendance ? calculateSubjectAttendance(userData, code) : 0;
                return sum + percentage;
            }, 0);

            const averageAttendance = Math.round(totalPercentage / allSubjects.length);
            return averageAttendance;
        } catch (error) {
            console.error('Error calculating overall attendance:', error);
            return 0;
        }
    };

    const overallPercentage = calculateOverallPercentage();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                duration: 0.3
            }
        }
    };

    const headerVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.3 }
        }
    };

    return (
        <motion.div 
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Enhanced Header */}
            <motion.div 
                className="card-gradient p-4 sm:p-6 rounded-2xl mb-6"
                variants={headerVariants}
            >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                        <motion.div
                            className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg"
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </motion.div>
                        <div>
                            <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                                Today's Schedule
                            </h2>
                            <p className="text-gray-400 flex flex-col sm:flex-row sm:items-center sm:space-x-2 text-xs sm:text-sm">
                                <div className="flex items-center space-x-1">
                                    <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span>{currentDayName}, {today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                    {isHoliday && (
                                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/40 rounded-full text-yellow-400">
                                            <SunIcon className="w-3 h-3" />
                                            <span className="text-xs font-medium">Holiday</span>
                                        </span>
                                    )}
                                    {routineOverride && (
                                        <span className="inline-flex items-center px-2 py-0.5 bg-purple-500/20 border border-purple-500/40 rounded-full text-purple-400 text-xs font-medium">
                                            {effectiveDayName} Routine
                                        </span>
                                    )}
                                    <motion.button
                                        onClick={() => setShowDayManagerModal(true)}
                                        className="ml-2 p-1 hover:bg-gray-700 rounded-md transition-colors group"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        title="Manage day settings"
                                    >
                                        <Cog6ToothIcon className="w-4 h-4 text-gray-500 group-hover:text-gray-300" />
                                    </motion.button>
                                </div>
                                <span className="hidden sm:inline mx-2">•</span>
                                <span className="text-primary-400 font-medium">Week {weekInCycle}</span>
                            </p>
                        </div>
                    </div>
                    
                    {/* Compact Stats */}
                    <div className="flex space-x-2 sm:space-x-3 text-center">
                        <div className="bg-primary-500/10 border border-primary-500/30 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
                            <div className="text-sm font-bold text-primary-400">{todaysClasses.length}</div>
                            <div className="text-xs text-gray-400">Classes</div>
                        </div>
                        <div className="bg-secondary-500/10 border border-secondary-500/30 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
                            <div className="text-sm font-bold text-secondary-400">{dailyBunks.length}</div>
                            <div className="text-xs text-gray-400">Optional</div>
                        </div>
                        <div className={`border rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 ${
                            overallPercentage >= 90 ? "bg-green-500/10 border-green-500/30" :
                            overallPercentage >= 80 ? "bg-blue-500/10 border-blue-500/30" :
                            overallPercentage >= 75 ? "bg-yellow-500/10 border-yellow-500/30" :
                            "bg-red-500/10 border-red-500/30"
                        }`}>
                            <div className={`text-sm font-bold ${
                                overallPercentage >= 90 ? "text-green-400" :
                                overallPercentage >= 80 ? "text-blue-400" :
                                overallPercentage >= 75 ? "text-yellow-400" :
                                "text-red-400"
                            }`}>{overallPercentage}%</div>
                            <div className="text-xs text-gray-400">Overall</div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Makeup Alert */}
            <AnimatePresence>
                {userData.makeup.needed && !showMakeupModal && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                    >
                        <MakeupAlert 
                            makeup={userData.makeup} 
                            onSelect={() => setShowMakeupModal(true)} 
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Classes Grid */}
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                {todaysClasses.length > 0 ? (
                    <AnimatePresence mode="popLayout">
                        {todaysClasses.map((classInfo, index) => {
                            const isPast = isClassInPast(classInfo.time, today);
                            const attendanceStatus = getAttendanceStatus(classInfo.code, classInfo.time);
                            const isRecommendedBunkClass = isRecommendedBunk(classInfo.code);
                            const isMakeupTargetClass = isMakeupTarget(classInfo.code, classInfo.time);
                            
                            return (
                                <motion.div
                                    key={`${classInfo.code}-${classInfo.time}`}
                                    variants={cardVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ delay: index * 0.05 }}
                                    layout
                                    className="h-full"
                                >
                                    <ClassCard 
                                        classInfo={classInfo}
                                        dayDate={today}
                                        isRecommendedBunk={isRecommendedBunkClass}
                                        isMakeupTarget={isMakeupTargetClass}
                                        isPast={isPast}
                                        attendanceStatus={attendanceStatus}
                                        onToggleAttendance={handleToggleAttendance}
                                        weekInCycle={weekInCycle}
                                        onGetClassTopics={showAITopics ? handleGetClassTopics : null}
                                        currentUser={currentUser}
                                        onSubjectChange={showSubjectChange ? handleSubjectChange : null}
                                        userData={userData}
                                        showAITopics={showAITopics}
                                        showSubjectChange={showSubjectChange}
                                        showMakeup={showMakeup}
                                    />
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                ) : (
                    <motion.div 
                        className="col-span-full card-gradient p-8 sm:p-12 rounded-2xl text-center border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300"
                        variants={cardVariants}
                        whileHover={{ scale: 1.01 }}
                    >
                        <motion.div
                            className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-gray-700 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6"
                            initial={{ rotate: 0 }}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        >
                            <BookOpenIcon className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300" />
                        </motion.div>
                        <h3 className="text-lg sm:text-2xl font-semibold text-gray-300 mb-2 sm:mb-3">No Classes Today</h3>
                        <p className="text-gray-400 text-sm sm:text-base max-w-md mx-auto">Perfect day for makeup classes, revision, or just taking a well-deserved break!</p>
                        <motion.div 
                            className="mt-4 sm:mt-6 inline-flex items-center gap-2 text-accent-400 font-medium text-sm sm:text-base"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <span>🎉</span>
                            <span>Enjoy your free day!</span>
                        </motion.div>
                    </motion.div>
                )}
            </motion.div>

            {/* Makeup Modal */}
            <AnimatePresence>
                {showMakeupModal && (
                    <MakeupModal 
                        userData={userData} 
                        onSelect={handleMakeupSelection} 
                        onClose={() => setShowMakeupModal(false)}
                        currentUser={user}
                    />
                )}

                {/* Day Manager Modal */}
                <DayManagerModal
                    isOpen={showDayManagerModal}
                    onClose={() => setShowDayManagerModal(false)}
                    selectedDate={today}
                    onMarkHoliday={handleMarkHoliday}
                    onChangeRoutine={handleChangeRoutine}
                    currentDayOverride={routineOverride}
                    isHoliday={isHoliday}
                />
            </AnimatePresence>
        </motion.div>
    );
}
