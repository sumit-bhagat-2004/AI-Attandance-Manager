import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ClockIcon,
    CalendarIcon,
    ChevronRightIcon,
    BookOpenIcon,
    AcademicCapIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import MakeupModal from './MakeupModal';

export default function MakeupView({ userData, subjects = {}, onMakeupSelect, onRescheduleMakeup, onRemoveMakeup, currentUser }) {
    const [showMakeupModal, setShowMakeupModal] = useState(false);
    const [selectedMakeupIndex, setSelectedMakeupIndex] = useState(0);
    
    // Handle multiple makeups
    const makeups = userData.makeups || [];
    const hasSelectedMakeup = userData.makeup && userData.makeup.makeupDate;
    
    const handleMakeupSelection = (makeupClass) => {
        if (onMakeupSelect) {
            // Get the subject for the selected makeup index
            const selectedMakeup = makeups[selectedMakeupIndex];
            const makeupInfo = {
                subjectToMakeup: selectedMakeup?.subjectToMakeup,
                makeupIndex: selectedMakeupIndex
            };
            
            // Pass both the targetClass and makeup info
            onMakeupSelect(makeupClass, makeupInfo);
        }
        setShowMakeupModal(false);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.3,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.3 }
        }
    };

    const getAvailableMakeupClasses = () => {
        if (!userData.history || !subjects) {
            return [];
        }

        // Get all classes that user attended (can potentially be makeup options)
        const attendedClasses = [];
        
        Object.entries(userData.history).forEach(([dateStr, dayHistory]) => {
            Object.entries(dayHistory).forEach(([classCode, status]) => {
                if (status === 'present' && !classCode.startsWith('LAB') && !classCode.startsWith('TRAIN') && !classCode.startsWith('PE-') && !classCode.startsWith('OE-')) {
                    // Only include core subjects that user has attended
                    const subject = subjects[classCode];
                    if (subject && !attendedClasses.some(ac => ac.code === classCode)) {
                        const date = new Date(dateStr);
                        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                        
                        attendedClasses.push({
                            name: subject.name,
                            code: classCode,
                            day: dayName,
                            time: 'Various Times', // Could be enhanced to show actual times
                            lastAttended: dateStr
                        });
                    }
                }
            });
        });

        // Filter to only show subjects that are relevant for makeup
        // (subjects where user has missed classes and also has attended some)
        const relevantMakeupOptions = attendedClasses.filter(attendedClass => {
            // Check if user has any skipped classes for this subject
            const hasSkippedThis = Object.entries(userData.history).some(([dateStr, dayHistory]) => 
                dayHistory[attendedClass.code] === 'skipped'
            );
            
            // Check if this subject is needed for makeup
            const isNeededForMakeup = makeups.some(m => m.subjectToMakeup === attendedClass.code);
            
            return hasSkippedThis || isNeededForMakeup;
        });

        return relevantMakeupOptions;
    };

    const availableMakeupClasses = getAvailableMakeupClasses();

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="card-gradient p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <motion.div
                            className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg"
                            whileHover={{ scale: 1.05, rotate: 5 }}
                        >
                            <ExclamationTriangleIcon className="w-6 h-6 text-white" />
                        </motion.div>
                        <div>
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                                Makeup Management
                            </h2>
                            <p className="text-gray-400 text-sm">Manage your makeup classes and attendance requirements</p>
                        </div>
                    </div>
                    
                    <div className="text-right">
                        <div className="text-2xl font-bold text-white">
                            {makeups.length > 0 ? makeups.length : (userData.makeup?.needed ? 1 : 0)}
                        </div>
                        <div className="text-sm text-gray-400">Pending Makeups</div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 p-4 rounded-xl border border-orange-500/30">
                        <div className="text-orange-400 text-sm font-medium mb-1">Required</div>
                        <div className="text-2xl font-bold text-white">{makeups.length || (userData.makeup?.needed ? 1 : 0)}</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-4 rounded-xl border border-blue-500/30">
                        <div className="text-blue-400 text-sm font-medium mb-1">Scheduled</div>
                        <div className="text-2xl font-bold text-white">
                            {makeups.filter(m => m.status === 'scheduled').length || (hasSelectedMakeup ? 1 : 0)}
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-4 rounded-xl border border-green-500/30">
                        <div className="text-green-400 text-sm font-medium mb-1">Completed</div>
                        <div className="text-2xl font-bold text-white">
                            {makeups.filter(m => m.status === 'completed').length}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Current Makeup Status */}
            {makeups && makeups.length > 0 ? (
                <motion.div variants={itemVariants} className="space-y-4">
                    <h3 className="text-xl font-bold text-white mb-4">Current Makeup Requirements</h3>
                    {makeups.map((makeup, index) => {
                        const missedSubject = subjects[makeup.subjectToMakeup];
                        const hasSelectedMakeup = makeup.status === 'scheduled' || makeup.status === 'completed' || makeup.makeupDate;
                        
                        return (
                            <motion.div
                                key={index}
                                className={`card-gradient p-6 rounded-2xl border transition-all duration-200 ${
                                    hasSelectedMakeup 
                                        ? "border-green-500/30 bg-green-500/5" 
                                        : "border-orange-500/30 bg-orange-500/5"
                                }`}
                                whileHover={{ scale: 1.01 }}
                            >
                                <div className="flex items-start space-x-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                        hasSelectedMakeup 
                                            ? "bg-green-500/20 text-green-400" 
                                            : "bg-orange-500/20 text-orange-400"
                                    }`}>
                                        {hasSelectedMakeup ? (
                                            <CheckCircleIcon className="w-6 h-6" />
                                        ) : (
                                            <ExclamationTriangleIcon className="w-6 h-6" />
                                        )}
                                    </div>
                                    
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className={`text-lg font-bold ${
                                                hasSelectedMakeup ? "text-green-400" : "text-orange-400"
                                            }`}>
                                                {hasSelectedMakeup ? "Makeup Class Scheduled" : "Makeup Required"}
                                                {makeups.length > 1 && (
                                                    <span className="ml-2 text-xs bg-gray-500/20 text-gray-300 px-2 py-1 rounded-full">
                                                        {index + 1} of {makeups.length}
                                                    </span>
                                                )}
                                            </h3>
                                            
                                            {!hasSelectedMakeup && (
                                                <motion.button
                                                    onClick={() => {
                                                        setSelectedMakeupIndex(index);
                                                        setShowMakeupModal(true);
                                                    }}
                                                    className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-300 rounded-lg font-medium transition-colors text-sm"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    Choose Makeup
                                                </motion.button>
                                            )}
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <AcademicCapIcon className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-300">
                                                    Missed: <span className="font-medium text-white">{missedSubject?.name || makeup.subjectToMakeup || 'Unknown Subject'}</span>
                                                </span>
                                            </div>
                                            
                                            {makeup.missedDate && (
                                                <div className="flex items-center space-x-2">
                                                    <ClockIcon className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-300">
                                                        Missed on: {new Date(makeup.missedDate).toLocaleDateString('en-US', {
                                                            weekday: 'short',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                            )}
                                            
                                            {hasSelectedMakeup && makeup.makeupDate ? (
                                                <div className="flex items-center space-x-2">
                                                    <CalendarIcon className="w-4 h-4 text-green-400" />
                                                    <span className="text-sm text-green-300">
                                                        Scheduled: {new Date(makeup.makeupDate).toLocaleDateString('en-US', {
                                                            weekday: 'short',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}{makeup.makeupTime && ` at ${makeup.makeupTime}`}
                                                    </span>
                                                </div>
                                            ) : !hasSelectedMakeup && (
                                                <p className="text-sm text-gray-400">
                                                    You skipped a mandatory {missedSubject?.name || makeup.subjectToMakeup} class. Please select a makeup class from the recommended bunks.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                {hasSelectedMakeup && (
                                    <div className="mt-4 space-y-3">
                                        {/* Success Message */}
                                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                                            <p className="text-xs text-green-300 text-center font-medium">
                                                ✅ Your makeup class is now marked as mandatory. Make sure to attend!
                                            </p>
                                        </div>
                                        
                                        {/* Action Buttons */}
                                        <div className="flex items-center justify-center space-x-3">
                                            <motion.button
                                                onClick={() => onRescheduleMakeup && onRescheduleMakeup(makeup.subjectToMakeup, index)}
                                                className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 rounded-lg font-medium transition-all duration-200 text-sm"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                title="Reschedule makeup class"
                                            >
                                                <ClockIcon className="w-4 h-4" />
                                                <span>Reschedule</span>
                                            </motion.button>
                                            <motion.button
                                                onClick={() => onRemoveMakeup && onRemoveMakeup(makeup.subjectToMakeup, index)}
                                                className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 rounded-lg font-medium transition-all duration-200 text-sm"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                title="Remove makeup class"
                                            >
                                                <span>✕</span>
                                                <span>Remove</span>
                                            </motion.button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </motion.div>
            ) : userData.makeup && (userData.makeup.makeupTarget || userData.makeup.required) ? (
                <motion.div variants={itemVariants} className="card-gradient p-6 rounded-2xl border border-orange-500/50">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="text-xl font-bold text-orange-400 mb-2">
                                Makeup Required
                                {userData.makeup.makeupTarget && `: ${subjects[userData.makeup.makeupTarget]?.name}`}
                            </h3>
                            <p className="text-gray-300 mb-4">
                                You missed {userData.makeup.missedCount || 1} class{(userData.makeup.missedCount || 1) > 1 ? 'es' : ''} and need to attend a makeup session.
                            </p>
                        </div>
                        <div className="flex items-center space-x-2 px-3 py-1 bg-orange-500/20 rounded-full">
                            <ExclamationTriangleIcon className="w-4 h-4 text-orange-400" />
                            <span className="text-sm font-medium text-orange-400">Pending</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center space-x-4 text-sm text-gray-300">
                            {userData.makeup.missedDate && (
                                <div className="flex items-center space-x-2">
                                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                                    <span>Missed: {new Date(userData.makeup.missedDate).toLocaleDateString()}</span>
                                </div>
                            )}
                            {userData.makeup.deadline && (
                                <div className="flex items-center space-x-2">
                                    <ClockIcon className="w-4 h-4 text-red-400" />
                                    <span className="text-red-400">Deadline: {new Date(userData.makeup.deadline).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>

                        {/* Progress Bar */}
                        {userData.makeup.makeupTarget && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400">Progress</span>
                                    <span className="text-gray-400">
                                        {hasSelectedMakeup ? '1/1' : '0/1'} completed
                                    </span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <motion.div
                                        className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                                        style={{ width: hasSelectedMakeup ? '100%' : '0%' }}
                                        initial={{ width: 0 }}
                                        animate={{ width: hasSelectedMakeup ? '100%' : '0%' }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>

                                {hasSelectedMakeup ? (
                                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <CheckCircleIcon className="w-5 h-5 text-green-400" />
                                            <span className="font-medium text-green-300">Makeup Class Selected</span>
                                        </div>
                                        <div className="text-sm text-gray-300 space-y-1">
                                            <div>Subject: {subjects[userData.makeup.makeupTarget]?.name}</div>
                                            <div>Date: {new Date(userData.makeup.makeupDate).toLocaleDateString()}</div>
                                            <div>Time: {userData.makeup.makeupTime}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                                        <p className="text-red-300 mb-3">
                                            You need to select a makeup class from the same subject's recommended bunks.
                                        </p>
                                        <motion.button
                                            onClick={() => setShowMakeupModal(true)}
                                            className="flex items-center space-x-2 px-4 py-2 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/40 text-orange-300 rounded-lg font-medium transition-colors"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <span>Select Makeup Class</span>
                                            <ChevronRightIcon className="w-4 h-4" />
                                        </motion.button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            ) : (
                <motion.div variants={itemVariants} className="card-gradient p-8 rounded-2xl border border-green-500/30 text-center">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircleIcon className="w-10 h-10 text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-green-400 mb-2">All Caught Up! 🎉</h3>
                    <p className="text-gray-300">You don't have any pending makeup classes at the moment.</p>
                </motion.div>
            )}

            {/* Available Makeup Classes */}
            {makeups.length > 0 && (
                <motion.div variants={itemVariants} className="card-gradient p-6 rounded-2xl">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                        <BookOpenIcon className="w-6 h-6 text-cyan-400" />
                        <span>Classes You Can Attend for Makeup</span>
                        <span className="text-sm bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full">
                            {availableMakeupClasses.length} subjects
                        </span>
                    </h3>
                    
                    {availableMakeupClasses.length > 0 ? (
                        <>
                            <p className="text-gray-400 text-sm mb-4">
                                These are subjects you've previously attended that can serve as makeup options for your missed classes.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {availableMakeupClasses.map((makeupClass, index) => (
                                    <motion.div
                                        key={`${makeupClass.code}-${index}`}
                                        variants={itemVariants}
                                        className="p-4 bg-gradient-to-br from-gray-800/50 to-gray-700/30 rounded-xl border border-gray-600/50 hover:border-cyan-500/50 transition-all duration-200"
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                                                <AcademicCapIcon className="w-5 h-5 text-cyan-400" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-white mb-1">{makeupClass.name}</h4>
                                                <div className="text-xs text-gray-400 space-y-1">
                                                    <div className="text-cyan-400 font-medium">{makeupClass.code}</div>
                                                    <div className="flex items-center space-x-1">
                                                        <CheckCircleIcon className="w-3 h-3 text-green-400" />
                                                        <span className="text-green-400">Previously attended</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <CalendarIcon className="w-3 h-3" />
                                                        <span>Last: {new Date(makeupClass.lastAttended).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-600/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <BookOpenIcon className="w-8 h-8 text-gray-500" />
                            </div>
                            <p className="text-gray-400 mb-2">No makeup options available at the moment.</p>
                            <p className="text-gray-500 text-sm">
                                You haven't attended any classes in the subjects you need makeup for, so there are no suitable makeup classes to recommend.
                            </p>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Makeup Selection Modal */}
            <AnimatePresence>
                {showMakeupModal && (
                    <MakeupModal 
                        userData={userData} 
                        onSelect={handleMakeupSelection} 
                        onClose={() => setShowMakeupModal(false)}
                        selectedSubject={makeups[selectedMakeupIndex]?.subjectToMakeup}
                        currentUser={currentUser}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}
