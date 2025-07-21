import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    XMarkIcon, 
    SparklesIcon, 
    AcademicCapIcon,
    LightBulbIcon
} from '@heroicons/react/24/outline';
import { subjects } from '../lib/scheduleData';

export default function AITopicsModal({ 
    isOpen, 
    onClose, 
    classCode, 
    subjectName, 
    onGenerateTopics, 
    onStoreHint,
    isLoading 
}) {
    const [topicHint, setTopicHint] = useState('');
    const [includeHint, setIncludeHint] = useState(false);
    const [isStoringHint, setIsStoringHint] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const handleGenerate = () => {
        const hint = includeHint && topicHint.trim() ? topicHint.trim() : null;
        onGenerateTopics(classCode, hint);
    };

    const handleStoreHint = async () => {
        if (!topicHint.trim()) return;
        
        setIsStoringHint(true);
        try {
            if (onStoreHint) {
                await onStoreHint(classCode, topicHint.trim());
                handleClose();
            }
        } catch (error) {
            console.error('Error storing hint:', error);
        } finally {
            setIsStoringHint(false);
        }
    };

    const handleClose = () => {
        setTopicHint('');
        setIncludeHint(false);
        onClose();
    };

    if (!mounted) return null;

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    className="fixed inset-0 bg-black/95 backdrop-blur-lg flex justify-center items-center"
                    style={{ 
                        zIndex: 999999,
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        margin: 0,
                        padding: 0
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleClose}
                >
                    <motion.div 
                        className="bg-gray-900/98 backdrop-blur-xl shadow-2xl w-full h-full max-w-full max-h-full md:max-w-4xl md:max-h-[90vh] md:rounded-3xl border-0 md:border-2 border-gray-700/50 overflow-hidden flex flex-col m-0 md:m-4"
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="relative p-6 md:p-8 bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border-b border-gray-700/50 flex-shrink-0">
                            <motion.button
                                onClick={handleClose}
                                className="absolute top-4 right-4 md:top-6 md:right-6 p-3 rounded-xl bg-gray-700/50 hover:bg-gray-600/50 transition-colors group z-10"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <XMarkIcon className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
                            </motion.button>
                            
                            <div className="flex items-center space-x-4 pr-16">
                                <motion.div
                                    className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
                                    initial={{ rotate: 0 }}
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 0.8, ease: "easeInOut" }}
                                >
                                    <SparklesIcon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                                </motion.div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                                        AI Topic Generator
                                    </h3>
                                    <p className="text-gray-400 text-lg md:text-xl">{subjectName}</p>
                                    <p className="text-gray-500 text-sm md:text-base">{classCode}</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 md:p-8 space-y-6 md:space-y-8 flex-1 overflow-y-auto">
                            {/* Topic Hint Option */}
                            <div className="space-y-4 md:space-y-6">
                                <div className="flex items-center space-x-4">
                                    <motion.button
                                        onClick={() => setIncludeHint(!includeHint)}
                                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                                            includeHint 
                                                ? 'bg-purple-600 border-purple-600' 
                                                : 'border-gray-500 hover:border-purple-400'
                                        }`}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {includeHint && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="w-3 h-3 bg-white rounded-sm"
                                            />
                                        )}
                                    </motion.button>
                                    <div className="flex items-center space-x-2">
                                        <LightBulbIcon className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
                                        <span className="text-white font-medium text-base md:text-lg">Add topic hint</span>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {includeHint && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                        >
                                            <textarea
                                                value={topicHint}
                                                onChange={(e) => setTopicHint(e.target.value)}
                                                placeholder={`e.g., "We covered pipelining and cache memory today" or "Focus on RISC vs CISC architectures"`}
                                                className="w-full h-32 md:h-36 p-4 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-base md:text-lg"
                                                maxLength={500}
                                            />
                                            <p className="text-gray-500 text-sm mt-2 text-right">
                                                {topicHint.length}/500 characters
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Info Section */}
                            <div className="bg-gradient-to-r from-indigo-600/10 to-purple-600/10 border border-indigo-500/20 rounded-xl p-4 md:p-6">
                                <div className="flex items-start space-x-3">
                                    <AcademicCapIcon className="w-6 h-6 md:w-7 md:h-7 text-indigo-400 mt-1 flex-shrink-0" />
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-white text-base md:text-lg">
                                            🎯 What will be generated:
                                        </h4>
                                        <ul className="text-gray-300 space-y-1 text-sm md:text-base">
                                            <li>• Key topics and concepts covered</li>
                                            <li>• Important points to remember</li>
                                            <li>• Study recommendations</li>
                                            <li>• Practice questions (if applicable)</li>
                                        </ul>
                                        {includeHint && topicHint.trim() && (
                                            <p className="text-purple-300 text-sm md:text-base mt-3 italic">
                                                💡 Your hint will help generate more targeted content!
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 md:p-8 bg-gray-800/50 border-t border-gray-700/50 flex-shrink-0">
                            <div className="flex items-center space-x-3 md:space-x-4 flex-1 justify-end">
                                {/* Store Hint Button - only show when there's a hint */}
                                {includeHint && topicHint.trim() && onStoreHint && (
                                    <motion.button 
                                        onClick={handleStoreHint}
                                        disabled={isLoading || isStoringHint}
                                        className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/25 text-base"
                                        whileHover={{ scale: isStoringHint ? 1 : 1.02 }}
                                        whileTap={{ scale: isStoringHint ? 1 : 0.98 }}
                                    >
                                        {isStoringHint ? (
                                            <>
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                                />
                                                <span>Storing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-lg">💾</span>
                                                <span>Save Hint</span>
                                            </>
                                        )}
                                    </motion.button>
                                )}
                                
                                <motion.button 
                                    onClick={handleGenerate}
                                    disabled={isLoading || isStoringHint}
                                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25 text-base"
                                    whileHover={{ scale: isLoading || isStoringHint ? 1 : 1.02 }}
                                    whileTap={{ scale: isLoading || isStoringHint ? 1 : 0.98 }}
                                >
                                    {isLoading ? (
                                        <>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                            />
                                            <span>Generating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <SparklesIcon className="w-5 h-5" />
                                            <span>Generate Topics</span>
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    // Use React Portal to render at document body level, ensuring it's above everything
    return typeof document !== 'undefined' 
        ? createPortal(modalContent, document.body)
        : null;
}
