import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { fullSchedule, subjects, bunkSchedule, mandatorySchedule, isMandatoryClass, getEffectiveCycleStartDate } from '../lib/scheduleData';
import { cn, getAttendanceStatusColor, formatDateToLocalString } from '../lib/utils';
import DayDetailsModal from './DayDetailsModal';

export default function CalendarView({ userData, currentUser }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isAnimating, setIsAnimating] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showDayDetails, setShowDayDetails] = useState(false);
    const today = new Date();

    // Debug: Log the userData to see what we're actually getting
    console.log('📅 CalendarView userData:', userData?.makeup);
    console.log('📅 CalendarView username:', userData?.username);
    
    // Force test makeup data - let me see if this works
    if (userData?.makeup) {
        console.log('📊 MAKEUP DATA CHECK:', {
            needed: userData.makeup.needed,
            target: userData.makeup.makeupTarget, 
            date: userData.makeup.makeupDate,
            testDate: '2025-08-20',
            testClass: 'OE-EC506A',
            shouldMatch: userData.makeup.makeupDate === '2025-08-20' && userData.makeup.makeupTarget === 'OE-EC506A'
        });
    }

    // Calculate week in cycle for determining recommended bunks using effective cycle start
    const cycleStartDate = getEffectiveCycleStartDate(userData);
    const getCurrentWeekInCycle = (date) => {
        const diffTime = Math.abs(date - cycleStartDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return (Math.floor(diffDays / 7) % 5) + 1;
    };

    // Helper function to get effective subject display considering subject changes
    const getEffectiveSubjectDisplay = (classCode, date) => {
        const dateStr = formatDateToLocalString(date);
        const changeKey = `${dateStr}-${classCode}`;
        
        // Check if subject was changed for this class on this date
        if (userData?.subjectChanges?.[changeKey]) {
            const change = userData.subjectChanges[changeKey];
            const newSubject = subjects[change.newSubject];
            return {
                code: change.newSubject,
                name: newSubject?.name || change.newSubject,
                isChanged: true,
                originalName: subjects[classCode]?.name || classCode
            };
        }
        
        return {
            code: classCode,
            name: subjects[classCode]?.name || classCode,
            isChanged: false
        };
    };

    // Helper functions matching ScheduleView logic EXACTLY
    const isRecommendedBunk = (classCode, date) => {
        const dayOfWeek = date.getDay();
        const weekInCycle = getCurrentWeekInCycle(date);
        const weeklyBunks = bunkSchedule[weekInCycle]?.[dayOfWeek] || [];
        const permanentBunks = bunkSchedule['permanent']?.[dayOfWeek] || [];
        const dailyBunks = [...weeklyBunks, ...permanentBunks];
        return dailyBunks.includes(classCode);
    };
    
    const isMakeupTarget = (classCode, date) => {
        if (!userData?.makeup?.needed || !userData?.makeup?.makeupTarget) {
            return false;
        }
        
        const dateStr = formatDateToLocalString(date);
        const makeupDate = userData.makeup.makeupDate;
        const makeupTarget = userData.makeup.makeupTarget;
        
        return dateStr === makeupDate && classCode === makeupTarget;
    };

    const getClassStatus = (classInfo, date, dayHistory) => {
        // MAKEUP OVERRIDES EVERYTHING - check first and return immediately
        const isMakeup = isMakeupTarget(classInfo.code, date);
        if (isMakeup) {
            return {
                type: 'makeup',
                status: 'Makeup Class',
                bgColor: 'bg-orange-500/40',
                textColor: 'text-orange-200',
                borderColor: 'border-orange-400/50'
            };
        }
        
        // Only check other types if it's NOT a makeup class
        const isRecommendedBunkClass = isRecommendedBunk(classInfo.code, date);
        if (isRecommendedBunkClass) {
            return {
                type: 'bunk',
                status: 'Optional',
                bgColor: 'bg-slate-500/30',
                textColor: 'text-slate-200',
                borderColor: 'border-slate-400/40'
            };
        } else {
            return {
                type: 'mandatory',
                status: 'Required for 80%',
                bgColor: 'bg-blue-500/30',
                textColor: 'text-blue-200',
                borderColor: 'border-blue-400/40'
            };
        }
    };

    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const daysInMonth = useMemo(() => {
        const days = [];
        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
        }
        return days;
    }, [currentDate, lastDayOfMonth]);

    const startingDayIndex = firstDayOfMonth.getDay();

    const changeMonth = async (amount) => {
        if (isAnimating) return;
        setIsAnimating(true);
        await new Promise(resolve => setTimeout(resolve, 200));
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + amount, 1));
        setIsAnimating(false);
    };

    const isToday = (date) => {
        return date.toDateString() === today.toDateString();
    };

    const isPastMonth = currentDate.getMonth() < today.getMonth() || currentDate.getFullYear() < today.getFullYear();
    const isFutureMonth = currentDate.getMonth() > today.getMonth() || currentDate.getFullYear() > today.getFullYear();

    const handleDayClick = (day) => {
        setSelectedDate(day);
        setShowDayDetails(true);
    };

    const handleCloseModal = () => {
        setShowDayDetails(false);
        setSelectedDate(null);
    };

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.3,
                staggerChildren: 0.02
            }
        }
    };

    const dayVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.2 }
        }
    };

    const headerVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4 }
        }
    };

    return (
        <motion.div 
            className="glass-card rounded-3xl overflow-hidden border-2 border-gray-600/30 shadow-2xl backdrop-blur-xl"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Enhanced Calendar Header */}
            <motion.div 
                className="bg-gradient-to-r from-primary-600/30 via-secondary-600/30 to-primary-600/30 p-8 border-b-2 border-gray-600/40 backdrop-blur-sm relative overflow-hidden"
                variants={headerVariants}
            >
                {/* Background Pattern */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-transparent to-secondary-500/10" />
                    <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                        animate={{ x: [-100, 300] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                </div>
                
                <div className="relative flex justify-between items-center">
                    <motion.button 
                        onClick={() => changeMonth(-1)}
                        className="p-4 rounded-2xl bg-gray-800/60 hover:bg-gray-700/60 transition-all duration-300 group backdrop-blur-sm border border-gray-600/30 shadow-lg"
                        whileHover={{ scale: 1.05, rotate: -5 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isAnimating}
                    >
                        <ChevronLeftIcon className="w-6 h-6 text-gray-300 group-hover:text-white transition-colors" />
                    </motion.button>
                    
                    <motion.div 
                        className="text-center"
                        key={currentDate.getMonth() + '-' + currentDate.getFullYear()}
                        initial={{ opacity: 0, y: -20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.5, type: "spring", stiffness: 300 }}
                    >
                        <div className="flex items-center justify-center space-x-4 mb-2">
                            <motion.div
                                animate={{ rotate: [0, 360] }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            >
                                <CalendarDaysIcon className="w-8 h-8 text-primary-400" />
                            </motion.div>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-300 via-white to-secondary-300 bg-clip-text text-transparent">
                                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </h2>
                        </div>
                        <motion.div 
                            className="text-sm text-gray-300 bg-gray-800/30 px-4 py-2 rounded-full backdrop-blur-sm border border-gray-600/30"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            {isPastMonth && "📚 Past Records & History"}
                            {!isPastMonth && !isFutureMonth && "📅 Current Month Overview"}
                            {isFutureMonth && "🔮 Upcoming Schedule Preview"}
                        </motion.div>
                    </motion.div>
                    
                    <motion.button 
                        onClick={() => changeMonth(1)}
                        className="p-4 rounded-2xl bg-gray-800/60 hover:bg-gray-700/60 transition-all duration-300 group backdrop-blur-sm border border-gray-600/30 shadow-lg"
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isAnimating}
                    >
                        <ChevronRightIcon className="w-6 h-6 text-gray-300 group-hover:text-white transition-colors" />
                    </motion.button>
                </div>
            </motion.div>

            {/* Calendar Grid */}
            <div className="p-2 sm:p-8 bg-gradient-to-br from-gray-900/40 to-gray-800/40 backdrop-blur-sm">
                {/* Enhanced Day Headers */}
                <motion.div 
                    className="grid grid-cols-7 gap-1 sm:gap-4 mb-4 sm:mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
                        <motion.div 
                            key={day} 
                            className={cn(
                                "text-center text-xs sm:text-sm font-bold py-2 sm:py-4 rounded-lg sm:rounded-2xl backdrop-blur-md border border-2 shadow-lg transition-all duration-300 relative overflow-hidden",
                                index === 0 || index === 6 
                                    ? "text-accent-200 bg-gradient-to-br from-accent-800/50 to-accent-900/50 border-accent-500/40 shadow-accent-500/20" 
                                    : "text-gray-200 bg-gradient-to-br from-gray-700/50 to-gray-800/50 border-gray-500/40 shadow-gray-500/20"
                            )}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            whileHover={{ scale: 1.05, y: -3 }}
                        >
                            {/* Mobile: Show abbreviated day names */}
                            <span className="sm:hidden font-semibold">
                                {day.slice(0, 3)}
                            </span>
                            {/* Desktop: Show full day names */}
                            <span className="hidden sm:inline">
                                {day}
                            </span>
                            {/* Background shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 opacity-0 hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative">
                                <div className="hidden sm:block">{day}</div>
                                <div className="sm:hidden font-extrabold">{day.slice(0, 3)}</div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Calendar Days Grid */}
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={currentDate.getMonth() + '-' + currentDate.getFullYear()}
                        className="grid grid-cols-7 gap-1 sm:gap-4"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                    >
                        {/* Enhanced Empty cells for days before month starts */}
                        {Array(startingDayIndex).fill(null).map((_, index) => (
                            <motion.div 
                                key={`empty-${index}`} 
                                className="h-16 sm:h-32 rounded-xl sm:rounded-3xl bg-gradient-to-br from-gray-800/20 to-gray-900/20 border border-gray-700/20 backdrop-blur-sm"
                                variants={dayVariants}
                            />
                        ))}

                        {/* Days of the month */}
                        {daysInMonth.map((day, index) => {
                            const daySchedule = fullSchedule[day.getDay()] || [];
                            const dayStr = formatDateToLocalString(day);
                            const dayHistory = userData.history[dayStr] || {};
                            const isCurrentDay = isToday(day);
                            const attendedClasses = Object.values(dayHistory).filter(status => status === 'attended').length;
                            const skippedClasses = Object.values(dayHistory).filter(status => status === 'skipped').length;
                            
                            // Check for makeup classes using the same logic as ClassCard
                            const makeupClasses = daySchedule.filter(cls => isMakeupTarget(cls.code, day));
                            const hasMakeupClass = makeupClasses.length > 0;
                            
                            // Get class status info for display
                            const classStatusInfo = daySchedule.map(cls => ({
                                ...cls,
                                status: getClassStatus(cls, day, dayHistory)
                            }));

                            return (
                                <motion.div 
                                    key={day.toISOString()} 
                                    className={cn(
                                        "relative h-16 sm:h-32 rounded-xl sm:rounded-3xl p-2 sm:p-4 border border-2 transition-all duration-300 overflow-hidden group cursor-pointer backdrop-blur-md shadow-xl",
                                        hasMakeupClass
                                            ? "bg-gradient-to-br from-orange-500/60 to-red-500/60 border-orange-400/90 shadow-2xl shadow-orange-500/50 ring-1 sm:ring-2 ring-orange-400/40"
                                            : isCurrentDay 
                                                ? "bg-gradient-to-br from-primary-500/60 to-secondary-500/60 border-primary-400/90 shadow-2xl shadow-primary-500/50 ring-2 sm:ring-4 ring-primary-400/40" 
                                                : "bg-gradient-to-br from-gray-800/70 to-gray-900/70 border-gray-600/50 hover:border-primary-500/70 hover:from-gray-700/80 hover:to-gray-800/80 hover:shadow-2xl hover:shadow-primary-500/30 hover:ring-1 sm:hover:ring-2 hover:ring-primary-500/40"
                                    )}
                                    variants={dayVariants}
                                    whileHover={{ scale: 1.04, y: -4 }}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => handleDayClick(day)}
                                >
                                    {/* Enhanced Background Pattern */}
                                    <div className="absolute inset-0 rounded-3xl overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5" />
                                        <motion.div 
                                            className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-60"
                                            animate={{ x: [-100, 300] }}
                                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                        />
                                        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-white/5 to-transparent rounded-full blur-xl" />
                                    </div>

                                    {/* Enhanced Date Number */}
                                    <div className="relative flex justify-between items-start mb-1 sm:mb-3">
                                        <motion.span 
                                            className={cn(
                                                "text-sm sm:text-xl font-black backdrop-blur-md rounded-lg sm:rounded-xl px-2 sm:px-3 py-1 sm:py-2 shadow-lg border",
                                                isCurrentDay 
                                                    ? "text-white bg-gradient-to-br from-primary-500/50 to-secondary-500/50 border-primary-300/70 shadow-primary-500/50" 
                                                    : "text-gray-100 bg-gradient-to-br from-gray-700/50 to-gray-800/50 border-gray-500/50"
                                            )}
                                            whileHover={{ scale: 1.15, rotate: 5 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                        >
                                            {day.getDate()}
                                        </motion.span>
                                        
                                        {/* Status Indicators */}
                                        <div className="flex flex-col space-y-1">
                                            {isCurrentDay && (
                                                <motion.div
                                                    className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-accent-400 to-accent-300 rounded-full shadow-lg"
                                                    animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                />
                                            )}
                                            {hasMakeupClass && (
                                                <motion.div
                                                    className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-orange-400 to-red-400 rounded-full shadow-lg"
                                                    animate={{ rotate: [0, 360] }}
                                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                                    title="Makeup Class Scheduled"
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {/* Class Indicators */}
                                    <div className="relative space-y-1 flex-1">
                                        {/* Show classes with their status */}
                                        {classStatusInfo.slice(0, 2).map((cls, clsIndex) => {
                                            const attendanceStatus = dayHistory[cls.code];
                                            const statusInfo = cls.status;
                                            const effectiveSubject = getEffectiveSubjectDisplay(cls.code, date);
                                            
                                            return (
                                                <motion.div 
                                                    key={cls.code}
                                                    className={cn(
                                                        "text-xs px-2 py-1 rounded-lg font-medium truncate shadow-sm border backdrop-blur-sm",
                                                        // Past classes - show actual attendance
                                                        attendanceStatus === 'attended' 
                                                            ? "bg-green-500/30 text-green-200 border-green-400/40" :
                                                        attendanceStatus === 'skipped' 
                                                            ? "bg-red-500/30 text-red-200 border-red-400/40" :
                                                        // Future/current classes - show class type
                                                        statusInfo.type === 'makeup'
                                                            ? "bg-orange-500/40 text-orange-200 border-orange-400/50"
                                                            : statusInfo.type === 'bunk'
                                                                ? "bg-slate-500/30 text-slate-200 border-slate-400/40"
                                                                : "bg-blue-500/30 text-blue-200 border-blue-400/40"
                                                    )}
                                                    title={`${effectiveSubject.name}${effectiveSubject.isChanged ? ` (Changed from ${effectiveSubject.originalName})` : ''} - ${attendanceStatus ? (attendanceStatus === 'attended' ? 'Attended' : 'Missed') : statusInfo.status}`}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.1 * clsIndex }}
                                                    whileHover={{ scale: 1.05, x: 2 }}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="truncate flex-1 flex items-center">
                                                            <span className={effectiveSubject.isChanged ? "text-yellow-300" : ""}>
                                                                {effectiveSubject.name?.slice(0, 6) || effectiveSubject.code}
                                                            </span>
                                                            {effectiveSubject.isChanged && (
                                                                <span className="ml-1 text-yellow-400 text-xs">⚡</span>
                                                            )}
                                                        </span>
                                                        <span className="ml-1 font-bold">
                                                            {attendanceStatus === 'attended' ? '✓' :
                                                             attendanceStatus === 'skipped' ? '✗' :
                                                             statusInfo.type === 'makeup' ? 'M' :
                                                             statusInfo.type === 'bunk' ? 'O' : 'R'}
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                        
                                        {/* Show count if more classes */}
                                        {daySchedule.length > 2 && (
                                            <motion.div 
                                                className="text-xs text-gray-400 px-2 py-1 bg-gray-700/30 rounded-md backdrop-blur-sm border border-gray-600/30"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.4 }}
                                            >
                                                +{daySchedule.length - 2} more
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Mobile: Simple attendance dots */}
                                    <div className="sm:hidden absolute bottom-1 left-1 right-1 flex justify-center space-x-1">
                                        {daySchedule.slice(0, 6).map((cls, idx) => {
                                            const attendanceStatus = dayHistory[cls.code];
                                            const statusInfo = getClassStatus(cls, day, dayHistory);
                                            return (
                                                <motion.div
                                                    key={cls.code}
                                                    className={cn(
                                                        "w-1.5 h-1.5 rounded-full",
                                                        attendanceStatus === 'attended' 
                                                            ? "bg-green-400" :
                                                        attendanceStatus === 'skipped' 
                                                            ? "bg-red-400" :
                                                        statusInfo.type === 'makeup'
                                                            ? "bg-orange-400"
                                                            : statusInfo.type === 'bunk'
                                                                ? "bg-gray-400"
                                                                : "bg-blue-400"
                                                    )}
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: 0.1 * idx }}
                                                />
                                            );
                                        })}
                                        {daySchedule.length > 6 && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                                        )}
                                    </div>

                                    {/* Attendance Summary */}
                                    {(attendedClasses > 0 || skippedClasses > 0) && (
                                        <motion.div 
                                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900/95 via-gray-900/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-b-2xl"
                                            initial={{ y: 10 }}
                                            whileHover={{ y: 0 }}
                                        >
                                            <div className="flex justify-between text-xs backdrop-blur-sm">
                                                {attendedClasses > 0 && (
                                                    <span className="text-green-300 font-medium flex items-center">
                                                        <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                                                        {attendedClasses}
                                                    </span>
                                                )}
                                                {skippedClasses > 0 && (
                                                    <span className="text-red-300 font-medium flex items-center">
                                                        <span className="w-2 h-2 bg-red-400 rounded-full mr-1"></span>
                                                        {skippedClasses}
                                                    </span>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Today Indicator Ring */}
                                    {isCurrentDay && (
                                        <>
                                            <motion.div
                                                className="absolute inset-0 rounded-2xl border-2 border-primary-300/70 pointer-events-none"
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ 
                                                    opacity: [0.5, 0.9, 0.5], 
                                                    scale: [0.97, 1.03, 0.97] 
                                                }}
                                                transition={{ 
                                                    duration: 2.5, 
                                                    repeat: Infinity, 
                                                    ease: "easeInOut" 
                                                }}
                                            />
                                            <motion.div
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full flex items-center justify-center shadow-xl border-2 border-white/20"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                                            >
                                                <motion.span 
                                                    className="text-xs font-bold text-white"
                                                    animate={{ rotate: [0, 360] }}
                                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                                >
                                                    ●
                                                </motion.span>
                                            </motion.div>
                                        </>
                                    )}

                                    {/* Hover Effect Overlay */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-br from-primary-400/0 to-secondary-400/0 rounded-2xl pointer-events-none group-hover:from-primary-400/10 group-hover:to-secondary-400/10 transition-all duration-300"
                                    />
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>

                {/* Enhanced Calendar Legend */}
                <motion.div 
                    className="flex justify-center flex-wrap gap-4 mt-6 pt-6 border-t border-gray-700/50 bg-gray-800/20 rounded-xl p-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    {/* Attendance Status */}
                    <div className="flex items-center space-x-2 text-xs text-gray-300">
                        <div className="w-4 h-4 bg-green-500/70 rounded-lg shadow-sm border border-green-400/30"></div>
                        <span className="font-medium">Attended</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-300">
                        <div className="w-4 h-4 bg-red-500/70 rounded-lg shadow-sm border border-red-400/30"></div>
                        <span className="font-medium">Missed</span>
                    </div>
                    
                    {/* Class Types */}
                    <div className="flex items-center space-x-2 text-xs text-gray-300">
                        <div className="w-4 h-4 bg-orange-500/70 rounded-lg shadow-sm border border-orange-400/30 flex items-center justify-center">
                            <span className="text-[8px] font-bold text-white">M</span>
                        </div>
                        <span className="font-medium">Makeup Class</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-300">
                        <div className="w-4 h-4 bg-blue-500/70 rounded-lg shadow-sm border border-blue-400/30 flex items-center justify-center">
                            <span className="text-[8px] font-bold text-white">R</span>
                        </div>
                        <span className="font-medium">Required (80%)</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-300">
                        <div className="w-4 h-4 bg-slate-500/70 rounded-lg shadow-sm border border-slate-400/30 flex items-center justify-center">
                            <span className="text-[8px] font-bold text-white">O</span>
                        </div>
                        <span className="font-medium">Optional (Bunk)</span>
                    </div>
                    
                    {/* Special Indicators */}
                    <div className="flex items-center space-x-2 text-xs text-gray-300">
                        <div className="w-4 h-4 bg-gradient-to-r from-primary-500/70 to-secondary-500/70 rounded-lg shadow-sm border border-primary-400/30 animate-pulse"></div>
                        <span className="font-medium">Today</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-300">
                        <div className="w-4 h-4 bg-gradient-to-r from-orange-500/70 to-red-500/70 rounded-lg shadow-sm border border-orange-400/30"></div>
                        <span className="font-medium">Makeup Day</span>
                    </div>
                </motion.div>
            </div>

            {/* Day Details Modal */}
            <DayDetailsModal 
                isOpen={showDayDetails}
                onClose={handleCloseModal}
                selectedDate={selectedDate}
                userData={userData}
                currentUser={currentUser}
            />
        </motion.div>
    );
}
