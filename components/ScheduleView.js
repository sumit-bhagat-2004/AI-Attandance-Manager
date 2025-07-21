import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarIcon, ClockIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import ClassCard from './ClassCard';
import MakeupModal from './MakeupModal';
import MakeupAlert from './MakeupAlert';
import { fullSchedule, bunkSchedule, mandatorySchedule, isMandatoryClass, subjects, getEffectiveCycleStartDate, getWeekInCycle, calculateTotalClassesHeld } from '../lib/scheduleData';
import { cn, formatDate, formatDateToLocalString, isClassInPast, calculateSubjectAttendance } from '../lib/utils';

export default function ScheduleView({ user, userData, updateUserData, setGeminiResult, setShowConfetti, onOpenMakeupModal }) {
    const [today, setToday] = useState(new Date());
    const [showMakeupModal, setShowMakeupModal] = useState(false);
    const currentUser = user; // Store current user for passing to components

    // Update today's date every second to reflect time travel changes
    useEffect(() => {
        const interval = setInterval(() => {
            setToday(new Date());
        }, 1000);
        
        return () => clearInterval(interval);
    }, []);

    const handleToggleAttendance = async (classCode, status) => {
        const dateStr = formatDateToLocalString(today);
        const todayStr = formatDateToLocalString(new Date());
        const isPastDate = dateStr < todayStr;
        
        // Check if this is a makeup class that's being attended
        const isMakeupClass = userData.makeup.needed && 
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
                    if (data.needsMakeup && !isMakeupClass) {
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
    
    const dayOfWeek = today.getDay();
    const todaysClasses = fullSchedule[dayOfWeek] || [];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = dayNames[dayOfWeek];
    
    // Calculate week in cycle for determining recommended bunks (using effective cycle start like StatsView)
    const effectiveCycleStart = getEffectiveCycleStartDate(userData);
    const weekInCycle = getWeekInCycle(effectiveCycleStart, today);
    
    // Get daily bunks for recommended bunk logic (weekly + permanent)
    const weeklyBunks = bunkSchedule[weekInCycle]?.[dayOfWeek] || [];
    const permanentBunks = bunkSchedule['permanent']?.[dayOfWeek] || [];
    const dailyBunks = [...weeklyBunks, ...permanentBunks];
    
    const getAttendanceStatus = (classCode) => {
        const dateStr = formatDateToLocalString(today);
        return userData.history[dateStr]?.[classCode] || null;
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
                            const attendanceStatus = getAttendanceStatus(classInfo.code, today);
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
                                        onGetClassTopics={handleGetClassTopics}
                                        currentUser={currentUser}
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
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}
