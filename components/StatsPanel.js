import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, Award, AlertTriangle, Star } from 'lucide-react';
import { subjects, calculateTotalClassesHeld, getEffectiveCycleStartDate, fullSchedule } from '../lib/scheduleData';
import { getAttendanceColor, getAttendanceTextColor, calculateSubjectAttendance, cn, formatDateToLocalString } from '../lib/utils';

export default function StatsPanel({ userData }) {
    // Helper function to calculate total classes held considering subject changes
    const calculateAdjustedTotalClassesHeld = (subjectCode) => {
        const effectiveStartDate = getEffectiveCycleStartDate(userData);
        let count = 0;
        
        let currentDate = new Date(effectiveStartDate);
        const today = new Date();
        
        while (currentDate <= today) {
            const dayOfWeek = currentDate.getDay();
            const dateStr = formatDateToLocalString(currentDate);
            
            if (fullSchedule[dayOfWeek]) {
                for (const cls of fullSchedule[dayOfWeek]) {
                    if (cls.code === subjectCode) {
                        // Check if this class was changed on this date
                        const changeKey = `${dateStr}-${subjectCode}`;
                        const wasChanged = userData?.subjectChanges?.[changeKey];
                        
                        if (!wasChanged) {
                            // This subject was not changed, so count it
                            count++;
                        }
                    } else {
                        // Check if another subject was changed TO this subject on this date
                        const changedToThis = userData?.subjectChanges && Object.entries(userData.subjectChanges).find(([key, change]) => 
                            key.startsWith(dateStr) && change.newSubject === subjectCode
                        );
                        
                        if (changedToThis) {
                            // Another subject was changed to this subject, so count it
                            count++;
                        }
                    }
                }
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return count;
    };

    const getPercentage = (code) => {
        return calculateSubjectAttendance ? calculateSubjectAttendance(userData, code) : 0;
    };

    const getSubjectStats = (code) => {
        const effectiveStartDate = getEffectiveCycleStartDate(userData);
        const attendedCount = Object.values(userData.history || {}).reduce((acc, day) => {
            return acc + (day[code] === 'attended' ? 1 : 0);
        }, 0);
        const totalHeld = calculateAdjustedTotalClassesHeld(code);
        const percentage = getPercentage(code);
        
        return {
            code,
            name: subjects[code].name,
            percentage,
            attended: attendedCount,
            total: totalHeld,
            missed: totalHeld - attendedCount,
            isLab: code.startsWith('LAB'),
            weight: code.startsWith('LAB') ? 2 : 1
        };
    };

    const getAllSubjects = () => {
        return Object.keys(subjects)
            .map(code => getSubjectStats(code))
            .sort((a, b) => b.percentage - a.percentage);
    };

    // Get ECA statistics
    const getECAStats = () => {
        if (!userData.ecaRecords) return { totalECAs: 0, recentECAs: [] };
        
        const ecaEntries = Object.entries(userData.ecaRecords);
        const totalECAs = ecaEntries.reduce((total, [_, eca]) => total + (eca.count || 1), 0);
        
        // Get recent ECAs (last 5)
        const recentECAs = ecaEntries
            .sort((a, b) => new Date(b[1].timestamp) - new Date(a[1].timestamp))
            .slice(0, 5)
            .map(([date, eca]) => ({
                date,
                event: eca.event,
                count: eca.count || 1
            }));
        
        return { totalECAs, recentECAs };
    };

    const subjectStats = getAllSubjects();
    const averageAttendance = Math.round(subjectStats.reduce((sum, subject) => sum + subject.percentage, 0) / subjectStats.length);
    const criticalSubjects = subjectStats.filter(s => s.percentage < 80);
    const excellentSubjects = subjectStats.filter(s => s.percentage >= 90);
    const { totalECAs, recentECAs } = getECAStats();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.5,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { x: 20, opacity: 0 },
        visible: {
            x: 0,
            opacity: 1,
            transition: { duration: 0.4 }
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
        >
            {/* Compact Header with Overall Percentage */}
            <motion.div variants={itemVariants} className="card-gradient p-6 rounded-2xl">
                <div className="text-center mb-4">
                    <motion.div
                        className="relative inline-flex items-center justify-center w-32 h-32 mx-auto mb-4"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", duration: 0.8 }}
                    >
                        {/* Circular Progress Ring */}
                        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                            <circle
                                cx="60"
                                cy="60"
                                r="50"
                                fill="none"
                                stroke="rgba(75, 85, 99, 0.3)"
                                strokeWidth="8"
                            />
                            <motion.circle
                                cx="60"
                                cy="60"
                                r="50"
                                fill="none"
                                stroke="url(#gradient)"
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 50}`}
                                initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                                animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - averageAttendance / 100) }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                            />
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor={averageAttendance >= 80 ? "#10b981" : "#ef4444"} />
                                    <stop offset="100%" stopColor={averageAttendance >= 80 ? "#22d3ee" : "#f97316"} />
                                </linearGradient>
                            </defs>
                        </svg>
                        
                        {/* Percentage Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <motion.div
                                className={`text-3xl font-bold ${
                                    averageAttendance >= 80 ? "text-green-400" : "text-red-400"
                                }`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                {averageAttendance}%
                            </motion.div>
                            <div className="text-xs text-gray-400 font-medium">Overall</div>
                        </div>
                    </motion.div>
                    
                    <div className="flex justify-center space-x-6 text-sm">
                        <div className="text-center">
                            <div className={`text-xl font-bold ${excellentSubjects.length > 0 ? "text-green-400" : "text-gray-500"}`}>
                                {excellentSubjects.length}
                            </div>
                            <div className="text-gray-400">Excellent</div>
                        </div>
                        <div className="text-center">
                            <div className={`text-xl font-bold ${criticalSubjects.length > 0 ? "text-red-400" : "text-green-400"}`}>
                                {criticalSubjects.length}
                            </div>
                            <div className="text-gray-400">At Risk</div>
                        </div>
                    </div>
                </div>

                {/* Status Message */}
                <div className={`text-center p-3 rounded-xl ${
                    averageAttendance >= 90 ? "bg-green-500/10 border border-green-500/30" :
                    averageAttendance >= 80 ? "bg-blue-500/10 border border-blue-500/30" :
                    "bg-red-500/10 border border-red-500/30"
                }`}>
                    <div className={`font-semibold ${
                        averageAttendance >= 90 ? "text-green-400" :
                        averageAttendance >= 80 ? "text-blue-400" :
                        "text-red-400"
                    }`}>
                        {averageAttendance >= 90 ? "🏆 Outstanding Performance!" :
                         averageAttendance >= 80 ? "✅ Good Standing" :
                         "⚠️ Needs Improvement"}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                        {averageAttendance >= 80 ? "Keep up the excellent work!" : 
                         "Focus on attending more classes"}
                    </div>
                </div>
            </motion.div>

            {/* Compact Subject List */}
            <motion.div variants={itemVariants} className="card-gradient p-4 rounded-2xl">
                <h3 className="font-bold text-white mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full"></div>
                        Subject Progress
                    </span>
                    <span className="text-xs text-gray-400">{subjectStats.length} subjects</span>
                </h3>
                
                <div className="space-y-3">
                    {subjectStats.slice(0, 5).map((subject, index) => (
                        <motion.div
                            key={subject.code}
                            variants={itemVariants}
                            whileHover={{ scale: 1.02 }}
                            className="group"
                        >
                            <div className="flex justify-between items-center mb-1">
                                <div className="flex-1 flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors line-clamp-1">
                                        {subject.name}
                                    </span>
                                    {subject.isLab && (
                                        <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                                            2x Lab
                                        </span>
                                    )}
                                </div>
                                <span className={`text-sm font-bold px-2 py-1 rounded-lg ml-2 ${
                                    subject.percentage >= 90 ? "bg-green-500/20 text-green-400" :
                                    subject.percentage >= 80 ? "bg-blue-500/20 text-blue-400" :
                                    subject.percentage >= 75 ? "bg-yellow-500/20 text-yellow-400" :
                                    "bg-red-500/20 text-red-400"
                                }`}>
                                    {subject.percentage}%
                                </span>
                            </div>
                            
                            {/* Attendance Stats */}
                            <div className="flex justify-between items-center mb-2 text-xs text-gray-400">
                                <span>Attended: <span className="text-green-400 font-medium">{subject.attended}</span> / <span className="text-gray-300 font-medium">{subject.total}</span></span>
                                {subject.missed > 0 && (
                                    <span>Missed: <span className="text-red-400 font-medium">{subject.missed}</span></span>
                                )}
                            </div>
                            
                            <div className="relative w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${subject.percentage}%` }}
                                    transition={{ 
                                        duration: 1,
                                        delay: index * 0.1,
                                        ease: "easeOut"
                                    }}
                                    className={`h-full rounded-full ${
                                        subject.percentage >= 90 ? "bg-gradient-to-r from-green-400 to-green-600" :
                                        subject.percentage >= 80 ? "bg-gradient-to-r from-blue-400 to-blue-600" :
                                        subject.percentage >= 75 ? "bg-gradient-to-r from-yellow-400 to-yellow-600" :
                                        "bg-gradient-to-r from-red-400 to-red-600"
                                    }`}
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>
                
                {subjectStats.length > 5 && (
                    <div className="text-center text-xs text-gray-400 mt-3">
                        +{subjectStats.length - 5} more subjects
                    </div>
                )}
            </motion.div>

            {/* ECA Statistics Section */}
            {totalECAs > 0 && (
                <motion.div 
                    variants={itemVariants}
                    className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-4"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-blue-400" />
                            <div>
                                <div className="font-semibold text-blue-400 text-sm">ECA Activities</div>
                                <div className="text-xs text-gray-300">
                                    {totalECAs} credit{totalECAs > 1 ? 's' : ''} boosting attendance
                                </div>
                            </div>
                        </div>
                        <div className="text-blue-400 text-lg font-bold">+{totalECAs}</div>
                    </div>
                    
                    {recentECAs.length > 0 && (
                        <div className="space-y-2">
                            <div className="text-xs text-gray-400 mb-2">Recent Activities:</div>
                            {recentECAs.slice(0, 3).map((eca, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center justify-between text-xs"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></div>
                                        <span className="text-gray-300 truncate">{eca.event}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-blue-400">
                                        <span>+{eca.count}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}

            {/* Critical Alert - Compact */}
            {criticalSubjects.length > 0 && (
                <motion.div 
                    variants={itemVariants}
                    className="bg-red-500/10 border border-red-500/30 rounded-xl p-3"
                    whileHover={{ scale: 1.02 }}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
                            <div>
                                <div className="font-semibold text-red-400 text-sm">Action Required</div>
                                <div className="text-xs text-gray-300">
                                    {criticalSubjects.length} subject{criticalSubjects.length > 1 ? 's' : ''} below 80%
                                </div>
                            </div>
                        </div>
                        <div className="text-red-400 text-xl">!</div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
