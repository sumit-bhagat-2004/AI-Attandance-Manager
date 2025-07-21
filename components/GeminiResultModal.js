import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    XMarkIcon, 
    SparklesIcon,
    DocumentTextIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import { cn } from '../lib/utils';

export default function GeminiResultModal({ result, onClose }) {
    const renderMarkdown = (text) => {
        if (!text) return '';
        
        // Enhanced markdown renderer for comprehensive reports
        let html = text
            // Headers with enhanced styling
            .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-cyan-400 mt-8 mb-4 pb-2 border-b border-cyan-500/30">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-purple-400 mt-10 mb-5 pb-2 border-b border-purple-500/30">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-gradient bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mt-6 mb-6">$1</h1>')
            
            // Bold text with gradient
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-yellow-400">$1</strong>')
            
            // Italic text
            .replace(/\*(.*?)\*/g, '<em class="text-green-400 italic">$1</em>')
            
            // Enhanced bullet points with emojis and colors
            .replace(/^• (.*$)/gim, '<li class="ml-6 mb-3 text-gray-300 relative pl-2"><span class="absolute -left-6 text-cyan-400 text-lg">•</span>$1</li>')
            .replace(/^\* (.*$)/gim, '<li class="ml-6 mb-3 text-gray-300 relative pl-2"><span class="absolute -left-6 text-cyan-400 text-lg">•</span>$1</li>')
            .replace(/^- (.*$)/gim, '<li class="ml-6 mb-3 text-gray-300 relative pl-2"><span class="absolute -left-6 text-cyan-400 text-lg">•</span>$1</li>')
            
            // Numbered lists
            .replace(/^(\d+)\. (.*$)/gim, '<li class="ml-6 mb-3 text-gray-300 relative pl-4"><span class="absolute -left-6 text-purple-400 font-bold">$1.</span>$1</li>')
            
            // Code blocks and inline code
            .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4 overflow-x-auto"><code class="text-green-400 text-sm font-mono">$1</code></pre>')
            .replace(/`([^`]+)`/g, '<code class="bg-gray-800 text-green-400 px-2 py-1 rounded text-sm font-mono border border-gray-700">$1</code>')
            
            // Special formatting for sections
            .replace(/🎯|📈|🏆|🚨|⚠️|✅|📊|📚|🧪|🏋️|🎓|💪|🌟|⭐|🔴|🟡|🟢/g, '<span class="text-xl mr-2">$&</span>')
            
            // Line breaks - preserve double line breaks as paragraphs
            .replace(/\n\n/g, '</p><p class="mb-4 leading-relaxed">')
            .replace(/\n/g, '<br />');
        
        // Wrap in paragraph tags
        html = '<p class="mb-4 leading-relaxed">' + html + '</p>';
        
        // Clean up empty paragraphs
        html = html.replace(/<p[^>]*><\/p>/g, '');
        
        return html;
    };

    const modalVariants = {
        hidden: { 
            opacity: 0, 
            scale: 0.8, 
            y: 50 
        },
        visible: { 
            opacity: 1, 
            scale: 1, 
            y: 0,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 30
            }
        },
        exit: { 
            opacity: 0, 
            scale: 0.8, 
            y: 50,
            transition: {
                duration: 0.2
            }
        }
    };

    const contentVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { delay: 0.2, duration: 0.3 }
        }
    };

    return (
        <AnimatePresence>
            <motion.div 
                className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-[99999] p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div 
                    className="glass-card rounded-2xl shadow-2xl w-full max-w-4xl border border-gray-700/50 max-h-[90vh] flex flex-col overflow-hidden"
                    variants={modalVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Enhanced Header */}
                    <div className="relative p-6 bg-gradient-to-r from-primary-600/20 to-secondary-600/20 border-b border-gray-700/50">
                        <motion.button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition-colors group z-10"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <XMarkIcon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                        </motion.button>
                        
                        <div className="flex items-center space-x-4">
                            <motion.div
                                className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg"
                                animate={{ 
                                    rotate: result.isLoading ? 360 : 0 
                                }}
                                transition={{ 
                                    duration: result.isLoading ? 2 : 0, 
                                    repeat: result.isLoading ? Infinity : 0,
                                    ease: "linear"
                                }}
                            >
                                {result.isLoading ? (
                                    <ClockIcon className="w-6 h-6 text-white" />
                                ) : (
                                    <SparklesIcon className="w-6 h-6 text-white" />
                                )}
                            </motion.div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent truncate">
                                    {result.title}
                                </h3>
                                <motion.p 
                                    className="text-gray-400 text-sm mt-1"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    {result.isLoading ? (
                                        <span className="flex items-center space-x-2">
                                            <motion.span
                                                animate={{ opacity: [0.5, 1, 0.5] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                            >
                                                AI is generating content...
                                            </motion.span>
                                        </span>
                                    ) : (
                                        <span className="flex items-center space-x-1">
                                            <DocumentTextIcon className="w-4 h-4" />
                                            <span>Generated by AI • Click anywhere outside to close</span>
                                        </span>
                                    )}
                                </motion.p>
                            </div>
                        </div>

                        {/* Progress Bar for Loading */}
                        {result.isLoading && (
                            <motion.div 
                                className="mt-4 h-1 bg-gray-800 rounded-full overflow-hidden"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                <motion.div
                                    className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                                    animate={{ 
                                        x: ["-100%", "100%"] 
                                    }}
                                    transition={{ 
                                        duration: 1.5, 
                                        repeat: Infinity, 
                                        ease: "easeInOut" 
                                    }}
                                />
                            </motion.div>
                        )}
                    </div>

                    {/* Content Area */}
                    <motion.div 
                        className="flex-1 p-6 overflow-y-auto custom-scrollbar"
                        variants={contentVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <AnimatePresence mode="wait">
                            {result.isLoading ? (
                                <motion.div 
                                    key="loading"
                                    className="flex flex-col justify-center items-center h-64 space-y-6"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                >
                                    {/* Animated Loading Spinner */}
                                    <div className="relative">
                                        <motion.div
                                            className="w-16 h-16 border-4 border-gray-700 rounded-full"
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        />
                                        <motion.div
                                            className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-primary-500 border-r-secondary-500 rounded-full"
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                        />
                                        <motion.div
                                            className="absolute top-2 left-2 w-12 h-12 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-full flex items-center justify-center"
                                            animate={{ 
                                                scale: [1, 1.1, 1],
                                                opacity: [0.5, 1, 0.5]
                                            }}
                                            transition={{ 
                                                duration: 2, 
                                                repeat: Infinity, 
                                                ease: "easeInOut" 
                                            }}
                                        >
                                            <SparklesIcon className="w-6 h-6 text-primary-400" />
                                        </motion.div>
                                    </div>
                                    
                                    {/* Loading Text */}
                                    <div className="text-center space-y-2">
                                        <h4 className="text-lg font-semibold text-gray-300">
                                            AI is working its magic...
                                        </h4>
                                        <motion.div 
                                            className="text-sm text-gray-400"
                                            animate={{ opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        >
                                            Analyzing and generating personalized content
                                        </motion.div>
                                    </div>

                                    {/* Floating Elements */}
                                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                        {[...Array(6)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                className="absolute w-2 h-2 bg-primary-400/30 rounded-full"
                                                style={{
                                                    left: `${20 + i * 15}%`,
                                                    top: `${30 + (i % 2) * 40}%`,
                                                }}
                                                animate={{
                                                    y: [0, -20, 0],
                                                    opacity: [0.3, 1, 0.3],
                                                }}
                                                transition={{
                                                    duration: 2 + i * 0.5,
                                                    repeat: Infinity,
                                                    delay: i * 0.3,
                                                }}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="content"
                                    className="max-w-none"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <div 
                                        className="text-gray-300 leading-relaxed space-y-2 text-base max-w-none"
                                        style={{
                                            lineHeight: '1.8',
                                            fontSize: '16px',
                                            maxWidth: '100%',
                                            wordWrap: 'break-word',
                                            overflowWrap: 'break-word'
                                        }}
                                        dangerouslySetInnerHTML={{ 
                                            __html: renderMarkdown(result.content) 
                                        }}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Enhanced Footer */}
                    {!result.isLoading && (
                        <motion.div 
                            className="p-6 bg-gray-900/50 border-t border-gray-700/50 flex justify-between items-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <div className="flex items-center space-x-2 text-sm text-gray-400">
                                <SparklesIcon className="w-4 h-4 text-primary-400" />
                                <span>Powered by AI • Content generated in real-time</span>
                            </div>
                            
                            <motion.button 
                                onClick={onClose}
                                className="px-6 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-500 hover:to-secondary-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Close
                            </motion.button>
                        </motion.div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
