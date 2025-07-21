import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, CalendarIcon, AcademicCapIcon, HashtagIcon } from '@heroicons/react/24/outline';
import { formatDateToLocalString } from '../lib/utils';

export default function ECAModal({ isOpen, onClose, onSubmit, isLoading }) {
    const [formData, setFormData] = useState({
        date: formatDateToLocalString(new Date()),
        event: '',
        numberOfECAs: 1
    });

    const [errors, setErrors] = useState({});

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validation
        const newErrors = {};
        if (!formData.event.trim()) {
            newErrors.event = 'Event name is required';
        }
        if (formData.numberOfECAs < 1 || formData.numberOfECAs > 10) {
            newErrors.numberOfECAs = 'Number of ECAs must be between 1 and 10';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        onSubmit(formData);
        
        // Reset form
        setFormData({
            date: formatDateToLocalString(new Date()),
            event: '',
            numberOfECAs: 1
        });
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear specific error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    className="bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl w-full max-w-md"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-xl border border-blue-500/30">
                                <AcademicCapIcon className="h-6 w-6 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Add ECA Activity</h3>
                                <p className="text-sm text-gray-400">Extra Curricular Activity</p>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="p-2 hover:bg-gray-700/50 rounded-xl transition-colors duration-200"
                        >
                            <XMarkIcon className="h-5 w-5 text-gray-400" />
                        </motion.button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {/* Date Input */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                <CalendarIcon className="h-4 w-4 inline mr-2" />
                                Date
                            </label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => handleInputChange('date', e.target.value)}
                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                required
                            />
                        </div>

                        {/* Event Name Input */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                <AcademicCapIcon className="h-4 w-4 inline mr-2" />
                                Event Name
                            </label>
                            <input
                                type="text"
                                value={formData.event}
                                onChange={(e) => handleInputChange('event', e.target.value)}
                                placeholder="e.g., Sports Day, Cultural Fest, Workshop"
                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                required
                            />
                            {errors.event && (
                                <p className="text-red-400 text-xs mt-1">{errors.event}</p>
                            )}
                        </div>

                        {/* Number of ECAs */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                <HashtagIcon className="h-4 w-4 inline mr-2" />
                                Number of ECA Credits
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={formData.numberOfECAs}
                                onChange={(e) => handleInputChange('numberOfECAs', parseInt(e.target.value))}
                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                                required
                            />
                            {errors.numberOfECAs && (
                                <p className="text-red-400 text-xs mt-1">{errors.numberOfECAs}</p>
                            )}
                            <p className="text-gray-400 text-xs mt-1">
                                Each ECA credit counts as one attended class for attendance calculation
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3 pt-4">
                            <motion.button
                                type="button"
                                onClick={onClose}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex-1 py-3 px-4 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 font-semibold rounded-xl transition-all duration-200 border border-gray-600/50"
                            >
                                Cancel
                            </motion.button>
                            <motion.button
                                type="submit"
                                disabled={isLoading}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Adding...</span>
                                    </div>
                                ) : (
                                    '✨ Add ECA'
                                )}
                            </motion.button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}