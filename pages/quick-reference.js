import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Zap, 
  MousePointer,
  Calendar,
  BarChart3,
  Bell,
  Plus,
  Eye,
  Settings,
  User,
  BookOpen
} from 'lucide-react';
import { useRouter } from 'next/router';

const QuickReferencePage = () => {
  const router = useRouter();

  const shortcuts = [
    {
      category: "Navigation",
      icon: <MousePointer className="h-4 w-4" />,
      items: [
        { action: "Switch to Schedule View", method: "Click 'Schedule' in navigation" },
        { action: "Switch to Stats View", method: "Click 'Stats' in navigation" },
        { action: "Switch to Makeup View", method: "Click 'Makeup' in navigation" },
        { action: "Switch to Calendar View", method: "Click 'Calendar' in navigation" },
        { action: "Open Mobile Menu", method: "Click hamburger menu (mobile only)" }
      ]
    },
    {
      category: "Attendance",
      icon: <Calendar className="h-4 w-4" />,
      items: [
        { action: "Mark Present", method: "Click class → Green checkmark" },
        { action: "Mark Absent", method: "Click class → Red X mark" },
        { action: "Mark All Present", method: "Click 'Mark All Present' button" },
        { action: "Mark All Absent", method: "Click 'Mark All Absent' button" },
        { action: "View Class Details", method: "Hover over class card" }
      ]
    },
    {
      category: "Reports & AI",
      icon: <BarChart3 className="h-4 w-4" />,
      items: [
        { action: "Generate AI Reports", method: "Click 'AI-Enhanced Weekly Reports' button" },
        { action: "View Report", method: "Reports Modal → Click 'View' on report" },
        { action: "Delete Report", method: "Reports Modal → Click 'Delete' on report" },
        { action: "Close AI Modal", method: "Click X or press Escape" },
        { action: "View Statistics", method: "Stats panel on right side" }
      ]
    },
    {
      category: "ECA & Activities",
      icon: <Plus className="h-4 w-4" />,
      items: [
        { action: "Add ECA", method: "Click 'Add ECA' button" },
        { action: "Edit ECA", method: "Calendar View → Click on ECA event" },
        { action: "Delete ECA", method: "ECA Modal → Click delete button" },
        { action: "View ECA History", method: "Switch to Calendar view" }
      ]
    },
    {
      category: "Makeup Classes",
      icon: <Bell className="h-4 w-4" />,
      items: [
        { action: "Schedule Makeup", method: "Click notification in Makeup section" },
        { action: "View Makeup Alerts", method: "Check Makeup panel (right side)" },
        { action: "Select Makeup Class", method: "Makeup Modal → Choose from available slots" },
        { action: "Confirm Makeup", method: "Select class → Click 'Schedule Makeup'" }
      ]
    }
  ];

  const quickTips = [
    {
      icon: <Zap className="h-5 w-5 text-yellow-400" />,
      title: "Pro Tip: Bulk Actions",
      description: "Use 'Mark All Present' for normal days, then individually mark absences to save time."
    },
    {
      icon: <Eye className="h-5 w-5 text-blue-400" />,
      title: "Visual Indicators",
      description: "Green = Present, Red = Absent, Gray = Unmarked. Colors help you quickly identify status."
    },
    {
      icon: <Calendar className="h-5 w-5 text-purple-400" />,
      title: "Calendar Navigation",
      description: "Use Time Machine controls to navigate between weeks and view historical data."
    },
    {
      icon: <BarChart3 className="h-5 w-5 text-green-400" />,
      title: "AI Insights",
      description: "Generate weekly reports for personalized study plans and academic recommendations."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur-lg border-b border-gray-700/50 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.back()}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </motion.button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Quick Reference</h1>
                  <p className="text-sm text-gray-400">Shortcuts and quick actions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Introduction */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-600/10 rounded-2xl p-8 border border-gray-700/50">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Quick Reference Guide
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Master EduTrack AI with these essential shortcuts and quick actions. Perfect for power users who want to maximize efficiency.
            </p>
          </div>
        </motion.section>

        {/* Quick Tips */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6 text-yellow-400">Quick Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickTips.map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {tip.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{tip.title}</h3>
                    <p className="text-gray-300 text-sm">{tip.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Keyboard Shortcuts and Actions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6 text-yellow-400">Actions & Shortcuts</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {shortcuts.map((section, sectionIndex) => (
              <motion.div
                key={sectionIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: sectionIndex * 0.1 }}
                className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700/50"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg">
                    {section.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white">{section.category}</h3>
                </div>
                <div className="space-y-4">
                  {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex flex-col space-y-1">
                      <div className="font-medium text-gray-200">{item.action}</div>
                      <div className="text-sm text-gray-400 bg-gray-700/30 px-3 py-1 rounded-lg font-mono">
                        {item.method}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Color Coding Reference */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6 text-yellow-400">Color Coding Reference</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
              <h3 className="font-semibold mb-4 text-white">Attendance Status</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300">Present</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-gray-300">Absent</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                  <span className="text-gray-300">Not Marked</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
              <h3 className="font-semibold mb-4 text-white">Subject Types</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <BookOpen className="h-4 w-4 text-blue-400" />
                  <span className="text-gray-300">Theory Classes</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Settings className="h-4 w-4 text-green-400" />
                  <span className="text-gray-300">Lab Sessions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-purple-400" />
                  <span className="text-gray-300">Training</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
              <h3 className="font-semibold mb-4 text-white">Priority Levels</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-gray-300">Critical (&lt; 75%)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-300">Warning (75-80%)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300">Good (&gt; 80%)</span>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Common Workflows */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6 text-yellow-400">Common Workflows</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-2xl p-6 border border-cyan-500/20">
              <h3 className="text-lg font-semibold mb-4 text-cyan-400">Daily Attendance Workflow</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <p className="text-gray-300">Open EduTrack AI dashboard</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <p className="text-gray-300">Review today's schedule</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <p className="text-gray-300">Click "Mark All Present" if attending all classes</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <p className="text-gray-300">Individually mark absent classes if any</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-sm font-bold">5</div>
                  <p className="text-gray-300">Check makeup alerts for missed classes</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 rounded-2xl p-6 border border-purple-500/20">
              <h3 className="text-lg font-semibold mb-4 text-purple-400">Weekly Review Workflow</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <p className="text-gray-300">Switch to Stats view</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <p className="text-gray-300">Review attendance percentages</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <p className="text-gray-300">Generate AI-enhanced reports</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <p className="text-gray-300">Read AI recommendations</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold">5</div>
                  <p className="text-gray-300">Plan makeup classes if needed</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Emergency Actions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-12"
        >
          <div className="bg-gradient-to-r from-red-500/10 to-orange-600/10 rounded-2xl p-8 border border-red-500/20">
            <h2 className="text-2xl font-bold mb-6 text-red-400">Emergency Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 text-white">Attendance Crisis (&lt; 75%)</h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>1. Check Makeup alerts immediately</li>
                  <li>2. Schedule all available makeup classes</li>
                  <li>3. Generate AI report for recovery plan</li>
                  <li>4. Contact academic advisor if needed</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-white">System Issues</h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>1. Refresh the page (Ctrl+R or Cmd+R)</li>
                  <li>2. Check internet connection</li>
                  <li>3. Clear browser cache if problems persist</li>
                  <li>4. Contact support if issues continue</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Support */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-12"
        >
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-600/10 rounded-2xl p-8 border border-gray-700/50 text-center">
            <h2 className="text-2xl font-bold mb-4 text-yellow-400">Need More Help?</h2>
            <p className="text-gray-300 mb-6">
              For detailed explanations and step-by-step guides, check out our comprehensive User Manual.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/user-manual')}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 rounded-lg font-semibold transition-colors mx-auto"
            >
              <BookOpen className="h-4 w-4" />
              <span>View User Manual</span>
            </motion.button>
          </div>
        </motion.section>

      </main>
    </div>
  );
};

export default QuickReferencePage;
