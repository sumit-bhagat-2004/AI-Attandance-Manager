import React from 'react';
import { motion } from 'framer-motion';
import { 
    ChartBarIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    CircleStackIcon,
    TrophyIcon,
    ExclamationTriangleIcon,
    AcademicCapIcon,
    CalendarIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import { subjects, calculateTotalClassesHeld, getEffectiveCycleStartDate } from '../lib/scheduleData';
import { calculateSubjectAttendance, cn } from '../lib/utils';

export default function StatsView({ userData }) {
    // Calculate detailed statistics for ALL subjects (including labs and training)
    const getSubjectStats = () => {
        const effectiveStartDate = getEffectiveCycleStartDate(userData);
        
        return Object.keys(subjects)
            .map(code => {
                const attendedCount = Object.values(userData.history).reduce((acc, day) => {
                    return acc + (day[code] === 'attended' ? 1 : 0);
                }, 0);

                const skippedCount = Object.values(userData.history).reduce((acc, day) => {
                    return acc + (day[code] === 'skipped' ? 1 : 0);
                }, 0);

                const totalHeld = calculateTotalClassesHeld(code, effectiveStartDate, new Date());
                const percentage = calculateSubjectAttendance ? calculateSubjectAttendance(userData, code) : 
                    (totalHeld === 0 ? 100 : Math.round((attendedCount / totalHeld) * 100));

                // Determine subject type
                const isLab = code.startsWith('LAB');
                const isTraining = code.startsWith('TRAIN');
                const isJava = code.includes('JAVA');

                return {
                    code,
                    name: subjects[code].name,
                    attended: attendedCount,
                    skipped: skippedCount,
                    total: totalHeld,
                    percentage,
                    remaining: totalHeld - attendedCount - skippedCount,
                    trend: percentage >= 80 ? 'good' : percentage >= 75 ? 'warning' : 'critical',
                    type: isLab ? 'lab' : isTraining ? 'training' : 'regular',
                    isJava: isJava,
                    weight: isLab ? 2 : 1 // Lab classes are 2x weighted
                };
            })
            .sort((a, b) => b.percentage - a.percentage);
    };

    const subjectStats = getSubjectStats();
    const overallAttendance = Math.round(
        subjectStats.reduce((sum, subject) => sum + subject.percentage, 0) / subjectStats.length
    );

    const excellentSubjects = subjectStats.filter(s => s.percentage >= 90);
    const goodSubjects = subjectStats.filter(s => s.percentage >= 80 && s.percentage < 90);
    const warningSubjects = subjectStats.filter(s => s.percentage >= 75 && s.percentage < 80);
    const criticalSubjects = subjectStats.filter(s => s.percentage < 75);

    const totalAttended = subjectStats.reduce((sum, s) => sum + s.attended, 0);
    const totalSkipped = subjectStats.reduce((sum, s) => sum + s.skipped, 0);
    const totalClasses = subjectStats.reduce((sum, s) => sum + s.total, 0);

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
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.4 }
        }
    };

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
                            className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg"
                            whileHover={{ scale: 1.05, rotate: 5 }}
                        >
                            <TrophyIcon className="w-6 h-6 text-white" />
                        </motion.div>
                        <div>
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Detailed Statistics
                            </h2>
                            <p className="text-gray-400 text-sm">Complete attendance analysis and insights</p>
                        </div>
                    </div>
                    
                    {/* Overall Grade Badge */}
                    <div className={cn(
                        "px-6 py-3 rounded-xl font-bold text-lg",
                        overallAttendance >= 90 ? "bg-green-500/20 border border-green-400/40 text-green-300" :
                        overallAttendance >= 80 ? "bg-blue-500/20 border border-blue-400/40 text-blue-300" :
                        overallAttendance >= 75 ? "bg-yellow-500/20 border border-yellow-400/40 text-yellow-300" :
                        "bg-red-500/20 border border-red-400/40 text-red-300"
                    )}>
                        {overallAttendance >= 90 ? "🏆 Excellent" :
                         overallAttendance >= 80 ? "✅ Good" :
                         overallAttendance >= 75 ? "⚠️ Warning" :
                         "🚨 Critical"}
                    </div>
                </div>

                {/* Overall Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <motion.div variants={itemVariants} className="bg-gradient-to-br from-green-500/20 to-green-600/10 p-4 rounded-xl border border-green-500/30">
                        <div className="flex items-center space-x-3">
                            <CheckCircleIcon className="w-8 h-8 text-green-400" />
                            <div>
                                <div className="text-2xl font-bold text-green-300">{totalAttended}</div>
                                <div className="text-sm text-gray-400">Attended</div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-gradient-to-br from-red-500/20 to-red-600/10 p-4 rounded-xl border border-red-500/30">
                        <div className="flex items-center space-x-3">
                            <XCircleIcon className="w-8 h-8 text-red-400" />
                            <div>
                                <div className="text-2xl font-bold text-red-300">{totalSkipped}</div>
                                <div className="text-sm text-gray-400">Skipped</div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 p-4 rounded-xl border border-blue-500/30">
                        <div className="flex items-center space-x-3">
                            <CalendarIcon className="w-8 h-8 text-blue-400" />
                            <div>
                                <div className="text-2xl font-bold text-blue-300">{totalClasses}</div>
                                <div className="text-sm text-gray-400">Total Classes</div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 p-4 rounded-xl border border-purple-500/30">
                        <div className="flex items-center space-x-3">
                            <CircleStackIcon className="w-8 h-8 text-purple-400" />
                            <div>
                                <div className="text-2xl font-bold text-purple-300">{overallAttendance}%</div>
                                <div className="text-sm text-gray-400">Overall</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Subject Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* Excellent Subjects */}
                {excellentSubjects.length > 0 && (
                    <motion.div variants={itemVariants} className="card-gradient p-4 rounded-xl border border-green-500/30">
                        <div className="flex items-center space-x-2 mb-3">
                            <TrophyIcon className="w-5 h-5 text-green-400" />
                            <h3 className="font-bold text-green-300">Excellent (90%+)</h3>
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">{excellentSubjects.length}</span>
                        </div>
                        <div className="space-y-2">
                            {excellentSubjects.map(subject => (
                                <div key={subject.code} className="flex justify-between items-center text-sm">
                                    <span className="text-gray-300 truncate">{subject.name}</span>
                                    <span className="text-green-400 font-medium">{subject.percentage}%</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Good Subjects */}
                {goodSubjects.length > 0 && (
                    <motion.div variants={itemVariants} className="card-gradient p-4 rounded-xl border border-blue-500/30">
                        <div className="flex items-center space-x-2 mb-3">
                            <CheckCircleIcon className="w-5 h-5 text-blue-400" />
                            <h3 className="font-bold text-blue-300">Good (80-89%)</h3>
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">{goodSubjects.length}</span>
                        </div>
                        <div className="space-y-2">
                            {goodSubjects.map(subject => (
                                <div key={subject.code} className="flex justify-between items-center text-sm">
                                    <span className="text-gray-300 truncate">{subject.name}</span>
                                    <span className="text-blue-400 font-medium">{subject.percentage}%</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Warning Subjects */}
                {warningSubjects.length > 0 && (
                    <motion.div variants={itemVariants} className="card-gradient p-4 rounded-xl border border-yellow-500/30">
                        <div className="flex items-center space-x-2 mb-3">
                            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
                            <h3 className="font-bold text-yellow-300">Warning (75-79%)</h3>
                            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">{warningSubjects.length}</span>
                        </div>
                        <div className="space-y-2">
                            {warningSubjects.map(subject => (
                                <div key={subject.code} className="flex justify-between items-center text-sm">
                                    <span className="text-gray-300 truncate">{subject.name}</span>
                                    <span className="text-yellow-400 font-medium">{subject.percentage}%</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Critical Subjects */}
                {criticalSubjects.length > 0 && (
                    <motion.div variants={itemVariants} className="card-gradient p-4 rounded-xl border border-red-500/30">
                        <div className="flex items-center space-x-2 mb-3">
                            <XCircleIcon className="w-5 h-5 text-red-400" />
                            <h3 className="font-bold text-red-300">Critical (&lt;75%)</h3>
                            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">{criticalSubjects.length}</span>
                        </div>
                        <div className="space-y-2">
                            {criticalSubjects.map(subject => (
                                <div key={subject.code} className="flex justify-between items-center text-sm">
                                    <span className="text-gray-300 truncate">{subject.name}</span>
                                    <span className="text-red-400 font-medium">{subject.percentage}%</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Detailed Subject Table */}
            <motion.div variants={itemVariants} className="card-gradient p-6 rounded-2xl">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                    <AcademicCapIcon className="w-6 h-6 text-cyan-400" />
                    <span>Subject-wise Breakdown</span>
                </h3>
                
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-600/50">
                                <th className="text-left py-3 px-2 text-gray-300 font-medium">Subject</th>
                                <th className="text-center py-3 px-2 text-gray-300 font-medium">Attended</th>
                                <th className="text-center py-3 px-2 text-gray-300 font-medium">Skipped</th>
                                <th className="text-center py-3 px-2 text-gray-300 font-medium">Total</th>
                                <th className="text-center py-3 px-2 text-gray-300 font-medium">%</th>
                                <th className="text-center py-3 px-2 text-gray-300 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjectStats.map((subject, index) => (
                                <motion.tr
                                    key={subject.code}
                                    variants={itemVariants}
                                    className="border-b border-gray-700/30 hover:bg-gray-800/30 transition-colors"
                                >
                                    <td className="py-3 px-2">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <div className="font-medium text-white">{subject.name}</div>
                                                {subject.type === 'lab' && (
                                                    <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                                                        2x Lab
                                                    </span>
                                                )}
                                                {subject.type === 'training' && (
                                                    <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full border border-orange-500/30">
                                                        Training
                                                    </span>
                                                )}
                                                {subject.isJava && (
                                                    <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">
                                                        Java
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-400">{subject.code}</div>
                                        </div>
                                    </td>
                                    <td className="text-center py-3 px-2">
                                        <span className="text-green-400 font-medium">{subject.attended}</span>
                                    </td>
                                    <td className="text-center py-3 px-2">
                                        <span className="text-red-400 font-medium">{subject.skipped}</span>
                                    </td>
                                    <td className="text-center py-3 px-2">
                                        <span className="text-gray-300">{subject.total}</span>
                                    </td>
                                    <td className="text-center py-3 px-2">
                                        <span className={cn(
                                            "font-bold px-2 py-1 rounded-lg text-sm",
                                            subject.percentage >= 90 ? "bg-green-500/20 text-green-300" :
                                            subject.percentage >= 80 ? "bg-blue-500/20 text-blue-300" :
                                            subject.percentage >= 75 ? "bg-yellow-500/20 text-yellow-300" :
                                            "bg-red-500/20 text-red-300"
                                        )}>
                                            {subject.percentage}%
                                        </span>
                                    </td>
                                    <td className="text-center py-3 px-2">
                                        <div className="flex items-center justify-center space-x-1">
                                            {subject.trend === 'good' && <ArrowUpIcon className="w-4 h-4 text-green-400" />}
                                            {subject.trend === 'warning' && <ExclamationTriangleIcon className="w-4 h-4 text-yellow-400" />}
                                            {subject.trend === 'critical' && <ArrowDownIcon className="w-4 h-4 text-red-400" />}
                                            <span className={cn(
                                                "text-xs font-medium",
                                                subject.trend === 'good' ? "text-green-400" :
                                                subject.trend === 'warning' ? "text-yellow-400" :
                                                "text-red-400"
                                            )}>
                                                {subject.trend === 'good' ? 'Good' :
                                                 subject.trend === 'warning' ? 'Warning' :
                                                 'Critical'}
                                            </span>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
}
