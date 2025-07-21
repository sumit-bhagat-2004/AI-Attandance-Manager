import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    XMarkIcon, 
    AcademicCapIcon, 
    CalendarIcon, 
    ClockIcon,
    ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { fullSchedule, bunkSchedule, mandatorySchedule, subjects } from '../lib/scheduleData';
import { cn, formatDateToLocalString } from '../lib/utils';

export default function MakeupModal({ userData, onSelect, onClose, selectedSubject }) {
    const getFutureBunks = useCallback(() => {
        const bunks = [];
        const today = new Date();
        const cycleStartDate = new Date(userData.cycleStartDate);
        const missedSubject = selectedSubject || userData.makeup?.subjectToMakeup; // The subject that was missed

        // Look ahead for the next 10 weeks (70 days) to find makeup opportunities
        for (let dayOffset = 1; dayOffset < 70; dayOffset++) { // Start from tomorrow
            const futureDate = new Date(today);
            futureDate.setDate(today.getDate() + dayOffset);
            
            const diffTime = Math.abs(futureDate - cycleStartDate);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            const weekInCycle = (Math.floor(diffDays / 7) % 5) + 1;
            const dayOfWeek = futureDate.getDay();

            // Get all classes for this day from the full schedule
            const daySchedule = fullSchedule[dayOfWeek] || [];
            const dailyBunks = bunkSchedule[weekInCycle]?.[dayOfWeek] || [];
            const permanentBunks = bunkSchedule['permanent']?.[dayOfWeek] || [];
            const allDailyBunks = [...dailyBunks, ...permanentBunks];
            
            // Find ALL classes of the missed subject (including both bunkable and mandatory ones)
            daySchedule.forEach(classInfo => {
                if (classInfo.code === missedSubject) {
                    // Only include classes that are marked as "recommended bunk" for that week
                    // This ensures the user can only select makeup classes from their available bunk slots
                    if (allDailyBunks.includes(classInfo.code)) {
                        bunks.push({
                            date: formatDateToLocalString(futureDate),
                            code: classInfo.code,
                            time: classInfo.time,
                            weekInCycle: weekInCycle,
                            dayName: futureDate.toLocaleDateString('en-US', { weekday: 'long' })
                        });
                    }
                }
            });
        }
        
        // Sort by date and return next 10 options
        return bunks.sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 10);
    }, [userData.cycleStartDate, selectedSubject, userData.makeup?.subjectToMakeup]);

    const futureBunks = getFutureBunks();

    return (
        <AnimatePresence>
            <motion.div 
                className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div 
                    className="glass-card rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-700/50 overflow-hidden"
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="relative p-6 bg-gradient-to-r from-accent-600/20 to-primary-600/20 border-b border-gray-700/50">
                        <motion.button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition-colors group"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <XMarkIcon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                        </motion.button>
                        
                        <div className="flex items-center space-x-4">
                            <motion.div
                                className="w-12 h-12 bg-gradient-to-r from-accent-500 to-primary-500 rounded-xl flex items-center justify-center shadow-lg"
                                initial={{ rotate: 0 }}
                                animate={{ rotate: 360 }}
                                transition={{ duration: 0.8, ease: "easeInOut" }}
                            >
                                <AcademicCapIcon className="w-6 h-6 text-white" />
                            </motion.div>
                            <div>
                                <h3 className="text-2xl font-bold bg-gradient-to-r from-accent-400 to-primary-400 bg-clip-text text-transparent">
                                    Choose Makeup Class
                                </h3>
                                <p className="text-gray-400 mt-1">
                                    You missed a mandatory class for <span className="text-accent-300 font-semibold">{subjects[selectedSubject || userData.makeup?.subjectToMakeup]?.name}</span>. Select a future "Recommended Bunk" to attend as makeup.
                                </p>
                            </div>
                        </div>
                        
                        {/* Warning Notice */}
                        <motion.div 
                            className="mt-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-xl flex items-center space-x-3"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <ExclamationTriangleIcon className="w-5 h-5 text-orange-400 flex-shrink-0" />
                            <p className="text-sm text-orange-200">
                                This will become a <strong>mandatory class</strong> for you to maintain your attendance percentage.
                            </p>
                        </motion.div>
                    </div>

                    {/* Content */}
                    <div className="p-6 max-h-80 overflow-y-auto custom-scrollbar">
                        {futureBunks.length > 0 ? (
                            <motion.div 
                                className="space-y-3"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3, staggerChildren: 0.1 }}
                            >
                                {futureBunks.map((bunk, index) => {
                                    const subject = subjects[bunk.code];
                                    const date = new Date(bunk.date);
                                    const isRecentOption = index < 3;
                                    
                                    return (
                                        <motion.button 
                                            key={`${bunk.date}-${bunk.code}`}
                                            onClick={() => onSelect(bunk)}
                                            className={cn(
                                                "w-full text-left p-4 rounded-xl transition-all duration-300 group relative overflow-hidden",
                                                "bg-gray-800/50 hover:bg-gradient-to-r hover:from-primary-600/20 hover:to-secondary-600/20",
                                                "border border-gray-700/50 hover:border-primary-500/50",
                                                "transform hover:scale-[1.02] hover:-translate-y-1",
                                                isRecentOption && "ring-1 ring-accent-500/30"
                                            )}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            whileHover={{ 
                                                boxShadow: "0 8px 30px rgba(59, 130, 246, 0.15)" 
                                            }}
                                        >
                                            {/* Background Gradient on Hover */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 to-secondary-500/0 group-hover:from-primary-500/10 group-hover:to-secondary-500/10 transition-all duration-300" />
                                            
                                            <div className="relative flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <div className={cn(
                                                            "w-3 h-3 rounded-full",
                                                            isRecentOption ? "bg-accent-400 animate-pulse" : "bg-primary-400"
                                                        )} />
                                                        <h4 className="font-semibold text-white group-hover:text-primary-200 transition-colors">
                                                            {subject?.name || 'Unknown Subject'}
                                                        </h4>
                                                        {isRecentOption && (
                                                            <span className="px-2 py-1 text-xs bg-accent-500/20 text-accent-300 rounded-full">
                                                                Next Available
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="space-y-2">
                                                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                                                            <div className="flex items-center space-x-1">
                                                                <CalendarIcon className="w-4 h-4" />
                                                                <span>
                                                                    {date.toLocaleDateString('en-US', { 
                                                                        weekday: 'long', 
                                                                        month: 'short', 
                                                                        day: 'numeric' 
                                                                    })}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <ClockIcon className="w-4 h-4" />
                                                                <span className="font-medium text-gray-300">{bunk.time}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2 text-xs">
                                                            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
                                                                Week {bunk.weekInCycle} of Cycle
                                                            </span>
                                                            <span className="text-gray-500">•</span>
                                                            <span className="text-gray-400">Code: {bunk.code}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <motion.div
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                                    whileHover={{ x: 5 }}
                                                >
                                                    <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center">
                                                        <span className="text-primary-400 text-sm font-bold">→</span>
                                                    </div>
                                                </motion.div>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </motion.div>
                        ) : (
                            <motion.div 
                                className="text-center py-12"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AcademicCapIcon className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-400 text-lg">No upcoming recommended bunks found</p>
                                <p className="text-gray-500 text-sm mt-2">Please check back later for makeup opportunities</p>
                            </motion.div>
                        )}
                    </div>

                    {/* Footer */}
                    <motion.div 
                        className="p-4 bg-gray-900/50 border-t border-gray-700/50 flex justify-between items-center"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="text-sm text-gray-400">
                            <span className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-accent-400 rounded-full animate-pulse" />
                                <span>Recommended options for better attendance</span>
                            </span>
                        </div>
                        
                        <motion.button 
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-all duration-200"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Cancel
                        </motion.button>
                    </motion.div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
