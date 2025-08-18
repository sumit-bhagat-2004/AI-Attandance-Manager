import React, { useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
    XMarkIcon, 
    AcademicCapIcon, 
    CalendarIcon, 
    ClockIcon,
    ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import { fullSchedule, bunkSchedule, mandatorySchedule, subjects, getEffectiveCycleStartDate } from '../lib/scheduleData';
import { cn, formatDateToLocalString } from '../lib/utils';

export default function MakeupModal({ userData, onSelect, onClose, selectedSubject, currentUser, makeupIndex = 0 }) {
    const [availablePastClasses, setAvailablePastClasses] = useState([]);
    const [loadingPastClasses, setLoadingPastClasses] = useState(false);
    const [activeTab, setActiveTab] = useState('future'); // 'future' or 'past'
    
    // Determine the missed subject from the specific makeup or fallback to legacy/selectedSubject
    const missedSubject = (() => {
        if (selectedSubject) return selectedSubject;
        if (userData?.makeups && userData.makeups[makeupIndex]) {
            return userData.makeups[makeupIndex].subjectToMakeup;
        }
        return userData.makeup?.subjectToMakeup;
    })();
    
    // Fetch available past classes when modal opens
    useEffect(() => {
        if (currentUser) {
            console.log('Fetching past classes for user:', currentUser); // Debug log
            fetchAvailablePastClasses();
        }
    }, [currentUser]);
    
    // Debug log to see state changes
    useEffect(() => {
        console.log('Available past classes state updated:', availablePastClasses.length, availablePastClasses);
    }, [availablePastClasses]);
    
    const fetchAvailablePastClasses = async () => {
        setLoadingPastClasses(true);
        try {
            const response = await fetch('/api/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'getAvailablePastClasses',
                    payload: { user: currentUser }
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('Past classes API response:', data); // Debug log
                setAvailablePastClasses(data.availablePastClasses || []);
            } else {
                console.error('Failed to fetch past classes:', response.status);
            }
        } catch (error) {
            console.error('Error fetching past classes:', error);
        } finally {
            setLoadingPastClasses(false);
        }
    };
    
    const handleUsePastClass = async (pastClass, targetMakeupIndex = makeupIndex) => {
        try {
            const response = await fetch('/api/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'usePastNonMandatory',
                    payload: {
                        user: currentUser,
                        makeupIndex: targetMakeupIndex,
                        pastClassDate: pastClass.date,
                        pastClassCode: pastClass.class // Use 'class' not 'code'
                    }
                })
            });
            
            if (response.ok) {
                const responseData = await response.json();
                console.log('Past credit used successfully:', responseData);
                
                // Show success message before refreshing
                toast.success(`Makeup resolved! Used ${responseData.creditUsed?.class || 'past class'} credit for ${responseData.creditUsed?.forSubject || 'makeup'}.`, {
                    icon: "✅",
                    style: {
                        borderRadius: '10px',
                        background: '#1f2937',
                        color: '#f3f4f6',
                        border: '1px solid #374151'
                    }
                });
                
                onSelect(null); // Refresh the parent component
                onClose();
            } else {
                const errorData = await response.json();
                console.error('Failed to use past class for makeup:', errorData.message);
                alert(errorData.message || 'Failed to use past class for makeup');
            }
        } catch (error) {
            console.error('Error using past class:', error);
            alert('An error occurred while processing your request');
        }
    };
    const getFutureBunks = useCallback(() => {
        const bunks = [];
        const today = new Date();
        const cycleStartDate = getEffectiveCycleStartDate(userData);

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
    }, [userData, selectedSubject, makeupIndex, missedSubject]);

    const futureBunks = getFutureBunks();

    return (
        <AnimatePresence>
            <motion.div 
                className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-2 sm:p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div 
                    className="glass-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] border border-gray-700/50 overflow-hidden overflow-y-auto"
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="relative p-4 sm:p-6 bg-gradient-to-r from-accent-600/20 to-primary-600/20 border-b border-gray-700/50">
                        <motion.button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition-colors group"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <XMarkIcon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                        </motion.button>
                        
                        <div className="flex items-start space-x-3 sm:space-x-4 pr-12">
                            <motion.div
                                className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-accent-500 to-primary-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
                                initial={{ rotate: 0 }}
                                animate={{ rotate: 360 }}
                                transition={{ duration: 0.8, ease: "easeInOut" }}
                            >
                                <AcademicCapIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </motion.div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-accent-400 to-primary-400 bg-clip-text text-transparent leading-tight">
                                    Choose Makeup Class
                                </h3>
                                <p className="text-gray-400 mt-1 text-sm sm:text-base">
                                    You missed a mandatory class for <span className="text-accent-300 font-semibold">{subjects[selectedSubject || userData.makeup?.subjectToMakeup]?.name}</span>. Select a future "Recommended Bunk" to attend as makeup.
                                </p>
                            </div>
                        </div>
                        
                        {/* Tab Navigation */}
                        <motion.div 
                            className="mt-4 sm:mt-6 flex bg-gray-800/50 rounded-xl p-1"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                        >
                            <button
                                onClick={() => setActiveTab('future')}
                                className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium transition-all duration-300 text-sm sm:text-base ${
                                    activeTab === 'future'
                                        ? 'bg-accent-500 text-white shadow-lg'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                                }`}
                            >
                                Future Classes
                            </button>
                            <button
                                onClick={() => setActiveTab('past')}
                                className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium transition-all duration-300 text-sm sm:text-base ${
                                    activeTab === 'past'
                                        ? 'bg-primary-500 text-white shadow-lg'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                                }`}
                            >
                                Past Credits
                            </button>
                        </motion.div>
                        
                        {/* Tab Content Description */}
                        <motion.div 
                            className="mt-4 p-3 bg-gray-800/30 border border-gray-700/30 rounded-xl"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            {activeTab === 'future' ? (
                                <div className="flex items-center space-x-3">
                                    <ExclamationTriangleIcon className="w-5 h-5 text-orange-400 flex-shrink-0" />
                                    <p className="text-sm text-orange-200">
                                        Select a future "Recommended Bunk" class. This will become <strong>mandatory</strong> for you.
                                    </p>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-3">
                                    <AcademicCapIcon className="w-5 h-5 text-blue-400 flex-shrink-0" />
                                    <p className="text-sm text-blue-200">
                                        Use past non-mandatory classes you attended as makeup credits. No additional attendance required.
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-6 max-h-60 sm:max-h-80 overflow-y-auto custom-scrollbar">
                        {activeTab === 'future' ? (
                            // Future Classes Tab
                            futureBunks.length > 0 ? (
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
                                                onClick={() => {
                                                    // Validate bunk data before calling onSelect
                                                    if (bunk && bunk.code && bunk.date && bunk.time) {
                                                        // Pass makeup details with index for proper identification
                                                        onSelect({
                                                            ...bunk,
                                                            makeupIndex: makeupIndex,
                                                            subjectToMakeup: missedSubject
                                                        });
                                                    } else {
                                                        console.error("Invalid bunk data:", bunk);
                                                        alert("Invalid class data. Please refresh and try again.");
                                                    }
                                                }}
                                                className={cn(
                                                    "w-full text-left p-3 sm:p-4 rounded-xl transition-all duration-300 group relative overflow-hidden",
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
                                                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-sm text-gray-400">
                                                                <div className="flex items-center space-x-1">
                                                                    <CalendarIcon className="w-4 h-4" />
                                                                    <span className="text-xs sm:text-sm">
                                                                        {date.toLocaleDateString('en-US', { 
                                                                            weekday: 'short', 
                                                                            month: 'short', 
                                                                            day: 'numeric' 
                                                                        })}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center space-x-1">
                                                                    <ClockIcon className="w-4 h-4" />
                                                                    <span className="font-medium text-gray-300 text-xs sm:text-sm">{bunk.time}</span>
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
                            )
                        ) : (
                            // Past Credits Tab
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                {loadingPastClasses ? (
                                    <motion.div 
                                        className="text-center py-12"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
                                            <ClockIcon className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="text-gray-400 text-lg">Loading makeup credits...</p>
                                        <p className="text-gray-500 text-sm mt-2">Please wait while we fetch your available credits</p>
                                    </motion.div>
                                ) : availablePastClasses.length > 0 ? (
                                    <>
                                        {/* Information about credit sorting */}
                                        {selectedSubject && (
                                            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                                <div className="flex items-center space-x-2">
                                                    <AcademicCapIcon className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                                    <div className="text-xs text-blue-200">
                                                        <span className="font-semibold">💡 Smart Tip:</span> Credits from <span className="font-semibold text-blue-300">{subjects[selectedSubject]?.name || selectedSubject}</span> are shown first and highlighted in blue. Cross-subject credits (orange) will affect attendance for different subjects.
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <motion.div 
                                            className="space-y-3"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.3, staggerChildren: 0.1 }}
                                        >
                                            {availablePastClasses
                                                .sort((a, b) => {
                                                    // Sort same-subject credits first
                                                    if (selectedSubject) {
                                                        const aIsSameSubject = a.class === selectedSubject;
                                                        const bIsSameSubject = b.class === selectedSubject;
                                                        if (aIsSameSubject && !bIsSameSubject) return -1;
                                                        if (!aIsSameSubject && bIsSameSubject) return 1;
                                                    }
                                                    // Then sort by date (most recent first)
                                                    return new Date(b.date) - new Date(a.date);
                                                })
                                                .map((pastClass, index) => {
                                            const subject = subjects[pastClass.class]; // Use 'class' not 'code'
                                            const date = new Date(pastClass.date);
                                            
                                            // Check if this past class is for a different subject
                                            const isDifferentSubject = selectedSubject && pastClass.class !== selectedSubject;
                                            
                                            return (
                                                <motion.button 
                                                    key={`${pastClass.date}-${pastClass.class}`}
                                                    onClick={() => handleUsePastClass(pastClass)}
                                                    className={cn(
                                                        "w-full text-left p-4 rounded-xl transition-all duration-300 group relative overflow-hidden",
                                                        isDifferentSubject 
                                                            ? "bg-orange-800/30 hover:bg-gradient-to-r hover:from-orange-600/20 hover:to-red-600/20 border border-orange-700/50 hover:border-orange-500/50"
                                                            : "bg-gray-800/50 hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-purple-600/20 border border-gray-700/50 hover:border-blue-500/50",
                                                        "transform hover:scale-[1.02] hover:-translate-y-1"
                                                    )}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    whileHover={{ 
                                                        boxShadow: isDifferentSubject 
                                                            ? "0 8px 30px rgba(251, 146, 60, 0.15)" 
                                                            : "0 8px 30px rgba(59, 130, 246, 0.15)" 
                                                    }}
                                                >
                                                    {/* Background Gradient on Hover */}
                                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-300" />
                                                    
                                                    <div className="relative flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center space-x-3 mb-2">
                                                                <div className="w-3 h-3 rounded-full bg-green-400" />
                                                                <h4 className="font-semibold text-white group-hover:text-blue-200 transition-colors">
                                                                    {pastClass.className || subject?.name || 'Unknown Subject'}
                                                                </h4>
                                                                <span className="px-2 py-1 text-xs bg-green-500/20 text-green-300 rounded-full">
                                                                    Attended
                                                                </span>
                                                                {pastClass.wasRecommendedBunk && (
                                                                    <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded-full">
                                                                        Recommended Bunk
                                                                    </span>
                                                                )}
                                                                {isDifferentSubject && (
                                                                    <span className="px-2 py-1 text-xs bg-orange-500/20 text-orange-300 rounded-full flex items-center space-x-1">
                                                                        <ExclamationTriangleIcon className="w-3 h-3" />
                                                                        <span>Cross-Subject</span>
                                                                    </span>
                                                                )}
                                                            </div>
                                                            
                                                            {/* Cross-subject warning */}
                                                            {isDifferentSubject && (
                                                                <div className="mb-3 p-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                                                                    <div className="flex items-start space-x-2">
                                                                        <ExclamationTriangleIcon className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                                                                        <div className="text-xs text-orange-200">
                                                                            <span className="font-semibold">⚠️ Cross-Subject Warning:</span> This credit is from <span className="font-semibold text-orange-300">{pastClass.className || subject?.name}</span> but you're making up <span className="font-semibold text-blue-300">{subjects[selectedSubject]?.name || selectedSubject}</span>. Using it will affect your attendance percentage for <span className="font-semibold text-orange-300">{pastClass.className || subject?.name}</span> (80% rule).
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            
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
                                                                    {pastClass.weekInCycle && (
                                                                        <div className="flex items-center space-x-1">
                                                                            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                                                                                Week {pastClass.weekInCycle}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center space-x-2 text-xs">
                                                                    <span className="text-gray-400">Code: {pastClass.class}</span>
                                                                    <span className="text-gray-500">•</span>
                                                                    <span className="text-blue-400">Available Makeup Credit</span>
                                                                    {pastClass.bunkType && (
                                                                        <>
                                                                            <span className="text-gray-500">•</span>
                                                                            <span className="text-purple-400 capitalize">{pastClass.bunkType} Bunk</span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        <motion.div
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                                            whileHover={{ x: 5 }}
                                                        >
                                                            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                                                <span className="text-blue-400 text-sm font-bold">✓</span>
                                                            </div>
                                                        </motion.div>
                                                    </div>
                                                </motion.button>
                                            );
                                        })}
                                    </motion.div>
                                </>
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
                                        <p className="text-gray-400 text-lg">No makeup credits available</p>
                                        <p className="text-gray-500 text-sm mt-2">
                                            <strong>How to earn makeup credits:</strong>
                                            <br />
                                            1. Look for classes marked as "Can Skip (80% Safe)" 
                                            <br />
                                            2. Attend those classes even though they're optional
                                            <br />
                                            3. Each attended recommended bunk = 1 makeup credit
                                            <br />
                                            <br />
                                            <em>Strategy: Attend optional classes to build credits for future emergencies!</em>
                                        </p>
                                    </motion.div>
                                )}
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
