import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, 
  X, 
  BookOpen, 
  Calendar, 
  BarChart3, 
  RefreshCw, 
  Settings,
  Download,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

const HelpModal = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const helpSections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: BookOpen,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Welcome to AI Attendance Manager!</h3>
          <div className="space-y-3 text-gray-300">
            <p>Follow these simple steps to get started:</p>
            <ol className="list-decimal list-inside space-y-2 ml-4 text-sm sm:text-base">
              <li>Your account is already created and you're logged in</li>
              <li>View today's classes on the main dashboard</li>
              <li>Mark attendance by clicking ✓ (Present) or ✗ (Absent)</li>
              <li>Check your stats in the "Stats" section</li>
              <li>Use makeup classes to improve your attendance</li>
            </ol>
          </div>
        </div>
      )
    },
    {
      id: 'attendance',
      title: 'Managing Attendance',
      icon: Calendar,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Attendance System</h3>
          <div className="space-y-4 text-gray-300 text-sm sm:text-base">
            <div>
              <h4 className="font-medium text-white mb-2">Status Colors:</h4>
              <ul className="space-y-2 ml-4">
                <li className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span>Green - Present/Attended</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  <span>Red - Absent/Missed</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                  <span>Yellow - Pending</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                  <span>Blue - Makeup Scheduled</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">How to Mark:</h4>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Click on any class card</li>
                <li>Choose ✓ for present or ✗ for absent</li>
                <li>Your attendance percentage updates automatically</li>
              </ol>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'stats',
      title: 'Statistics & Reports',
      icon: BarChart3,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Understanding Your Stats</h3>
          <div className="space-y-4 text-gray-300 text-sm sm:text-base">
            <div>
              <h4 className="font-medium text-white mb-2">Overall Attendance:</h4>
              <p>Calculated as (Classes Attended ÷ Total Classes) × 100</p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Subject-wise Stats:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>View individual subject performance</li>
                <li>Identify subjects needing attention</li>
                <li>Track improvement over time</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Grade Scale:</h4>
              <ul className="space-y-1 ml-4">
                <li>A+: 90%+ attendance</li>
                <li>A: 85-89%</li>
                <li>B+: 80-84%</li>
                <li>B: 75-79%</li>
                <li>C: 65-74%</li>
                <li>F: Below 65%</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'makeup',
      title: 'Makeup Classes',
      icon: RefreshCw,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Makeup System</h3>
          <div className="space-y-4 text-gray-300 text-sm sm:text-base">
            <div>
              <h4 className="font-medium text-white mb-2">How It Works:</h4>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>When you miss a mandatory class, it's flagged for makeup</li>
                <li>Use the "Makeup" section to view missed classes</li>
                <li>Select available bunk classes to make up</li>
                <li>Attend the selected class to recover attendance</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Class Types:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Mandatory:</strong> Must attend, affects percentage</li>
                <li><strong>Bunk:</strong> Optional, can be used for makeup</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'ai-features',
      title: 'AI Features',
      icon: Sparkles,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">AI-Powered Tools</h3>
          <div className="space-y-4 text-gray-300 text-sm sm:text-base">
            <div>
              <h4 className="font-medium text-white mb-2">Study Materials:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>AI-generated study content for your subjects</li>
                <li>Personalized based on your curriculum</li>
                <li>Covers key topics and concepts</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Smart Recommendations:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Optimal attendance strategies</li>
                <li>Subject-specific improvement tips</li>
                <li>Makeup class suggestions</li>
              </ul>
            </div>
          </div>
        </div>
      )
    }
  ];

  const faqs = [
    {
      question: "How is my attendance percentage calculated?",
      answer: "Your attendance percentage is calculated as (Classes Attended ÷ Total Mandatory Classes) × 100. Bunk classes don't count against you if missed, but count positively if attended for makeup."
    },
    {
      question: "What happens if I miss a mandatory class?",
      answer: "If you miss a mandatory class, the system will flag it for makeup. You can then attend any available bunk class to make up for the missed attendance."
    },
    {
      question: "Can I edit attendance for past dates?",
      answer: "Yes, you can modify attendance for previous dates if needed for corrections. Simply click on the class card and update the status."
    },
    {
      question: "How do I improve my attendance percentage?",
      answer: "You can improve your percentage by: 1) Attending upcoming mandatory classes, 2) Completing makeup classes for previously missed mandatory classes, 3) Attending additional bunk classes."
    },
    {
      question: "Are the AI-generated materials accurate?",
      answer: "The AI uses advanced language models and is generally very accurate. However, always verify important information with your course materials and instructors."
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700 flex-shrink-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-white">Help & Documentation</h2>
                  <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">Get help with using AI Attendance Manager</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              </button>
            </div>

            {/* Mobile Layout */}
            <div className="md:hidden flex flex-col flex-1 min-h-0">
              <div className="p-4 border-b border-gray-700 flex-shrink-0">
                <select
                  value={activeSection}
                  onChange={(e) => setActiveSection(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                >
                  {helpSections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.title}
                    </option>
                  ))}
                  <option value="faq">FAQ</option>
                </select>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto">
                {activeSection === 'faq' ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Frequently Asked Questions</h3>
                    {faqs.map((faq, index) => (
                      <div key={index} className="border border-gray-700 rounded-lg">
                        <button
                          onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                          className="w-full flex items-start justify-between p-4 text-left hover:bg-gray-800/50 transition-colors"
                        >
                          <span className="text-gray-200 font-medium text-sm pr-2">{faq.question}</span>
                          {expandedFaq === index ? (
                            <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                          )}
                        </button>
                        <AnimatePresence>
                          {expandedFaq === index && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 pt-0 text-gray-400 text-sm">
                                {faq.answer}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                    
                    {/* Mobile Quick Links */}
                    <div className="mt-6 pt-6 border-t border-gray-700">
                      <h4 className="text-sm font-medium text-gray-400 mb-3">Documentation</h4>
                      <div className="space-y-2">
                        <a
                          href="/USER_MANUAL.md"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm"
                        >
                          <BookOpen className="w-4 h-4 text-cyan-400" />
                          <span className="text-gray-300">Full User Manual</span>
                          <ExternalLink className="w-3 h-3 text-gray-500 ml-auto" />
                        </a>
                        <a
                          href="/QUICK_REFERENCE.md"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm"
                        >
                          <Download className="w-4 h-4 text-cyan-400" />
                          <span className="text-gray-300">Quick Reference</span>
                          <ExternalLink className="w-3 h-3 text-gray-500 ml-auto" />
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  helpSections.find(s => s.id === activeSection)?.content
                )}
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex flex-1 min-h-0">
              {/* Sidebar */}
              <div className="w-80 border-r border-gray-700 p-4 overflow-y-auto flex-shrink-0">
                <nav className="space-y-2">
                  {helpSections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left text-sm ${
                          activeSection === section.id
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                            : 'hover:bg-gray-800 text-gray-300'
                        }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span>{section.title}</span>
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setActiveSection('faq')}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left text-sm ${
                      activeSection === 'faq'
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'hover:bg-gray-800 text-gray-300'
                    }`}
                  >
                    <Settings className="w-4 h-4 flex-shrink-0" />
                    <span>FAQ</span>
                  </button>
                </nav>

                {/* Quick Links */}
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Documentation</h3>
                  <div className="space-y-2">
                    <a
                      href="/USER_MANUAL.md"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded-lg transition-colors text-sm"
                    >
                      <BookOpen className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <span className="text-gray-300">Full Manual</span>
                      <ExternalLink className="w-3 h-3 text-gray-500 flex-shrink-0" />
                    </a>
                    <a
                      href="/QUICK_REFERENCE.md"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded-lg transition-colors text-sm"
                    >
                      <Download className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <span className="text-gray-300">Quick Reference</span>
                      <ExternalLink className="w-3 h-3 text-gray-500 flex-shrink-0" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                {activeSection === 'faq' ? (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white mb-6">Frequently Asked Questions</h3>
                    {faqs.map((faq, index) => (
                      <div key={index} className="border border-gray-700 rounded-lg">
                        <button
                          onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-800/50 transition-colors"
                        >
                          <span className="text-gray-200 font-medium">{faq.question}</span>
                          {expandedFaq === index ? (
                            <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          )}
                        </button>
                        <AnimatePresence>
                          {expandedFaq === index && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 pt-0 text-gray-400">
                                {faq.answer}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                ) : (
                  helpSections.find(s => s.id === activeSection)?.content
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-800/50 border-t border-gray-700 text-center flex-shrink-0">
              <p className="text-xs sm:text-sm text-gray-400">
                Need more help? Check the full documentation or contact support through the app.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HelpModal;
