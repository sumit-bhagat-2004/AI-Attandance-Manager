import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, CalendarDaysIcon, SunIcon } from '@heroicons/react/24/outline';

export default function DayManagerModal({ 
    isOpen, 
    onClose, 
    selectedDate, 
    onMarkHoliday, 
    onChangeRoutine,
    currentDayOverride,
    isHoliday 
}) {
    const daysOfWeek = [
        { key: 'monday', label: 'Monday', hasClasses: true },
        { key: 'tuesday', label: 'Tuesday', hasClasses: true },
        { key: 'wednesday', label: 'Wednesday', hasClasses: true },
        { key: 'thursday', label: 'Thursday', hasClasses: true },
        { key: 'friday', label: 'Friday', hasClasses: true },
        { key: 'saturday', label: 'Saturday', hasClasses: true },
        { key: 'sunday', label: 'Sunday', hasClasses: false }
    ];

    const handleMarkHoliday = () => {
        onMarkHoliday(!isHoliday);
        onClose();
    };

    const handleChangeRoutine = (dayKey) => {
        const newRoutine = currentDayOverride === dayKey ? null : dayKey;
        onChangeRoutine(newRoutine);
        onClose();
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
                                <CalendarDaysIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Day Manager</h3>
                                <p className="text-sm text-gray-400">Manage day settings</p>
                            </div>
                        </div>
                        <motion.button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <XMarkIcon className="w-5 h-5 text-gray-400" />
                        </motion.button>
                    </div>

                    {/* Selected Date */}
                    <div className="mb-6 p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
                        <p className="text-center text-white font-medium">
                            {formatDate(selectedDate)}
                        </p>
                        {currentDayOverride && (
                            <p className="text-center text-sm text-purple-400 mt-1">
                                Currently showing {daysOfWeek.find(d => d.key === currentDayOverride)?.label} routine
                            </p>
                        )}
                        {isHoliday && (
                            <p className="text-center text-sm text-yellow-400 mt-1 flex items-center justify-center space-x-1">
                                <SunIcon className="w-4 h-4" />
                                <span>Marked as Holiday</span>
                            </p>
                        )}
                    </div>

                    {/* Holiday Toggle */}
                    <div className="mb-6">
                        <motion.button
                            onClick={handleMarkHoliday}
                            className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-center space-x-3 ${
                                isHoliday 
                                    ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' 
                                    : 'bg-gray-800/50 border-gray-600 text-white hover:border-yellow-500/50 hover:bg-yellow-500/10'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <SunIcon className="w-5 h-5" />
                            <span className="font-medium">
                                {isHoliday ? 'Remove Holiday' : 'Mark as Holiday'}
                            </span>
                        </motion.button>
                    </div>

                    {/* Routine Change */}
                    <div>
                        <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
                            <CalendarDaysIcon className="w-4 h-4" />
                            <span>Change Day Routine</span>
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                            {daysOfWeek.map((day) => {
                                const isSelected = currentDayOverride === day.key;
                                const isOriginalDay = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() === day.label.toLowerCase();
                                
                                return (
                                    <motion.button
                                        key={day.key}
                                        onClick={() => handleChangeRoutine(day.key)}
                                        disabled={isOriginalDay}
                                        className={`p-3 rounded-lg border transition-all duration-200 text-sm font-medium ${
                                            isOriginalDay
                                                ? 'bg-gray-800 border-gray-600 text-gray-500 cursor-not-allowed'
                                                : isSelected
                                                    ? 'bg-purple-600/30 border-purple-500 text-purple-300'
                                                    : day.hasClasses
                                                        ? 'bg-gray-800/50 border-gray-600 text-white hover:border-purple-500/50 hover:bg-purple-600/10'
                                                        : 'bg-gray-800/30 border-gray-700 text-gray-400 hover:border-gray-500'
                                        }`}
                                        whileHover={!isOriginalDay ? { scale: 1.02 } : {}}
                                        whileTap={!isOriginalDay ? { scale: 0.98 } : {}}
                                    >
                                        <div>
                                            {day.label}
                                            {!day.hasClasses && (
                                                <div className="text-xs text-gray-500 mt-1">No Classes</div>
                                            )}
                                            {isOriginalDay && (
                                                <div className="text-xs text-gray-500 mt-1">Current Day</div>
                                            )}
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                        
                        {currentDayOverride && (
                            <motion.button
                                onClick={() => handleChangeRoutine(null)}
                                className="w-full mt-3 p-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300 text-sm hover:bg-gray-700 transition-colors"
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                            >
                                Reset to Original Day
                            </motion.button>
                        )}
                    </div>

                    {/* Info */}
                    <div className="mt-6 p-3 bg-blue-600/10 border border-blue-600/30 rounded-lg">
                        <p className="text-xs text-blue-300 text-center">
                            💡 Holiday: Hides all classes. Routine change: Shows selected day's schedule.
                        </p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}