import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    BookOpenIcon, 
    SparklesIcon, 
    UserGroupIcon, 
    CalendarIcon,
    ClockIcon,
    LightBulbIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { subjects } from '../lib/scheduleData';
import { cn } from '../lib/utils';

export default function StudyMaterialsModal({ isOpen, onClose, classCode, className }) {
    const [studyMaterials, setStudyMaterials] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('all');

    const subjectName = subjects[classCode]?.name || classCode;

    useEffect(() => {
        if (isOpen && classCode) {
            fetchStudyMaterials();
        }
    }, [isOpen, classCode]);

    const fetchStudyMaterials = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/study-materials?classCode=${classCode}`);
            if (response.ok) {
                const data = await response.json();
                setStudyMaterials(data.materials || []);
            }
        } catch (error) {
            console.error('Error fetching study materials:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredMaterials = studyMaterials.filter(material => {
        if (selectedFilter === 'all') return true;
        if (selectedFilter === 'hints') return material.topicHint && !material.aiContent;
        if (selectedFilter === 'ai') return material.aiContent;
        return true;
    });

    const groupedByDate = filteredMaterials.reduce((acc, material) => {
        const date = material.date;
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(material);
        return acc;
    }, {});

    const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(b) - new Date(a));

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.9 }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100000] flex items-center justify-center p-2 sm:p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="bg-gray-900/95 backdrop-blur-xl rounded-lg sm:rounded-2xl border border-gray-700/50 shadow-2xl w-full h-full sm:max-w-4xl sm:w-full sm:max-h-[90vh] sm:h-auto overflow-hidden flex flex-col"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 p-4 sm:p-6 border-b border-gray-700/50 flex-shrink-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 sm:space-x-4">
                                    <motion.div
                                        className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg"
                                        animate={{ rotate: [0, 360] }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    >
                                        <BookOpenIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                    </motion.div>
                                    <div>
                                        <h3 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                                            Study Materials
                                        </h3>
                                        <p className="text-gray-400 text-sm sm:text-base">{subjectName}</p>
                                        <p className="text-xs sm:text-sm text-gray-500">{studyMaterials.length} entries from students</p>
                                    </div>
                                </div>
                                <motion.button
                                    onClick={onClose}
                                    className="p-2 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                                </motion.button>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto">
                                {/* Filter Tabs */}
                                <div className="p-4 sm:p-6 border-b border-gray-700/30">
                                    <div className="flex flex-wrap sm:flex-nowrap gap-1 sm:gap-2 bg-gray-800/50 p-1 rounded-lg">
                                {[
                                    { id: 'all', label: 'All Materials', shortLabel: 'All', icon: BookOpenIcon },
                                    { id: 'hints', label: 'Student Notes', shortLabel: 'Notes', icon: LightBulbIcon },
                                    { id: 'ai', label: 'AI Generated', shortLabel: 'AI', icon: SparklesIcon }
                                ].map((filter) => {
                                    const Icon = filter.icon;
                                    return (
                                        <motion.button
                                            key={filter.id}
                                            onClick={() => setSelectedFilter(filter.id)}
                                            className={cn(
                                                "flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-md font-medium transition-all duration-200 flex-1 sm:flex-initial text-xs sm:text-sm",
                                                selectedFilter === filter.id
                                                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                                                    : "text-gray-400 hover:text-gray-300 hover:bg-gray-700/50"
                                            )}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                                            <span className="hidden sm:inline">{filter.label}</span>
                                            <span className="sm:hidden">{filter.shortLabel}</span>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full"
                                    />
                                    <span className="ml-3 text-gray-400">Loading study materials...</span>
                                </div>
                            ) : sortedDates.length === 0 ? (
                                <div className="text-center py-12">
                                    <BookOpenIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-400 text-lg">No study materials available yet</p>
                                    <p className="text-gray-500 text-sm mt-2">Be the first to add topic hints for this class!</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {sortedDates.map((date) => (
                                        <motion.div
                                            key={date}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="border border-gray-700/50 rounded-xl overflow-hidden"
                                        >
                                            <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 p-4 border-b border-gray-700/50">
                                                <div className="flex items-center space-x-2">
                                                    <CalendarIcon className="w-5 h-5 text-cyan-400" />
                                                    <span className="font-semibold text-cyan-400">
                                                        {new Date(date).toLocaleDateString('default', { 
                                                            weekday: 'long', 
                                                            year: 'numeric', 
                                                            month: 'long', 
                                                            day: 'numeric' 
                                                        })}
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        ({groupedByDate[date].length} contribution{groupedByDate[date].length !== 1 ? 's' : ''})
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="p-4 space-y-4">
                                                {groupedByDate[date].map((material, idx) => (
                                                    <motion.div
                                                        key={idx}
                                                        className="space-y-3"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: idx * 0.1 }}
                                                    >
                                                        {material.topicHint && (
                                                            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4">
                                                                <div className="flex items-center space-x-2 mb-2">
                                                                    <LightBulbIcon className="w-4 h-4 text-cyan-400" />
                                                                    <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wide">
                                                                        Student Note
                                                                    </span>
                                                                    <span className="text-xs text-gray-500">
                                                                        by Student {material.user.split('.')[0]}
                                                                    </span>
                                                                </div>
                                                                <p className="text-cyan-100">{material.topicHint}</p>
                                                            </div>
                                                        )}
                                                        
                                                        {material.aiContent && (
                                                            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                                                                <div className="flex items-center space-x-2 mb-3">
                                                                    <SparklesIcon className="w-4 h-4 text-purple-400" />
                                                                    <span className="text-xs font-semibold text-purple-300 uppercase tracking-wide">
                                                                        AI Generated Study Material
                                                                    </span>
                                                                </div>
                                                                <div 
                                                                    className="text-purple-100 prose prose-sm prose-invert max-w-none"
                                                                    dangerouslySetInnerHTML={{ 
                                                                        __html: material.aiContent
                                                                            .replace(/\n/g, '<br>')
                                                                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                                            .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                                                            .replace(/^- (.+)/gm, '• $1')
                                                                    }}
                                                                />
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
