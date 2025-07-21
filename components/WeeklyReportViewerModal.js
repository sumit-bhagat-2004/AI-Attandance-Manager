import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  DocumentChartBarIcon, 
  CalendarIcon, 
  TrophyIcon, 
  ExclamationTriangleIcon, 
  ChartBarIcon, 
  AcademicCapIcon, 
  SparklesIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  ShareIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  InformationCircleIcon,
  FireIcon,
  BeakerIcon,
  CommandLineIcon
} from '@heroicons/react/24/solid';

const WeeklyReportViewerModal = ({ isOpen, onClose, report, onNavigate }) => {
  const [selectedTab, setSelectedTab] = useState('overview');

  if (!isOpen || !report) return null;

  const getPerformanceColor = (percentage) => {
    if (percentage >= 90) return 'text-emerald-400';
    if (percentage >= 80) return 'text-blue-400';
    if (percentage >= 75) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getPerformanceBg = (percentage) => {
    if (percentage >= 90) return 'from-emerald-500/20 to-emerald-600/10';
    if (percentage >= 80) return 'from-blue-500/20 to-blue-600/10';
    if (percentage >= 75) return 'from-yellow-500/20 to-yellow-600/10';
    return 'from-red-500/20 to-red-600/10';
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircleIcon className="w-5 h-5 text-emerald-400" />;
      case 'warning': return <ExclamationCircleIcon className="w-5 h-5 text-yellow-400" />;
      case 'critical': return <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />;
      default: return <InformationCircleIcon className="w-5 h-5 text-blue-400" />;
    }
  };

  const getSubjectIcon = (type) => {
    switch (type) {
      case 'lab': return <BeakerIcon className="w-4 h-4 text-purple-400" />;
      case 'training': return <CommandLineIcon className="w-4 h-4 text-orange-400" />;
      default: return <AcademicCapIcon className="w-4 h-4 text-blue-400" />;
    }
  };

  const formatDateRange = () => {
    const start = new Date(report.weekRange.start);
    const end = new Date(report.weekRange.end);
    return `${start.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    })} - ${end.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    })}`;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Performance Summary */}
      <div className={`bg-gradient-to-r ${getPerformanceBg(report.summary.weekPercentage)} rounded-xl p-6`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-white">
              {report.summary.weekPercentage}%
            </h3>
            <p className="text-gray-300">Weekly Attendance</p>
          </div>
          <div className="flex items-center gap-2">
            <TrophyIcon className={`w-8 h-8 ${getPerformanceColor(report.summary.weekPercentage)}`} />
            <div className="text-right">
              <p className="text-lg font-bold text-white">
                {report.performance?.grade?.grade || 'N/A'}
              </p>
              <p className="text-sm text-gray-300">
                {report.performance?.grade?.description || 'Grade'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-400">
              {report.summary.totalClassesAttended}
            </p>
            <p className="text-sm text-gray-300">Attended</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-400">
              {report.summary.totalClassesSkipped}
            </p>
            <p className="text-sm text-gray-300">Skipped</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">
              {report.summary.ecaCount}
            </p>
            <p className="text-sm text-gray-300">ECA Credits</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-300">
              {report.summary.totalClassesScheduled}
            </p>
            <p className="text-sm text-gray-300">Total Classes</p>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      {report.insights && report.insights.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-blue-400" />
            Key Insights
          </h4>
          <div className="space-y-3">
            {report.insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-900/50 rounded-lg">
                {getInsightIcon(insight.type)}
                <div className="flex-1">
                  <h5 className="font-medium text-white mb-1">{insight.title}</h5>
                  <p className="text-sm text-gray-400">{insight.message}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  insight.priority === 'critical' ? 'bg-red-900/30 text-red-400' :
                  insight.priority === 'high' ? 'bg-yellow-900/30 text-yellow-400' :
                  insight.priority === 'medium' ? 'bg-blue-900/30 text-blue-400' :
                  'bg-gray-700 text-gray-300'
                }`}>
                  {insight.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Critical & Excellent Subjects */}
      {(report.performance?.criticalSubjects?.length > 0 || report.performance?.excellentSubjects?.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {report.performance.criticalSubjects?.length > 0 && (
            <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-red-400 mb-3 flex items-center gap-2">
                <ExclamationTriangleIcon className="w-5 h-5" />
                Needs Attention
              </h4>
              <div className="space-y-2">
                {report.performance.criticalSubjects.map((subject, index) => (
                  <div key={index} className="text-sm text-red-300 bg-red-900/30 px-3 py-2 rounded">
                    {subject}
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.performance.excellentSubjects?.length > 0 && (
            <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5" />
                Excellence
              </h4>
              <div className="space-y-2">
                {report.performance.excellentSubjects.map((subject, index) => (
                  <div key={index} className="text-sm text-emerald-300 bg-emerald-900/30 px-3 py-2 rounded">
                    {subject}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderSubjects = () => (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-white mb-4">Subject-wise Performance</h4>
      <div className="grid gap-4">
        {Object.entries(report.subjectWiseReport || {}).map(([code, subject]) => (
          <div key={code} className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {getSubjectIcon(subject.type)}
                <div>
                  <h5 className="font-semibold text-white">{subject.name}</h5>
                  <p className="text-sm text-gray-400">{code}</p>
                </div>
                {subject.type === 'lab' && (
                  <span className="px-2 py-1 bg-purple-900/30 text-purple-400 text-xs rounded">
                    2x Weight
                  </span>
                )}
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${getPerformanceColor(subject.percentage)}`}>
                  {subject.percentage}%
                </p>
                <p className="text-sm text-gray-400">
                  {subject.attended}/{subject.scheduled} classes
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-lg font-bold text-emerald-400">{subject.attended}</p>
                <p className="text-xs text-gray-400">Attended</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-red-400">{subject.skipped}</p>
                <p className="text-xs text-gray-400">Skipped</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-400">{subject.unrecorded}</p>
                <p className="text-xs text-gray-400">Unrecorded</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full bg-gradient-to-r ${
                    subject.percentage >= 90 ? 'from-emerald-500 to-green-500' :
                    subject.percentage >= 80 ? 'from-blue-500 to-cyan-500' :
                    subject.percentage >= 75 ? 'from-yellow-500 to-orange-500' :
                    'from-red-500 to-rose-500'
                  }`}
                  style={{ width: `${subject.percentage}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDaily = () => (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-white mb-4">Daily Breakdown</h4>
      <div className="grid gap-4">
        {Object.entries(report.dailyReport || {}).map(([date, day]) => (
          <div key={date} className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h5 className="font-semibold text-white">{day.dayName}</h5>
                <p className="text-sm text-gray-400">
                  {new Date(day.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-white">
                  {day.totalAttended}/{day.totalScheduled}
                </p>
                <p className="text-sm text-gray-400">
                  {day.totalScheduled > 0 ? Math.round((day.totalAttended / day.totalScheduled) * 100) : 0}%
                </p>
              </div>
            </div>

            {Object.keys(day.subjects).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(day.subjects).map(([subjectCode, subjectData]) => (
                  <div key={subjectCode} className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
                    <div className="flex items-center gap-2">
                      {getSubjectIcon(subjectData.type)}
                      <span className="text-sm text-white">{subjectData.name}</span>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${
                      subjectData.status === 'attended' ? 'bg-emerald-900/30 text-emerald-400' :
                      subjectData.status === 'skipped' ? 'bg-red-900/30 text-red-400' :
                      'bg-gray-700 text-gray-300'
                    }`}>
                      {subjectData.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-400">No classes scheduled</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderECA = () => (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-white mb-4">ECA Activities</h4>
      {report.ecaActivities && report.ecaActivities.length > 0 ? (
        <div className="space-y-4">
          {report.ecaActivities.map((eca, index) => (
            <div key={index} className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-semibold text-white">{eca.event}</h5>
                  <p className="text-sm text-gray-400">
                    {new Date(eca.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-400">{eca.count}</p>
                  <p className="text-xs text-gray-400">Credit{eca.count > 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>
          ))}
          <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-blue-400" />
              <div>
                <p className="font-medium text-blue-400">Total ECA Credits</p>
                <p className="text-sm text-gray-300">
                  {report.summary.ecaCount} credit{report.summary.ecaCount !== 1 ? 's' : ''} earned this week
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl p-8 text-center">
          <SparklesIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h5 className="text-lg font-semibold text-gray-400 mb-2">No ECA Activities</h5>
          <p className="text-gray-500">No extracurricular activities recorded for this week.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-6xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Week {report.weekInCycle} Report
              </h2>
              <p className="text-gray-400">{formatDateRange()}</p>
              {report.studentName && (
                <p className="text-sm text-gray-500">Student: {report.studentName}</p>
              )}
            </div>
            {report.isCompleted && (
              <CheckCircleIcon className="w-6 h-6 text-emerald-400" />
            )}
          </div>

          <div className="flex items-center gap-3">
            {onNavigate && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onNavigate('prev')}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  title="Previous Report"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onNavigate('next')}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  title="Next Report"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            )}
            
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
              <PrinterIcon className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
              <ShareIcon className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {[
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'subjects', label: 'Subjects', icon: AcademicCapIcon },
            { id: 'daily', label: 'Daily', icon: CalendarIcon },
            { id: 'eca', label: 'ECA Activities', icon: SparklesIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 transition-colors ${
                selectedTab === tab.id
                  ? 'border-b-2 border-blue-500 text-blue-400 bg-blue-900/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {selectedTab === 'overview' && renderOverview()}
              {selectedTab === 'subjects' && renderSubjects()}
              {selectedTab === 'daily' && renderDaily()}
              {selectedTab === 'eca' && renderECA()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 p-4 text-center">
          <p className="text-xs text-gray-500">
            Report generated on {new Date(report.generatedAt).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default WeeklyReportViewerModal;
