import React from 'react';
import { motion } from 'framer-motion';
import { 
    ExclamationTriangleIcon,
    AcademicCapIcon,
    CalendarIcon,
    ClockIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import { subjects } from '../lib/scheduleData';
import { cn } from '../lib/utils';

export default function MakeupSection({ userData, onSelectMakeup, onOpenMakeupModal }) {
    // Handle both legacy single makeup and new multiple makeups
    const makeups = userData.makeups || [];
    const hasAnyMakeups = makeups.length > 0 || userData.makeup?.needed;
    
    if (!hasAnyMakeups) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-gradient p-6 rounded-2xl border border-green-500/20"
            >
                <div className="flex items-center justify-center space-x-3">
                    <CheckCircleIcon className="w-8 h-8 text-green-400" />
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-green-400">All Caught Up!</h3>
                        <p className="text-sm text-gray-400">No makeup classes needed</p>
                    </div>
                </div>
            </motion.div>
        );
    }

    // Prioritize the makeups array if it exists, otherwise use legacy single makeup
    let makeupsToShow = [];
    if (makeups.length > 0) {
        makeupsToShow = makeups;
    } else if (userData.makeup?.needed) {
        makeupsToShow = [userData.makeup];
    }
    
    // Safety check - if no makeups to show, return early
    if (makeupsToShow.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-gradient p-6 rounded-2xl border border-green-500/20"
            >
                <div className="flex items-center justify-center space-x-3">
                    <CheckCircleIcon className="w-8 h-8 text-green-400" />
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-green-400">All Caught Up!</h3>
                        <p className="text-sm text-gray-400">No makeup classes needed</p>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
        >
            {makeupsToShow.map((makeup, index) => {
                const missedSubject = subjects[makeup.subjectToMakeup];
                const hasSelectedMakeup = makeup.makeupTarget;
                
                return (
                    <motion.div
                        key={`${makeup.subjectToMakeup}-${index}`}
                        className={cn(
                            "card-gradient p-6 rounded-2xl border-2",
                            hasSelectedMakeup 
                                ? "border-green-500/30 bg-green-500/5" 
                                : "border-orange-500/30 bg-orange-500/5"
                        )}
                        whileHover={{ scale: 1.01 }}
                    >
                        <div className="flex items-start space-x-4">
                            <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center",
                                hasSelectedMakeup 
                                    ? "bg-green-500/20 text-green-400" 
                                    : "bg-orange-500/20 text-orange-400"
                            )}>
                                {hasSelectedMakeup ? (
                                    <CheckCircleIcon className="w-6 h-6" />
                                ) : (
                                    <ExclamationTriangleIcon className="w-6 h-6" />
                                )}
                            </div>
                            
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className={cn(
                                        "text-lg font-bold",
                                        hasSelectedMakeup ? "text-green-400" : "text-orange-400"
                                    )}>
                                        {hasSelectedMakeup ? "Makeup Class Scheduled" : "Makeup Required"}
                                        {makeupsToShow.length > 1 && (
                                            <span className="ml-2 text-xs bg-gray-500/20 text-gray-300 px-2 py-1 rounded-full">
                                                {index + 1} of {makeupsToShow.length}
                                            </span>
                                        )}
                                    </h3>
                                    
                                    {!hasSelectedMakeup && (
                                        <motion.button
                                            onClick={() => onOpenMakeupModal(makeup.subjectToMakeup, index)}
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
                                            Missed: <span className="font-medium text-white">{missedSubject?.name || 'Unknown Subject'}</span>
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
                                    
                                    {hasSelectedMakeup ? (
                                        <div className="flex items-center space-x-2">
                                            <CalendarIcon className="w-4 h-4 text-green-400" />
                                            <span className="text-sm text-green-300">
                                                Scheduled: {new Date(makeup.makeupDate).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })} at {makeup.makeupTime}
                                            </span>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400">
                                            You skipped a mandatory {missedSubject?.name} class. Please select a makeup class from the recommended bunks.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {hasSelectedMakeup && (
                            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                                <p className="text-xs text-green-300 text-center font-medium">
                                    ✅ Your makeup class is now marked as mandatory. Make sure to attend!
                                </p>
                            </div>
                        )}
                    </motion.div>
                );
            })}
        </motion.div>
    );
}
