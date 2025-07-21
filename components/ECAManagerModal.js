import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    XMarkIcon, 
    CalendarIcon, 
    AcademicCapIcon, 
    HashtagIcon,
    PlusIcon,
    MinusIcon,
    TrashIcon,
    PencilSquareIcon
} from '@heroicons/react/24/outline';
import { formatDateToLocalString } from '../lib/utils';

export default function ECAManagerModal({ isOpen, onClose, onSubmit, onUpdate, onDelete, isLoading, userData }) {
    const [activeTab, setActiveTab] = useState('add');
    const [formData, setFormData] = useState({
        date: formatDateToLocalString(new Date()),
        event: '',
        numberOfECAs: 1
    });
    const [errors, setErrors] = useState({});
    const [editingECA, setEditingECA] = useState(null);

    // Get existing ECAs
    const existingECAs = userData?.ecaRecords ? 
        Object.entries(userData.ecaRecords).map(([date, eca]) => ({
            date,
            event: eca.event,
            count: eca.count || 1,
            timestamp: eca.timestamp
        })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) : [];

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
        
        if (editingECA) {
            onUpdate(editingECA.date, formData);
            setEditingECA(null);
        } else {
            onSubmit(formData);
        }
        
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

    const handleEdit = (eca) => {
        setFormData({
            date: eca.date,
            event: eca.event,
            numberOfECAs: eca.count
        });
        setEditingECA(eca);
        setActiveTab('add');
    };

    const handleAdjustCount = (date, currentCount, adjustment) => {
        const newCount = Math.max(1, Math.min(10, currentCount + adjustment));
        if (newCount !== currentCount) {
            const eca = existingECAs.find(e => e.date === date);
            onUpdate(date, { 
                event: eca.event, 
                numberOfECAs: newCount,
                date: eca.date 
            });
        }
    };

    const handleDelete = (date) => {
        if (confirm('Are you sure you want to delete this ECA record?')) {
            onDelete(date);
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
                    className="bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-xl border border-blue-500/30">
                                <AcademicCapIcon className="h-6 w-6 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">ECA Manager</h3>
                                <p className="text-sm text-gray-400">Manage Extra Curricular Activities</p>
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

                    {/* Tabs */}
                    <div className="flex border-b border-gray-700/50">
                        <button
                            onClick={() => setActiveTab('add')}
                            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                                activeTab === 'add' 
                                    ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10' 
                                    : 'text-gray-400 hover:text-gray-300'
                            }`}
                        >
                            {editingECA ? 'Edit ECA' : 'Add New ECA'}
                        </button>
                        <button
                            onClick={() => setActiveTab('manage')}
                            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                                activeTab === 'manage' 
                                    ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10' 
                                    : 'text-gray-400 hover:text-gray-300'
                            }`}
                        >
                            Manage ECAs ({existingECAs.length})
                        </button>
                    </div>

                    <div className="overflow-y-auto max-h-[60vh]">
                        {activeTab === 'add' && (
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
                                        onClick={() => {
                                            setEditingECA(null);
                                            setFormData({
                                                date: formatDateToLocalString(new Date()),
                                                event: '',
                                                numberOfECAs: 1
                                            });
                                        }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex-1 py-3 px-4 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 font-semibold rounded-xl transition-all duration-200 border border-gray-600/50"
                                    >
                                        {editingECA ? 'Cancel Edit' : 'Reset'}
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
                                                <span>{editingECA ? 'Updating...' : 'Adding...'}</span>
                                            </div>
                                        ) : (
                                            editingECA ? '📝 Update ECA' : '✨ Add ECA'
                                        )}
                                    </motion.button>
                                </div>
                            </form>
                        )}

                        {activeTab === 'manage' && (
                            <div className="p-6">
                                {existingECAs.length === 0 ? (
                                    <div className="text-center py-8 text-gray-400">
                                        <AcademicCapIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                        <p>No ECA records found</p>
                                        <p className="text-sm">Add some ECAs to get started!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {existingECAs.map((eca) => (
                                            <motion.div
                                                key={eca.date}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="font-medium text-white">{eca.event}</div>
                                                        <div className="text-sm text-gray-400">
                                                            {new Date(eca.date).toLocaleDateString()} • {eca.count} credit{eca.count > 1 ? 's' : ''}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        {/* Adjust Count */}
                                                        <div className="flex items-center space-x-1 bg-gray-700/50 rounded-lg p-1">
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={() => handleAdjustCount(eca.date, eca.count, -1)}
                                                                className="p-1 hover:bg-gray-600/50 rounded text-gray-400 hover:text-white transition-colors"
                                                                disabled={eca.count <= 1}
                                                            >
                                                                <MinusIcon className="h-3 w-3" />
                                                            </motion.button>
                                                            <span className="px-2 text-sm font-medium text-white min-w-[2rem] text-center">
                                                                {eca.count}
                                                            </span>
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={() => handleAdjustCount(eca.date, eca.count, 1)}
                                                                className="p-1 hover:bg-gray-600/50 rounded text-gray-400 hover:text-white transition-colors"
                                                                disabled={eca.count >= 10}
                                                            >
                                                                <PlusIcon className="h-3 w-3" />
                                                            </motion.button>
                                                        </div>
                                                        
                                                        {/* Edit Button */}
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => handleEdit(eca)}
                                                            className="p-2 hover:bg-blue-600/20 rounded-lg text-blue-400 hover:text-blue-300 transition-colors"
                                                        >
                                                            <PencilSquareIcon className="h-4 w-4" />
                                                        </motion.button>
                                                        
                                                        {/* Delete Button */}
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => handleDelete(eca.date)}
                                                            className="p-2 hover:bg-red-600/20 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
