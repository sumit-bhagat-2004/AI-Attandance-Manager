import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, CalendarDaysIcon, ClockIcon, CheckCircleIcon, XCircleIcon, MinusCircleIcon, BookOpenIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { subjects, fullSchedule, bunkSchedule, mandatorySchedule, isMandatoryClass, getEffectiveCycleStartDate } from '../lib/scheduleData';
import { cn, formatDateToLocalString } from '../lib/utils';
import StudyMaterialsModal from './StudyMaterialsModal';

export default function DayDetailsModal({ isOpen, onClose, selectedDate, userData, currentUser }) {
    const [classTopics, setClassTopics] = useState({});
    const [loadingTopics, setLoadingTopics] = useState(false);
    const [showStudyMaterials, setShowStudyMaterials] = useState(false);
    const [selectedStudyClass, setSelectedStudyClass] = useState(null);
    const [classHints, setClassHints] = useState({});
    const [savingHints, setSavingHints] = useState({});
    const [validatingHints, setValidatingHints] = useState({});
    
    // Fetch class topics when modal opens
    useEffect(() => {
        if (isOpen && selectedDate && currentUser) {
            fetchClassTopics();
            fetchClassHints();
        }
    }, [isOpen, selectedDate, currentUser]);
    
    const fetchClassTopics = async () => {
        if (!currentUser || !selectedDate) return;
        
        setLoadingTopics(true);
        try {
            const dateStr = formatDateToLocalString(selectedDate);
            const response = await fetch(`/api/topics?user=${currentUser}&date=${dateStr}`);
            
            if (response.ok) {
                const data = await response.json();
                const topicsMap = {};
                data.topics.forEach(topic => {
                    topicsMap[topic.classCode] = topic;
                });
                setClassTopics(topicsMap);
            }
        } catch (error) {
            console.error('Error fetching class topics:', error);
        } finally {
            setLoadingTopics(false);
        }
    };
    
    const fetchClassHints = async () => {
        if (!currentUser || !selectedDate) return;
        
        try {
            const dateStr = formatDateToLocalString(selectedDate);
            const response = await fetch(`/api/topics?user=${currentUser}&date=${dateStr}`);
            
            if (response.ok) {
                const data = await response.json();
                const hintsMap = {};
                data.topics.forEach(topic => {
                    if (topic.topicHint) {
                        hintsMap[topic.classCode] = topic.topicHint;
                    }
                });
                setClassHints(hintsMap);
            }
        } catch (error) {
            console.error('Error fetching class hints:', error);
        }
    };
    
    const saveClassHint = async (classCode, hint) => {
        if (!hint.trim() || !currentUser) return;
        
        setSavingHints(prev => ({ ...prev, [classCode]: true }));
        
        try {
            // First validate the hint with AI to check for misleading content
            setValidatingHints(prev => ({ ...prev, [classCode]: true }));
            
            const validationResponse = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'validateHint',
                    payload: {
                        classCode,
                        subjectName: subjects[classCode]?.name || classCode,
                        hint: hint.trim(),
                        context: `Validating class hint for academic subject. Check if this hint is appropriate, accurate, and helpful for students.`
                    }
                })
            });
            
            const validationData = await validationResponse.json();
            let processedHint = hint.trim();
            let isValid = true;
            
            if (validationResponse.ok && validationData.result) {
                // AI suggests this might be problematic
                if (validationData.result.toLowerCase().includes('inappropriate') || 
                    validationData.result.toLowerCase().includes('misleading') ||
                    validationData.result.toLowerCase().includes('inaccurate')) {
                    
                    isValid = false;
                    processedHint = `[AI-Flagged: Potentially misleading] ${hint.trim()}`;
                }
            }
            
            setValidatingHints(prev => ({ ...prev, [classCode]: false }));
            
            // Save the hint (with AI validation flag if needed)
            const dateStr = formatDateToLocalString(selectedDate);
            const response = await fetch('/api/topics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'store_topic_hint',
                    payload: {
                        user: currentUser,
                        classCode,
                        date: dateStr,
                        topicHint: processedHint,
                        isValidated: isValid,
                        validationTimestamp: new Date()
                    }
                })
            });
            
            if (response.ok) {
                setClassHints(prev => ({ ...prev, [classCode]: processedHint }));
                
                // Trigger AI study material update
                await updateAIStudyMaterials(classCode, dateStr, processedHint);
            }
            
        } catch (error) {
            console.error('Error saving class hint:', error);
        } finally {
            setSavingHints(prev => ({ ...prev, [classCode]: false }));
            setValidatingHints(prev => ({ ...prev, [classCode]: false }));
        }
    };
    
    const updateAIStudyMaterials = async (classCode, date, hint) => {
        try {
            const aiResponse = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'generateStudyMaterial',
                    payload: {
                        classCode,
                        subjectName: subjects[classCode]?.name || classCode,
                        topicHint: hint,
                        date: date,
                        studentLevel: 'undergraduate' // Could be made dynamic
                    }
                })
            });
            
            if (aiResponse.ok) {
                const aiData = await aiResponse.json();
                
                // Save AI-generated study material
                await fetch('/api/topics', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'store_ai_content',
                        payload: {
                            user: currentUser,
                            classCode,
                            date,
                            aiContent: aiData.result,
                            topicHint: hint
                        }
                    })
                });
            }
        } catch (error) {
            console.error('Error updating AI study materials:', error);
        }
    };
    
    const handleViewStudyMaterials = (classCode) => {
        setSelectedStudyClass(classCode);
        setShowStudyMaterials(true);
    };
    if (!isOpen || !selectedDate) return null;

    const daySchedule = fullSchedule[selectedDate.getDay()] || [];
    const dayStr = formatDateToLocalString(selectedDate);
    const dayHistory = userData.history[dayStr] || {};
    const isToday = selectedDate.toDateString() === new Date().toDateString();

    // Calculate week in cycle for determining class types using effective cycle start
    const effectiveCycleStart = getEffectiveCycleStartDate(userData);
    const getCurrentWeekInCycle = (date) => {
        const diffTime = Math.abs(date - effectiveCycleStart);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return (Math.floor(diffDays / 7) % 5) + 1;
    };

    // Helper functions matching ScheduleView logic
    const isRecommendedBunk = (classCode, date) => {
        const dayOfWeek = date.getDay();
        const weekInCycle = getCurrentWeekInCycle(date);
        const weeklyBunks = bunkSchedule[weekInCycle]?.[dayOfWeek] || [];
        const permanentBunks = bunkSchedule['permanent']?.[dayOfWeek] || [];
        const dailyBunks = [...weeklyBunks, ...permanentBunks];
        return dailyBunks.includes(classCode);
    };
    
    const isMakeupTarget = (classCode, date) => {
        if (!userData?.makeup?.needed || !userData?.makeup?.makeupTarget) return false;
        
        // FIX: Use local date string instead of ISO string to avoid timezone issues
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        const makeupDate = userData.makeup.makeupDate;
        const makeupTarget = userData.makeup.makeupTarget;
        
        // Debug for August 20th
        if (dateStr === '2025-08-20') {
            console.log('🔍 DayDetailsModal Debug for Aug 20:', {
                dateStr,
                makeupDate,
                makeupTarget,
                classCode,
                isMatch: dateStr === makeupDate && classCode === makeupTarget
            });
        }
        
        // Simple match - if date and class match, it's a makeup class
        return dateStr === makeupDate && classCode === makeupTarget;
    };

    const getClassStatus = (classInfo, date, dayHistory) => {
        // MAKEUP OVERRIDES EVERYTHING - check first and return immediately
        if (isMakeupTarget(classInfo.code, date)) {
            return {
                type: 'makeup',
                status: 'Makeup Class',
                bgColor: 'from-orange-500/40 to-red-500/40',
                textColor: 'text-orange-200',
                borderColor: 'border-orange-400/50'
            };
        }
        
        // Only check other types if it's NOT a makeup class
        const isRecommendedBunkClass = isRecommendedBunk(classInfo.code, date);
        if (isRecommendedBunkClass) {
            return {
                type: 'bunk',
                status: 'Optional (Can Bunk)',
                bgColor: 'from-slate-500/30 to-slate-600/30',
                textColor: 'text-slate-200',
                borderColor: 'border-slate-400/40'
            };
        } else {
            return {
                type: 'mandatory',
                status: 'Required for 80%',
                bgColor: 'from-blue-500/30 to-blue-600/30',
                textColor: 'text-blue-200',
                borderColor: 'border-blue-400/40'
            };
        }
    };

    // Check if this day has any makeup classes
    const makeupClasses = daySchedule.filter(cls => isMakeupTarget(cls.code, selectedDate));
    const hasMakeupClass = makeupClasses.length > 0;

    const getStatusIcon = (status) => {
        switch (status) {
            case 'attended':
                return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
            case 'skipped':
                return <XCircleIcon className="w-5 h-5 text-red-400" />;
            default:
                return <MinusCircleIcon className="w-5 h-5 text-gray-400" />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'attended':
                return 'Attended';
            case 'skipped':
                return 'Missed';
            default:
                return 'Not Recorded';
        }
    };

    const attendedCount = Object.values(dayHistory).filter(status => status === 'attended').length;
    const skippedCount = Object.values(dayHistory).filter(status => status === 'skipped').length;
    const totalClasses = daySchedule.length;

    const modalVariants = {
        hidden: {
            opacity: 0,
            scale: 0.8,
            y: 50
        },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 25,
                stiffness: 300,
                staggerChildren: 0.1
            }
        },
        exit: {
            opacity: 0,
            scale: 0.8,
            y: 50,
            transition: {
                duration: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { 
            opacity: 1, 
            x: 0,
            transition: { duration: 0.3 }
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[99999] flex items-center justify-center p-2 sm:p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="bg-gray-900/95 backdrop-blur-xl rounded-lg sm:rounded-2xl border border-gray-700/50 shadow-2xl w-full h-full sm:max-w-2xl sm:w-full sm:max-h-[90vh] sm:h-auto overflow-hidden flex flex-col"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-primary-600/20 to-secondary-600/20 p-4 sm:p-6 border-b border-gray-700/50 flex-shrink-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <CalendarDaysIcon className="w-6 h-6 sm:w-8 sm:h-8 text-primary-400" />
                                    <div>
                                        <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                                            {selectedDate.toLocaleDateString('default', { 
                                                weekday: 'long', 
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric' 
                                            })}
                                        </h2>
                                        <p className="text-gray-400 text-xs sm:text-sm">
                                            {isToday ? '📅 Today' : `${Math.abs(Math.floor((new Date() - selectedDate) / (1000 * 60 * 60 * 24)))} days ${selectedDate < new Date() ? 'ago' : 'from now'}`}
                                        </p>
                                    </div>
                                </div>
                                <motion.button
                                    onClick={onClose}
                                    className="p-2 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-200"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <XMarkIcon className="w-6 h-6 text-gray-400" />
                                </motion.button>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto">
                            {/* Summary Stats */}
                            <motion.div 
                                className="p-4 sm:p-6 border-b border-gray-700/30"
                                variants={itemVariants}
                            >
                            <div className="grid grid-cols-3 gap-2 sm:gap-4">
                                <div className="bg-green-500/10 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-green-500/20">
                                    <div className="flex items-center space-x-1 sm:space-x-2">
                                        <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                                        <span className="text-xs sm:text-sm text-gray-300">Attended</span>
                                    </div>
                                    <p className="text-lg sm:text-2xl font-bold text-green-400 mt-1">{attendedCount}</p>
                                </div>
                                <div className="bg-red-500/10 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-red-500/20">
                                    <div className="flex items-center space-x-1 sm:space-x-2">
                                        <XCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                                        <span className="text-xs sm:text-sm text-gray-300">Missed</span>
                                    </div>
                                    <p className="text-lg sm:text-2xl font-bold text-red-400 mt-1">{skippedCount}</p>
                                </div>
                                <div className="bg-primary-500/10 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-primary-500/20">
                                    <div className="flex items-center space-x-1 sm:space-x-2">
                                        <CalendarDaysIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-400" />
                                        <span className="text-xs sm:text-sm text-gray-300">Total</span>
                                    </div>
                                    <p className="text-lg sm:text-2xl font-bold text-primary-400 mt-1">{totalClasses}</p>
                                </div>
                            </div>
                        </motion.div>

                            {/* Class List */}
                            <div className="p-4 sm:p-6">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-300 mb-4 flex items-center space-x-2">
                                    <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-400" />
                                    <span>Class Schedule</span>
                                </h3>

                            {totalClasses === 0 ? (
                                <motion.div 
                                    className="text-center py-8"
                                    variants={itemVariants}
                                >
                                    <CalendarDaysIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                    <p className="text-gray-400">No classes scheduled for this day</p>
                                    <p className="text-sm text-gray-500">Enjoy your free day! 🎉</p>
                                </motion.div>
                            ) : (
                                <div className="space-y-3">
                                    {/* All Classes with Enhanced Status */}
                                    {daySchedule.map((cls, index) => {
                                        const subject = subjects[cls.code];
                                        const attendanceStatus = dayHistory[cls.code];
                                        const statusInfo = getClassStatus(cls, selectedDate, dayHistory);
                                        
                                        return (
                                            <motion.div
                                                key={cls.code}
                                                className={cn(
                                                    "rounded-xl p-4 border-2 hover:scale-[1.01] transition-all duration-200",
                                                    statusInfo.type === 'makeup' 
                                                        ? "bg-gradient-to-r from-orange-800/40 to-red-800/40 border-orange-500/50 hover:border-orange-400/70 shadow-lg"
                                                        : statusInfo.type === 'bunk'
                                                            ? "bg-gradient-to-r from-slate-700/40 to-slate-800/40 border-slate-500/50 hover:border-slate-400/70"
                                                            : "bg-gradient-to-r from-blue-700/40 to-blue-800/40 border-blue-500/50 hover:border-blue-400/70"
                                                )}
                                                variants={itemVariants}
                                                whileHover={{ y: -2 }}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="flex-shrink-0">
                                                            <motion.div
                                                                className={cn(
                                                                    "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2",
                                                                    statusInfo.type === 'makeup' 
                                                                        ? "bg-gradient-to-r from-orange-500 to-red-500 border-orange-400 text-white"
                                                                        : statusInfo.type === 'bunk'
                                                                            ? "bg-gradient-to-r from-slate-500 to-slate-600 border-slate-400 text-white"
                                                                            : "bg-gradient-to-r from-blue-500 to-blue-600 border-blue-400 text-white"
                                                                )}
                                                                animate={statusInfo.type === 'makeup' ? { rotate: [0, 360] } : {}}
                                                                transition={statusInfo.type === 'makeup' ? { duration: 3, repeat: Infinity, ease: "linear" } : {}}
                                                            >
                                                                {statusInfo.type === 'makeup' ? 'M' : statusInfo.type === 'bunk' ? 'O' : 'R'}
                                                            </motion.div>
                                                        </div>
                                                        <div>
                                                            <h4 className={cn("font-semibold", statusInfo.textColor)}>{subject?.name || cls.code}</h4>
                                                            <p className="text-sm text-gray-400">
                                                                {cls.time} • {statusInfo.status}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right space-y-2">
                                                        {/* Attendance Status */}
                                                        <span className={cn(
                                                            "px-3 py-1 rounded-lg text-xs font-medium border block",
                                                            attendanceStatus === 'attended' ? "bg-green-500/20 text-green-400 border-green-500/30" :
                                                            attendanceStatus === 'skipped' ? "bg-red-500/20 text-red-400 border-red-500/30" :
                                                            "bg-gray-500/20 text-gray-400 border-gray-500/30"
                                                        )}>
                                                            {attendanceStatus === 'attended' ? '✓ Attended' :
                                                             attendanceStatus === 'skipped' ? '✗ Missed' : 
                                                             'Not Recorded'}
                                                        </span>
                                                        {/* Class Type Badge */}
                                                        <span className={cn(
                                                            "px-2 py-1 rounded text-xs font-bold",
                                                            statusInfo.type === 'makeup' 
                                                                ? "bg-orange-500/30 text-orange-200"
                                                                : statusInfo.type === 'bunk'
                                                                    ? "bg-slate-500/30 text-slate-200"
                                                                    : "bg-blue-500/30 text-blue-200"
                                                        )}>
                                                            {statusInfo.type === 'makeup' ? 'MAKEUP' : 
                                                             statusInfo.type === 'bunk' ? 'OPTIONAL' : 'REQUIRED'}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                {/* Topics Section */}
                                                {classTopics[cls.code] && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        className="mt-4 pt-4 border-t border-gray-600/30"
                                                    >
                                                        <div className="flex items-center space-x-2 mb-3">
                                                            <BookOpenIcon className="w-4 h-4 text-cyan-400" />
                                                            <span className="text-sm font-medium text-cyan-400">Topics Covered</span>
                                                        </div>
                                                        
                                                        {classTopics[cls.code].topicHint && (
                                                            <div className="mb-3 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                                                                <div className="flex items-center space-x-2 mb-2">
                                                                    <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wide">Student Note</span>
                                                                </div>
                                                                <p className="text-sm text-cyan-100">{classTopics[cls.code].topicHint}</p>
                                                            </div>
                                                        )}
                                                        
                                                        {classTopics[cls.code].aiContent && (
                                                            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                                                                <div className="flex items-center space-x-2 mb-2">
                                                                    <span className="text-xs font-semibold text-purple-300 uppercase tracking-wide">AI Generated Study Material</span>
                                                                </div>
                                                                <div 
                                                                    className="text-sm text-purple-100 prose prose-sm prose-invert max-w-none"
                                                                    dangerouslySetInnerHTML={{ 
                                                                        __html: classTopics[cls.code].aiContent
                                                                            .replace(/\n/g, '<br>')
                                                                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                                            .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                                                            .replace(/^- (.+)/gm, '• $1')
                                                                    }}
                                                                />
                                                            </div>
                                                        )}
                                                        
                                                        {/* Study Materials Button */}
                                                        <div className="mt-3 flex justify-end">
                                                            <motion.button
                                                                onClick={() => handleViewStudyMaterials(cls.code)}
                                                                className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-medium rounded-lg transition-all duration-200 shadow-lg"
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                            >
                                                                <UserGroupIcon className="w-4 h-4" />
                                                                <span>View All Study Materials</span>
                                                            </motion.button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                                
                                                {/* Class Hints Section */}
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    className="mt-4 pt-4 border-t border-gray-600/30"
                                                >
                                                    <div className="flex items-center space-x-2 mb-3">
                                                        <BookOpenIcon className="w-4 h-4 text-amber-400" />
                                                        <span className="text-sm font-medium text-amber-400">Class Hints & Topics</span>
                                                        {validatingHints[cls.code] && (
                                                            <motion.div
                                                                animate={{ rotate: 360 }}
                                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                                className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full"
                                                            />
                                                        )}
                                                    </div>
                                                    
                                                    {/* Existing Hint Display */}
                                                    {classHints[cls.code] && (
                                                        <div className="mb-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-xs font-semibold text-amber-300 uppercase tracking-wide">
                                                                    {classHints[cls.code].includes('[AI-Flagged]') ? '⚠️ Flagged Hint' : 'Current Hint'}
                                                                </span>
                                                                <motion.button
                                                                    onClick={() => setClassHints(prev => ({ ...prev, [cls.code]: '' }))}
                                                                    className="text-xs text-red-400 hover:text-red-300"
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                >
                                                                    Clear
                                                                </motion.button>
                                                            </div>
                                                            <p className="text-sm text-amber-100">{classHints[cls.code]}</p>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Hint Input */}
                                                    <div className="space-y-2">
                                                        <input
                                                            type="text"
                                                            placeholder={`Add hint for ${subject?.name || cls.code}...`}
                                                            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-sm text-white placeholder-gray-400 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                                                            value={classHints[cls.code] || ''}
                                                            onChange={(e) => setClassHints(prev => ({ ...prev, [cls.code]: e.target.value }))}
                                                            onKeyPress={(e) => {
                                                                if (e.key === 'Enter' && classHints[cls.code]?.trim()) {
                                                                    saveClassHint(cls.code, classHints[cls.code]);
                                                                }
                                                            }}
                                                        />
                                                        
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs text-gray-500">
                                                                💡 AI will validate hints for accuracy
                                                            </span>
                                                            <motion.button
                                                                onClick={() => {
                                                                    if (classHints[cls.code]?.trim()) {
                                                                        saveClassHint(cls.code, classHints[cls.code]);
                                                                    }
                                                                }}
                                                                disabled={!classHints[cls.code]?.trim() || savingHints[cls.code]}
                                                                className="px-3 py-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-700 text-white text-xs font-medium rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                            >
                                                                {savingHints[cls.code] ? 'Saving...' : 'Save Hint'}
                                                            </motion.button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {totalClasses > 0 && (
                            <motion.div 
                                className="p-6 border-t border-gray-700/30 bg-gray-800/30"
                                variants={itemVariants}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-400">
                                        Attendance Rate for this day
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="text-lg font-bold text-primary-400">
                                            {totalClasses > 0 ? Math.round((attendedCount / totalClasses) * 100) : 0}%
                                        </div>
                                        <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ 
                                                    width: `${totalClasses > 0 ? (attendedCount / totalClasses) * 100 : 0}%` 
                                                }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        </div>
                        {/* End of scrollable content div */}
                    </motion.div>
                </motion.div>
            )}
            
            {/* Study Materials Modal */}
            {showStudyMaterials && selectedStudyClass && (
                <StudyMaterialsModal
                    isOpen={showStudyMaterials}
                    onClose={() => {
                        setShowStudyMaterials(false);
                        setSelectedStudyClass(null);
                    }}
                    classCode={selectedStudyClass}
                />
            )}
        </AnimatePresence>
    );
}
