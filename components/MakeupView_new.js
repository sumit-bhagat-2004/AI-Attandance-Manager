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

export default function MakeupView({ userData, subjects, onMakeupSelect }) {
    const [showMakeupModal, setShowMakeupModal] = useState(false);
    const [selectedMakeupIndex, setSelectedMakeupIndex] = useState(0);
    
    // Handle multiple makeups
    const makeups = userData.makeups || [];
    const hasSelectedMakeup = userData.makeup && userData.makeup.makeupDate;
    
    const handleMakeupSelection = (makeupClass) => {
        if (onMakeupSelect) {
            const makeupData = {
                ...makeupClass,
                makeupIndex: selectedMakeupIndex
            };
            onMakeupSelect(makeupData);
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
        // Mock data for available makeup classes
        return [
            { name: 'Mathematics', code: 'MATH101', day: 'Monday', time: '10:00 AM', instructor: 'Dr. Smith' },
            { name: 'Physics', code: 'PHY201', day: 'Wednesday', time: '2:00 PM', instructor: 'Dr. Johnson' },
            { name: 'Chemistry', code: 'CHEM101', day: 'Friday', time: '11:00 AM', instructor: 'Dr. Brown' },
            { name: 'Biology', code: 'BIO101', day: 'Tuesday', time: '9:00 AM', instructor: 'Dr. Davis' },
            { name: 'Computer Science', code: 'CS101', day: 'Thursday', time: '3:00 PM', instructor: 'Prof. Wilson' }
        ];
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
                    {makeups.map((makeup, index) => (
                        <div key={index} className="card-gradient p-6 rounded-2xl border border-orange-500/50">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-orange-400 mb-2">
                                        Makeup Required: {subjects[makeup.subject]?.name}
                                    </h3>
                                    <p className="text-gray-300 mb-4">
                                        You missed {makeup.missedCount} class{makeup.missedCount > 1 ? 'es' : ''} and need to attend a makeup session.
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2 px-3 py-1 bg-orange-500/20 rounded-full">
                                    <ExclamationTriangleIcon className="w-4 h-4 text-orange-400" />
                                    <span className="text-sm font-medium text-orange-400">
                                        {makeup.status === 'completed' ? 'Completed' : 'Pending'}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center space-x-4 text-sm text-gray-300">
                                    <div className="flex items-center space-x-2">
                                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                                        <span>Missed: {new Date(makeup.missedDate).toLocaleDateString()}</span>
                                    </div>
                                    {makeup.deadline && (
                                        <div className="flex items-center space-x-2">
                                            <ClockIcon className="w-4 h-4 text-red-400" />
                                            <span className="text-red-400">Deadline: {new Date(makeup.deadline).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>

                                {makeup.status === 'completed' && makeup.makeupDate ? (
                                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <CheckCircleIcon className="w-5 h-5 text-green-400" />
                                            <span className="font-medium text-green-300">Makeup Class Completed</span>
                                        </div>
                                        <div className="text-sm text-gray-300 space-y-1">
                                            <div>Date: {new Date(makeup.makeupDate).toLocaleDateString()}</div>
                                            {makeup.makeupTime && <div>Time: {makeup.makeupTime}</div>}
                                        </div>
                                    </div>
                                ) : makeup.status === 'scheduled' && makeup.makeupDate ? (
                                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <CalendarIcon className="w-5 h-5 text-blue-400" />
                                            <span className="font-medium text-blue-300">Makeup Class Scheduled</span>
                                        </div>
                                        <div className="text-sm text-gray-300 space-y-1">
                                            <div>Date: {new Date(makeup.makeupDate).toLocaleDateString()}</div>
                                            {makeup.makeupTime && <div>Time: {makeup.makeupTime}</div>}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                                        <p className="text-red-300 mb-3">
                                            You need to select a makeup class for {subjects[makeup.subject]?.name}.
                                        </p>
                                        <motion.button
                                            onClick={() => {
                                                setSelectedMakeupIndex(index);
                                                setShowMakeupModal(true);
                                            }}
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
                        </div>
                    ))}
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
            <motion.div variants={itemVariants} className="card-gradient p-6 rounded-2xl">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                    <BookOpenIcon className="w-6 h-6 text-cyan-400" />
                    <span>Available Makeup Options</span>
                    <span className="text-sm bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full">
                        {availableMakeupClasses.length} options
                    </span>
                </h3>
                
                {availableMakeupClasses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {availableMakeupClasses.map((makeupClass, index) => (
                            <motion.div
                                key={`${makeupClass.code}-${makeupClass.day}`}
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
                                            <div className="flex items-center space-x-1">
                                                <CalendarIcon className="w-3 h-3" />
                                                <span>{makeupClass.day}</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <ClockIcon className="w-3 h-3" />
                                                <span>{makeupClass.time}</span>
                                            </div>
                                            <div className="text-cyan-400 font-medium">{makeupClass.code}</div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-600/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpenIcon className="w-8 h-8 text-gray-500" />
                        </div>
                        <p className="text-gray-400">No makeup classes available this week.</p>
                    </div>
                )}
            </motion.div>

            {/* Makeup Selection Modal */}
            <AnimatePresence>
                {showMakeupModal && (
                    <MakeupModal 
                        userData={userData} 
                        onSelect={handleMakeupSelection} 
                        onClose={() => setShowMakeupModal(false)} 
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}
