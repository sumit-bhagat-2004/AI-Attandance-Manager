import React from 'react';
import { motion } from 'framer-motion';
import { 
    ExclamationTriangleIcon, 
    AcademicCapIcon,
    ChevronRightIcon 
} from '@heroicons/react/24/outline';
import { subjects } from '../lib/scheduleData';
import { cn } from '../lib/utils';

export default function MakeupAlert({ makeup, onSelect }) {
    const subjectName = subjects[makeup.subjectToMakeup]?.name || 'Unknown Subject';
    
    // Don't show alert if makeup is already scheduled
    if (makeup.makeupTarget && makeup.makeupDate) {
        return null;
    }
    
    return (
        <motion.div 
            className="relative overflow-hidden glass-card border-l-4 border-red-500 bg-gradient-to-r from-red-900/30 to-orange-900/20 p-6 rounded-r-2xl shadow-2xl"
            initial={{ opacity: 0, x: -50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                duration: 0.6 
            }}
            whileHover={{ scale: 1.02 }}
        >
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20"
                    animate={{ 
                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] 
                    }}
                    transition={{ 
                        duration: 3, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                    }}
                />
            </div>

            {/* Pulsing Warning Icon */}
            <motion.div
                className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full"
                animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.7, 1, 0.7]
                }}
                transition={{ 
                    duration: 1.5, 
                    repeat: Infinity 
                }}
            />

            <div className="relative flex justify-between items-start">
                <div className="flex items-start space-x-4 flex-1">
                    {/* Alert Icon with Animation */}
                    <motion.div
                        className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg"
                        animate={{ 
                            rotate: [0, -10, 10, 0] 
                        }}
                        transition={{ 
                            duration: 2, 
                            repeat: Infinity, 
                            ease: "easeInOut" 
                        }}
                    >
                        <ExclamationTriangleIcon className="w-6 h-6 text-white" />
                    </motion.div>

                    {/* Alert Content */}
                    <div className="flex-1 min-w-0">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h3 className="text-xl font-bold text-red-200 mb-2 flex items-center space-x-2">
                                <span>🚨 Attendance Deficit Alert!</span>
                            </h3>
                            
                            <div className="space-y-2">
                                <p className="text-red-100">
                                    You skipped the mandatory class:{' '}
                                    <span className="font-bold bg-red-500/20 px-2 py-1 rounded-lg border border-red-400/30">
                                        {subjectName}
                                    </span>
                                </p>
                                <p className="text-red-200/80 text-sm flex items-center space-x-1">
                                    <AcademicCapIcon className="w-4 h-4 flex-shrink-0" />
                                    <span>You must attend a recommended bunk class to maintain your 80% attendance rate.</span>
                                </p>
                            </div>

                            {/* Progress Bar */}
                            <motion.div 
                                className="mt-4 h-2 bg-red-800/50 rounded-full overflow-hidden"
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                            >
                                <motion.div
                                    className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: "75%" }}
                                    transition={{ delay: 0.8, duration: 1 }}
                                />
                            </motion.div>
                            <p className="text-xs text-red-300/70 mt-1">
                                Attendance critical - Immediate action required
                            </p>
                        </motion.div>
                    </div>
                </div>

                {/* Action Button */}
                {!makeup.makeupTarget && (
                    <motion.div
                        className="flex-shrink-0 ml-4"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <motion.button 
                            onClick={onSelect}
                            className={cn(
                                "group relative px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600",
                                "hover:from-red-500 hover:to-orange-500 text-white font-bold rounded-xl",
                                "transition-all duration-300 shadow-lg hover:shadow-xl",
                                "border border-red-400/30 hover:border-red-300/50",
                                "flex items-center space-x-2 whitespace-nowrap"
                            )}
                            whileHover={{ 
                                scale: 1.05,
                                boxShadow: "0 10px 25px rgba(239, 68, 68, 0.3)"
                            }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span>Choose Makeup</span>
                            <motion.div
                                animate={{ x: [0, 5, 0] }}
                                transition={{ 
                                    duration: 1.5, 
                                    repeat: Infinity, 
                                    ease: "easeInOut" 
                                }}
                            >
                                <ChevronRightIcon className="w-4 h-4" />
                            </motion.div>
                            
                            {/* Button glow effect */}
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-400/0 to-orange-400/0 group-hover:from-red-400/20 group-hover:to-orange-400/20 transition-all duration-300" />
                        </motion.button>
                    </motion.div>
                )}

                {/* Already Selected Makeup Indicator */}
                {makeup.makeupTarget && (
                    <motion.div
                        className="flex-shrink-0 ml-4 px-4 py-2 bg-green-600/20 border border-green-500/30 rounded-xl"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="flex items-center space-x-2 text-green-300 text-sm">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <span>Makeup Selected</span>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
