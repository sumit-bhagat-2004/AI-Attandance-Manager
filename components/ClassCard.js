import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    ClockIcon,
    AcademicCapIcon,
    CheckIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { bunkSchedule, mandatorySchedule, isMandatoryClass, subjects } from '../lib/scheduleData';
import { cn } from '../lib/utils';
import AITopicsModal from './AITopicsModal';

export default function ClassCard({
    classInfo,
    dayDate,
    isRecommendedBunk,
    isMakeupTarget,
    isPast,
    attendanceStatus,
    onToggleAttendance,
    weekInCycle,
    onGetClassTopics,
    currentUser,
    onSubjectChange,
    userData
}) {
    const [showAIModal, setShowAIModal] = useState(false);
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const [showSubjectChange, setShowSubjectChange] = useState(false);
    
    // Get subject info with subject change handling
    const subject = subjects[classInfo.code];
    
    // Check for subject changes on this date
    const getDisplaySubject = () => {
        const classDate = dayDate ? new Date(dayDate) : new Date();
        const dateStr = classDate.toISOString().split('T')[0];
        const changeKey = `${dateStr}-${classInfo.code}`;
        
        // Check if subject was changed for this class on this date
        if (userData?.subjectChanges?.[changeKey]) {
            const change = userData.subjectChanges[changeKey];
            const newSubject = subjects[change.newSubject];
            return {
                ...newSubject,
                isChanged: true,
                originalSubject: subject?.name || classInfo.code,
                changeReason: change.reason,
                newSubjectCode: change.newSubject // Store the new subject code
            };
        }
        
        return { ...subject, isChanged: false };
    };
    
    const displaySubject = getDisplaySubject();
    const subjectName = displaySubject?.name || classInfo.code;

    // Get the effective subject code (changed subject or original)
    const effectiveSubjectCode = displaySubject.isChanged ? displaySubject.newSubjectCode : classInfo.code;

    // Determine if this class is mandatory (for 80% attendance requirement)
    const classDate = dayDate ? new Date(dayDate) : new Date();
    const isMandatoryFor80Percent = isMandatoryClass(weekInCycle, classDate.getDay(), effectiveSubjectCode) || isMakeupTarget;

    // Determine card styling based on type with inline styles for guaranteed colors
    const cardStyles = useMemo(() => {
        // Past classes
        if (isPast) {
            // If attendance was never recorded, show as neutral/unrecorded
            if (!attendanceStatus || attendanceStatus === 'unrecorded') {
                return {
                    backgroundColor: 'rgba(107, 114, 128, 0.2)', // Gray background for unrecorded
                    borderColor: '#6b7280',
                    text: 'text-white',
                    status: 'Not Recorded'
                };
            }
            
            const attended = attendanceStatus === 'attended';
            return {
                backgroundColor: attended 
                    ? 'rgba(34, 197, 94, 0.2)' // Green background
                    : 'rgba(239, 68, 68, 0.2)', // Red background
                borderColor: attended ? '#22c55e' : '#ef4444',
                text: 'text-white',
                status: attended ? 'Attended' : 'Missed'
            };
        }

        // Future/current classes - Check makeup target FIRST
        if (isMakeupTarget) {
            return {
                backgroundColor: 'rgba(251, 146, 60, 0.3)', // Orange background
                borderColor: '#fb923c',
                text: 'text-white',
                status: 'Makeup Class'
            };
        }

        if (isRecommendedBunk && !isMakeupTarget) {
            return {
                backgroundColor: 'rgba(100, 116, 139, 0.2)', // Slate background
                borderColor: '#64748b',
                text: 'text-white',
                status: 'Optional'
            };
        }

        // Regular mandatory class (positive color for 80% requirement)
        return {
            backgroundColor: 'rgba(59, 130, 246, 0.3)', // Blue background
            borderColor: '#3b82f6',
            text: 'text-white',
            status: 'Required for 80%'
        };
    }, [isPast, isMakeupTarget, isRecommendedBunk, attendanceStatus]);

    const handleAttendClick = () => {
        onToggleAttendance(effectiveSubjectCode, 'attended');
    };

    const handleSkipClick = () => {
        onToggleAttendance(effectiveSubjectCode, 'skipped');
    };

    const handleAITopicsClick = () => {
        setShowAIModal(true);
    };

    const handleSubjectChange = (newSubjectCode) => {
        if (onSubjectChange) {
            onSubjectChange(classInfo.code, newSubjectCode, dayDate);
        }
        setShowSubjectChange(false);
    };

    const handleGenerateTopics = async (classCode, hint) => {
        setIsLoadingAI(true);
        try {
            // Format date for storage
            const dateStr = dayDate ? 
                dayDate.getFullYear() + '-' + 
                String(dayDate.getMonth() + 1).padStart(2, '0') + '-' + 
                String(dayDate.getDate()).padStart(2, '0') : null;
                
            await onGetClassTopics(classCode, hint, dateStr);
            setShowAIModal(false);
        } catch (error) {
            console.error('Error generating topics:', error);
        } finally {
            setIsLoadingAI(false);
        }
    };

    const handleStoreHint = async (classCode, hint) => {
        if (!currentUser || !dayDate) return;
        
        try {
            const dateStr = dayDate.getFullYear() + '-' + 
                String(dayDate.getMonth() + 1).padStart(2, '0') + '-' + 
                String(dayDate.getDate()).padStart(2, '0');
                
            const response = await fetch('/api/topics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'store_topic_hint',
                    payload: { 
                        user: currentUser, 
                        classCode, 
                        date: dateStr, 
                        topicHint: hint 
                    }
                }),
            });
            
            if (response.ok) {
                console.log('Topic hint stored successfully');
                // Show success message or toast here if needed
            } else {
                throw new Error('Failed to store topic hint');
            }
        } catch (error) {
            console.error('Error storing hint:', error);
            throw error; // Re-throw to let modal handle it
        }
    };



    return (
        <motion.div
            className="rounded-xl transition-all duration-300 h-full border-2 backdrop-blur-sm shadow-lg"
            style={{
                backgroundColor: cardStyles.backgroundColor,
                borderColor: cardStyles.borderColor
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
            }}
            layout
        >
            <div className="p-4 h-full flex flex-col gap-3">
                {/* Header - Clean and spacious */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div 
                            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border shadow-md"
                            style={{
                                backgroundColor: isMakeupTarget 
                                    ? 'rgba(251, 146, 60, 0.8)'
                                    : isRecommendedBunk && !isMakeupTarget
                                        ? 'rgba(100, 116, 139, 0.8)'
                                        : isPast 
                                            ? attendanceStatus === 'attended' 
                                                ? 'rgba(34, 197, 94, 0.8)'
                                                : 'rgba(239, 68, 68, 0.8)'
                                            : 'rgba(37, 99, 235, 0.8)',
                                borderColor: isMakeupTarget 
                                    ? 'rgb(251, 146, 60)'
                                    : isRecommendedBunk && !isMakeupTarget
                                        ? 'rgb(100, 116, 139)'
                                        : isPast 
                                            ? attendanceStatus === 'attended' 
                                                ? 'rgb(34, 197, 94)'
                                                : 'rgb(239, 68, 68)'
                                            : 'rgb(37, 99, 235)',
                                color: 'white'
                            }}
                        >
                            <AcademicCapIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-bold text-base text-white leading-tight">
                                    {subjectName}
                                </h3>
                                {displaySubject.isChanged && (
                                    <span className="px-2 py-1 text-xs bg-orange-500/20 text-orange-300 rounded-full border border-orange-500/30">
                                        Changed
                                    </span>
                                )}
                            </div>
                            {displaySubject.isChanged && (
                                <div className="text-xs text-gray-400 mb-1">
                                    <span className="text-gray-500">Originally:</span> <span className="line-through">{displaySubject.originalSubject}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <span className="font-mono">{classInfo.code}</span>
                                {weekInCycle && (
                                    <>
                                        <span>•</span>
                                        <span className="font-semibold text-cyan-400">Week {weekInCycle}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Status badge - Clean */}
                    <div 
                        className="px-3 py-1.5 rounded-full text-xs font-bold text-center border shadow-sm"
                        style={{
                            backgroundColor: isMakeupTarget 
                                ? 'rgba(251, 146, 60, 0.9)'
                                : isRecommendedBunk && !isMakeupTarget
                                    ? 'rgba(100, 116, 139, 0.9)'
                                    : isPast 
                                        ? attendanceStatus === 'attended' 
                                            ? 'rgba(34, 197, 94, 0.9)'
                                            : 'rgba(239, 68, 68, 0.9)'
                                        : 'rgba(37, 99, 235, 0.9)',
                            borderColor: isMakeupTarget 
                                ? 'rgb(251, 146, 60)'
                                : isRecommendedBunk && !isMakeupTarget
                                    ? 'rgb(100, 116, 139)'
                                    : isPast 
                                        ? attendanceStatus === 'attended' 
                                            ? 'rgb(34, 197, 94)'
                                            : 'rgb(239, 68, 68)'
                                        : 'rgb(37, 99, 235)',
                            color: 'white'
                        }}
                    >
                        {cardStyles.status}
                    </div>
                </div>

                {/* Time and Action Buttons Row */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <ClockIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-300">{classInfo.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Subject Change Button - For teacher absence */}
                        {!isPast && onSubjectChange && (
                            <motion.button
                                onClick={() => setShowSubjectChange(!showSubjectChange)}
                                className="px-2 py-1 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 border border-orange-400 text-white shadow-md text-xs font-semibold transition-all duration-200"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                title="Change subject due to teacher absence"
                            >
                                📚
                            </motion.button>
                        )}
                        
                        {/* AI Topics Button */}
                        {onGetClassTopics && !isPast && (
                            <motion.button
                                onClick={handleAITopicsClick}
                                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 border border-purple-400 text-white shadow-md text-xs font-semibold transition-all duration-200 flex items-center gap-2"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span>🤖</span>
                                <span>AI Topics</span>
                            </motion.button>
                        )}
                    </div>
                </div>

                {/* Subject Change Dropdown */}
                {showSubjectChange && !isPast && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-gray-800/50 border border-gray-600 rounded-lg p-3 space-y-2"
                    >
                        <p className="text-xs text-gray-300 mb-2">Select replacement subject:</p>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries(subjects).map(([code, subject]) => (
                                code !== classInfo.code && (
                                    <motion.button
                                        key={code}
                                        onClick={() => handleSubjectChange(code)}
                                        className="px-2 py-1 bg-gray-700 hover:bg-gray-600 border border-gray-500 rounded text-xs text-white transition-all duration-200"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {subject.name}
                                    </motion.button>
                                )
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Special indicators - Clean */}
                {isMakeupTarget && (
                    <div className="bg-gradient-to-r from-orange-500/30 to-red-500/30 border border-orange-400/50 rounded-lg p-2 shadow-lg">
                        <p className="text-xs text-center font-bold text-orange-200 flex items-center justify-center gap-2">
                            <span>🎯</span>
                            <span>Makeup Class</span>
                        </p>
                        <p className="text-xs text-center text-orange-300 mt-1">
                            Scheduled Makeup
                        </p>
                    </div>
                )}

                {isRecommendedBunk && !isMakeupTarget && (
                    <div className="bg-slate-500/20 border border-slate-400/40 rounded-lg p-2">
                        <p className="text-xs text-center font-bold text-slate-200 flex items-center justify-center gap-2">
                            <span>💡</span>
                            <span>Can Skip (80% Safe)</span>
                        </p>
                    </div>
                )}

                {/* Action buttons - Clean layout */}
                <div className="mt-auto pt-2">
                    {(!isPast || (!attendanceStatus || attendanceStatus === 'unrecorded')) ? (
                        <div className="space-y-3">
                            {/* Show note for past unrecorded classes */}
                            {isPast && (!attendanceStatus || attendanceStatus === 'unrecorded') && (
                                <div className="text-xs text-center py-2 bg-gray-700/50 rounded-lg border border-gray-600/50">
                                    <span className="text-amber-400">⏰ Record past attendance</span>
                                </div>
                            )}
                            
                            {/* Makeup classes - Both buttons (highest priority) */}
                            {isMakeupTarget ? (
                                <div className="grid grid-cols-2 gap-2">
                                    <motion.button
                                        onClick={handleAttendClick}
                                        className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 border border-emerald-300 text-white shadow-md text-xs font-semibold transition-all duration-200"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <CheckIcon className="w-4 h-4" />
                                        <span>Complete</span>
                                    </motion.button>
                                    
                                    <motion.button
                                        onClick={handleSkipClick}
                                        className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 border border-orange-400 text-white shadow-md text-xs font-semibold transition-all duration-200"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <XMarkIcon className="w-4 h-4" />
                                        <span>Skip</span>
                                    </motion.button>
                                </div>
                            ) : isRecommendedBunk ? (
                                /* Recommended bunks - Smart buttons */
                                <>
                                    {isPast && (!attendanceStatus || attendanceStatus === 'unrecorded') ? (
                                        <div className="grid grid-cols-2 gap-2">
                                            <motion.button
                                                onClick={handleAttendClick}
                                                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 border border-cyan-400 text-white shadow-md text-xs font-semibold transition-all duration-200"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <CheckIcon className="w-4 h-4" />
                                                <span>Attended</span>
                                            </motion.button>
                                            <motion.button
                                                onClick={handleSkipClick}
                                                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 border border-gray-400 text-white shadow-md text-xs font-semibold transition-all duration-200"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <XMarkIcon className="w-4 h-4" />
                                                <span>Skipped</span>
                                            </motion.button>
                                        </div>
                                    ) : (
                                        <motion.button
                                            onClick={handleAttendClick}
                                            className="w-full flex items-center justify-center gap-2 py-3 px-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 border border-cyan-400 text-white shadow-md text-sm font-semibold transition-all duration-200"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <CheckIcon className="w-4 h-4" />
                                            <span>Mark as Attended</span>
                                        </motion.button>
                                    )}
                                </>
                            ) : (
                                /* Default: All other classes (including mandatory and changed subjects) - Show both Attend and Skip */
                                <div className="grid grid-cols-2 gap-2">
                                    <motion.button
                                        onClick={handleAttendClick}
                                        className={cn(
                                            "flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-white shadow-md text-xs font-semibold transition-all duration-200",
                                            displaySubject.isChanged 
                                                ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border border-purple-400"
                                                : isMandatoryFor80Percent
                                                    ? "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 border border-emerald-400"
                                                    : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border border-blue-400"
                                        )}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <CheckIcon className="w-4 h-4" />
                                        <span>Attend</span>
                                    </motion.button>
                                    
                                    <motion.button
                                        onClick={handleSkipClick}
                                        className={cn(
                                            "flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-white shadow-md text-xs font-semibold transition-all duration-200",
                                            displaySubject.isChanged 
                                                ? "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 border border-orange-400"
                                                : isMandatoryFor80Percent
                                                    ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border border-red-400"
                                                    : "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 border border-gray-400"
                                        )}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <XMarkIcon className="w-4 h-4" />
                                        <span>Skip</span>
                                    </motion.button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center justify-center py-2 bg-gray-700/30 rounded-lg">
                                <div className={cn(
                                    "flex items-center gap-2 text-sm font-semibold",
                                    attendanceStatus === 'attended' ? "text-green-400" : "text-red-400"
                                )}>
                                    {attendanceStatus === 'attended' ? (
                                        <CheckIcon className="w-4 h-4" />
                                    ) : (
                                        <XMarkIcon className="w-4 h-4" />
                                    )}
                                    <span>{cardStyles.status}</span>
                                </div>
                            </div>
                            
                            {/* Remove Attendance Button - Show for any recorded attendance */}
                            {(attendanceStatus === 'attended' || attendanceStatus === 'skipped' || attendanceStatus === 'present' || attendanceStatus === 'absent' || attendanceStatus === 'late') && (
                                <motion.button
                                    onClick={() => onToggleAttendance(effectiveSubjectCode, 'unrecorded')}
                                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-gradient-to-r from-orange-600/40 to-red-600/40 hover:from-orange-600/60 hover:to-red-600/60 border border-orange-400/60 text-orange-200 hover:text-orange-100 shadow-md text-xs font-semibold transition-all duration-200"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    title="Remove this attendance record"
                                >
                                    <span>🗑️</span>
                                    <span>Remove Record</span>
                                </motion.button>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            {/* AI Topics Modal */}
            <AITopicsModal
                isOpen={showAIModal}
                onClose={() => setShowAIModal(false)}
                classCode={effectiveSubjectCode}
                subjectName={subjectName}
                onGenerateTopics={handleGenerateTopics}
                onStoreHint={currentUser ? handleStoreHint : null}
                isLoading={isLoadingAI}
            />
        </motion.div>
    );
}
