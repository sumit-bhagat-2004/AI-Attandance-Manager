import React, { useState, useEffect } from 'react';
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
  EyeIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/solid';

const ReportManagerModal = ({ isOpen, onClose, reports = [], onDeleteReport, onViewReport, onGenerateReport, isGenerating = false }) => {
  const [selectedTab, setSelectedTab] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [filterBy, setFilterBy] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredReports, setFilteredReports] = useState([]);

  useEffect(() => {
    let filtered = [...reports];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(report => 
        report.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `Week ${report.weekInCycle}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.weekRange.startStr.includes(searchTerm) ||
        report.weekRange.endStr.includes(searchTerm)
      );
    }

    // Apply performance filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(report => {
        const percentage = report.summary.weekPercentage;
        switch (filterBy) {
          case 'excellent': return percentage >= 90;
          case 'good': return percentage >= 80 && percentage < 90;
          case 'warning': return percentage >= 75 && percentage < 80;
          case 'critical': return percentage < 75;
          case 'completed': return report.isCompleted;
          case 'incomplete': return !report.isCompleted;
          default: return true;
        }
      });
    }

    // Apply tab filter
    if (selectedTab !== 'all') {
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      filtered = filtered.filter(report => {
        const reportDate = new Date(report.generatedAt);
        switch (selectedTab) {
          case 'recent': return reportDate >= oneWeekAgo;
          case 'thisMonth': return reportDate >= oneMonthAgo;
          case 'completed': return report.isCompleted;
          default: return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.generatedAt) - new Date(a.generatedAt);
        case 'oldest':
          return new Date(a.generatedAt) - new Date(b.generatedAt);
        case 'weekNumber':
          return b.weekInCycle - a.weekInCycle;
        case 'performance':
          return b.summary.weekPercentage - a.summary.weekPercentage;
        case 'name':
          return (a.studentName || '').localeCompare(b.studentName || '');
        default:
          return 0;
      }
    });

    setFilteredReports(filtered);
  }, [reports, searchTerm, filterBy, sortBy, selectedTab]);

  const getPerformanceColor = (percentage) => {
    if (percentage >= 90) return 'text-emerald-400 bg-emerald-900/30';
    if (percentage >= 80) return 'text-blue-400 bg-blue-900/30';
    if (percentage >= 75) return 'text-yellow-400 bg-yellow-900/30';
    return 'text-red-400 bg-red-900/30';
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircleIcon className="w-4 h-4 text-emerald-400" />;
      case 'warning': return <ExclamationCircleIcon className="w-4 h-4 text-yellow-400" />;
      case 'critical': return <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />;
      default: return <InformationCircleIcon className="w-4 h-4 text-blue-400" />;
    }
  };

  const formatDateRange = (report) => {
    const start = new Date(report.weekRange.start);
    const end = new Date(report.weekRange.end);
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  const getTopInsight = (report) => {
    if (!report.insights || report.insights.length === 0) return null;
    return report.insights.sort((a, b) => {
      const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
      return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    })[0];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-7xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <DocumentChartBarIcon className="w-8 h-8 text-blue-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Weekly Report Manager</h2>
              <p className="text-gray-400">
                {filteredReports.length} of {reports.length} reports
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: isGenerating ? 1 : 1.05 }}
              whileTap={{ scale: isGenerating ? 1 : 0.95 }}
              onClick={onGenerateReport}
              disabled={isGenerating}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isGenerating 
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isGenerating ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full"
                />
              ) : (
                <SparklesIcon className="w-4 h-4" />
              )}
              {isGenerating ? 'Generating Reports...' : 'Generate New Report'}
            </motion.button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs and Filters */}
        <div className="p-6 border-b border-gray-700 space-y-4">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Reports', icon: DocumentChartBarIcon },
              { id: 'recent', label: 'Recent', icon: CalendarIcon },
              { id: 'thisMonth', label: 'This Month', icon: ChartBarIcon },
              { id: 'completed', label: 'Completed', icon: CheckCircleIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Performance Filter */}
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Performance</option>
              <option value="excellent">Excellent (90%+)</option>
              <option value="good">Good (80-89%)</option>
              <option value="warning">Needs Attention (75-79%)</option>
              <option value="critical">Critical (&lt;75%)</option>
              <option value="completed">Completed Weeks</option>
              <option value="incomplete">In Progress</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="weekNumber">Week Number</option>
              <option value="performance">Best Performance</option>
              <option value="name">Student Name</option>
            </select>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <DocumentChartBarIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No Reports Found</h3>
              <p className="text-gray-500">
                {reports.length === 0 
                  ? "Generate your first weekly report to get started."
                  : "Try adjusting your search or filters."
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredReports.map((report) => {
                const topInsight = getTopInsight(report);
                
                return (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-gray-600 transition-colors"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          Week {report.weekInCycle}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {formatDateRange(report)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {report.isCompleted && (
                          <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
                        )}
                        <div className="flex gap-1">
                          <button
                            onClick={() => onViewReport(report)}
                            className="p-1.5 text-blue-400 hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="View Report"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteReport(report.id)}
                            className="p-1.5 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Delete Report"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Student Info */}
                    {report.studentName && (
                      <div className="flex items-center gap-2 mb-4">
                        <AcademicCapIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-300">{report.studentName}</span>
                      </div>
                    )}

                    {/* Performance Summary */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Weekly Performance</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          getPerformanceColor(report.summary.weekPercentage)
                        }`}>
                          {report.summary.weekPercentage}%
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                          <p className="text-xs text-gray-400">Attended</p>
                          <p className="text-sm font-medium text-emerald-400">
                            {report.summary.totalClassesAttended}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Skipped</p>
                          <p className="text-sm font-medium text-red-400">
                            {report.summary.totalClassesSkipped}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">ECA</p>
                          <p className="text-sm font-medium text-blue-400">
                            {report.summary.ecaCount}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Top Insight */}
                    {topInsight && (
                      <div className="bg-gray-900/50 rounded-lg p-3 mb-4">
                        <div className="flex items-start gap-2">
                          {getInsightIcon(topInsight.type)}
                          <div className="flex-1">
                            <p className="text-xs font-medium text-gray-300">
                              {topInsight.title}
                            </p>
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                              {topInsight.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Performance Grade */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        Generated {new Date(report.generatedAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-1">
                        <TrophyIcon className={`w-4 h-4 ${
                          report.performance?.grade?.color === 'emerald' ? 'text-emerald-400' :
                          report.performance?.grade?.color === 'green' ? 'text-green-400' :
                          report.performance?.grade?.color === 'blue' ? 'text-blue-400' :
                          report.performance?.grade?.color === 'yellow' ? 'text-yellow-400' :
                          'text-gray-400'
                        }`} />
                        <span className="text-sm font-medium text-gray-300">
                          {report.performance?.grade?.grade || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ReportManagerModal;
