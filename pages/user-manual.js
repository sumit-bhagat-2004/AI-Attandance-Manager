import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  BookOpen, 
  User, 
  Calendar,
  BarChart3,
  Bell,
  Settings,
  Plus,
  Eye,
  Download
} from 'lucide-react';
import { useRouter } from 'next/router';

const UserManualPage = () => {
  const router = useRouter();

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
                <div className="p-2 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">User Manual</h1>
                  <p className="text-sm text-gray-400">Complete guide to EduTrack AI</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="prose prose-gray prose-invert max-w-none">
          
          {/* Introduction */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <div className="bg-gradient-to-r from-cyan-500/10 to-purple-600/10 rounded-2xl p-8 border border-gray-700/50">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                EduTrack AI User Manual
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                Welcome to EduTrack AI, your intelligent companion for academic success. This comprehensive guide will help you master every feature and maximize your learning potential.
              </p>
            </div>
          </motion.section>

          {/* Table of Contents */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-6 text-cyan-400">Table of Contents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                <h3 className="font-semibold mb-3 text-purple-400">Getting Started</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#account-setup" className="text-gray-300 hover:text-cyan-400 transition-colors">Account Setup</a></li>
                  <li><a href="#dashboard-overview" className="text-gray-300 hover:text-cyan-400 transition-colors">Dashboard Overview</a></li>
                  <li><a href="#navigation" className="text-gray-300 hover:text-cyan-400 transition-colors">Navigation Guide</a></li>
                </ul>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                <h3 className="font-semibold mb-3 text-purple-400">Core Features</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#attendance-tracking" className="text-gray-300 hover:text-cyan-400 transition-colors">Attendance Tracking</a></li>
                  <li><a href="#schedule-management" className="text-gray-300 hover:text-cyan-400 transition-colors">Schedule Management</a></li>
                  <li><a href="#makeup-classes" className="text-gray-300 hover:text-cyan-400 transition-colors">Makeup Classes</a></li>
                </ul>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                <h3 className="font-semibold mb-3 text-purple-400">Advanced Features</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#ai-reports" className="text-gray-300 hover:text-cyan-400 transition-colors">AI-Enhanced Reports</a></li>
                  <li><a href="#eca-management" className="text-gray-300 hover:text-cyan-400 transition-colors">ECA Management</a></li>
                  <li><a href="#analytics" className="text-gray-300 hover:text-cyan-400 transition-colors">Analytics & Stats</a></li>
                </ul>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                <h3 className="font-semibold mb-3 text-purple-400">Tips & Troubleshooting</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#best-practices" className="text-gray-300 hover:text-cyan-400 transition-colors">Best Practices</a></li>
                  <li><a href="#troubleshooting" className="text-gray-300 hover:text-cyan-400 transition-colors">Troubleshooting</a></li>
                  <li><a href="#faq" className="text-gray-300 hover:text-cyan-400 transition-colors">FAQ</a></li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Account Setup */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            id="account-setup"
            className="mb-12"
          >
            <h2 className="text-3xl font-bold mb-6 text-cyan-400">Getting Started</h2>
            
            <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700/50 mb-8">
              <h3 className="text-xl font-semibold mb-4 text-purple-400">Account Setup</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <h4 className="font-semibold">Sign Up with Clerk</h4>
                    <p className="text-gray-300">Create your account using your email or social login. Your data is securely managed by Clerk authentication.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <h4 className="font-semibold">Profile Setup</h4>
                    <p className="text-gray-300">Complete your profile with your name and profile picture. This information helps personalize your experience.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <h4 className="font-semibold">Initial Data Import</h4>
                    <p className="text-gray-300">Your attendance data will be automatically initialized. The system will create your personal attendance database.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Dashboard Overview */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            id="dashboard-overview"
            className="mb-12"
          >
            <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700/50">
              <h3 className="text-xl font-semibold mb-4 text-purple-400">Dashboard Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-cyan-400" />
                    <div>
                      <h4 className="font-semibold">Schedule View</h4>
                      <p className="text-sm text-gray-300">Daily class schedule with attendance tracking</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="h-5 w-5 text-green-400" />
                    <div>
                      <h4 className="font-semibold">Statistics Panel</h4>
                      <p className="text-sm text-gray-300">Real-time attendance statistics and insights</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Bell className="h-5 w-5 text-orange-400" />
                    <div>
                      <h4 className="font-semibold">Makeup Alerts</h4>
                      <p className="text-sm text-gray-300">Notifications for required makeup classes</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-purple-400" />
                    <div>
                      <h4 className="font-semibold">Profile Section</h4>
                      <p className="text-sm text-gray-300">User information and quick settings access</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Plus className="h-5 w-5 text-blue-400" />
                    <div>
                      <h4 className="font-semibold">Quick Actions</h4>
                      <p className="text-sm text-gray-300">Add ECA activities and generate reports</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Settings className="h-5 w-5 text-gray-400" />
                    <div>
                      <h4 className="font-semibold">Time Machine</h4>
                      <p className="text-sm text-gray-300">Navigate through different dates and semesters</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Core Features */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            id="attendance-tracking"
            className="mb-12"
          >
            <h2 className="text-3xl font-bold mb-6 text-cyan-400">Core Features</h2>
            
            <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700/50 mb-8">
              <h3 className="text-xl font-semibold mb-4 text-purple-400">Attendance Tracking</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Marking Attendance</h4>
                  <p className="text-gray-300 mb-3">Click on any class in your schedule to mark attendance:</p>
                  <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                    <li><span className="text-green-400 font-semibold">Green</span> - Present</li>
                    <li><span className="text-red-400 font-semibold">Red</span> - Absent</li>
                    <li><span className="text-gray-400 font-semibold">Gray</span> - Not marked</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Bulk Operations</h4>
                  <p className="text-gray-300">Use the "Mark All Present" or "Mark All Absent" buttons for quick updates across all classes for a day.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Attendance History</h4>
                  <p className="text-gray-300">View your complete attendance history in the Calendar view, with visual indicators for each day's performance.</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700/50 mb-8" id="schedule-management">
              <h3 className="text-xl font-semibold mb-4 text-purple-400">Schedule Management</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Daily Schedule</h4>
                  <p className="text-gray-300">Your daily class schedule is automatically populated with all subjects including:</p>
                  <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4 mt-2">
                    <li>Regular theory classes</li>
                    <li>Laboratory sessions</li>
                    <li>Training sessions</li>
                    <li>Special events</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Weekly Overview</h4>
                  <p className="text-gray-300">Navigate between different weeks using the date controls. The system maintains your schedule across the entire semester.</p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* AI Reports */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            id="ai-reports"
            className="mb-12"
          >
            <h2 className="text-3xl font-bold mb-6 text-cyan-400">Advanced Features</h2>
            
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-500/20 mb-8">
              <h3 className="text-xl font-semibold mb-4 text-purple-400">AI-Enhanced Reports</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Weekly Reports Generation</h4>
                  <p className="text-gray-300 mb-3">Click the "AI-Enhanced Weekly Reports & Study Plans" button to generate comprehensive reports that include:</p>
                  <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                    <li>Detailed attendance analysis for each subject</li>
                    <li>Personalized study recommendations</li>
                    <li>Attendance improvement strategies</li>
                    <li>Motivational content and goal setting</li>
                    <li>Resource recommendations</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">AI-Powered Insights</h4>
                  <p className="text-gray-300">Each report is enhanced with artificial intelligence to provide:</p>
                  <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                    <li>Subject-specific recovery plans</li>
                    <li>Time management strategies</li>
                    <li>Academic performance predictions</li>
                    <li>Personalized motivation techniques</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Best Practices */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            id="best-practices"
            className="mb-12"
          >
            <h2 className="text-3xl font-bold mb-6 text-cyan-400">Tips & Best Practices</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-500/10 rounded-2xl p-6 border border-green-500/20">
                <h3 className="text-xl font-semibold mb-4 text-green-400">Do's</h3>
                <ul className="space-y-3 text-gray-300">
                  <li>✅ Mark attendance daily for accurate tracking</li>
                  <li>✅ Review weekly reports regularly</li>
                  <li>✅ Set up makeup classes promptly</li>
                  <li>✅ Use the calendar view for planning</li>
                  <li>✅ Add ECA activities to showcase achievements</li>
                </ul>
              </div>
              <div className="bg-red-500/10 rounded-2xl p-6 border border-red-500/20">
                <h3 className="text-xl font-semibold mb-4 text-red-400">Don'ts</h3>
                <ul className="space-y-3 text-gray-300">
                  <li>❌ Don't forget to mark attendance after classes</li>
                  <li>❌ Don't ignore makeup class notifications</li>
                  <li>❌ Don't rely solely on manual calculations</li>
                  <li>❌ Don't skip reviewing AI recommendations</li>
                  <li>❌ Don't hesitate to use the help features</li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* FAQ */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            id="faq"
            className="mb-12"
          >
            <h2 className="text-3xl font-bold mb-6 text-cyan-400">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                <h4 className="font-semibold mb-2 text-purple-400">How accurate are the AI recommendations?</h4>
                <p className="text-gray-300">The AI analyzes your attendance patterns, subject performance, and academic trends to provide personalized recommendations. While highly accurate, always consult with your academic advisors for important decisions.</p>
              </div>
              <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                <h4 className="font-semibold mb-2 text-purple-400">Can I export my data?</h4>
                <p className="text-gray-300">Yes, you can export your attendance reports and data through the Reports section. This is useful for sharing with advisors or keeping personal records.</p>
              </div>
              <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                <h4 className="font-semibold mb-2 text-purple-400">What if I make a mistake in marking attendance?</h4>
                <p className="text-gray-300">You can easily correct attendance by clicking on the class again and selecting the correct status. The system maintains a history of changes for accuracy.</p>
              </div>
              <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                <h4 className="font-semibold mb-2 text-purple-400">How do makeup classes work?</h4>
                <p className="text-gray-300">When you miss classes, the system automatically suggests makeup opportunities. You can schedule and track makeup classes to maintain your attendance requirements.</p>
              </div>
            </div>
          </motion.section>

          {/* Support */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mb-12"
          >
            <div className="bg-gradient-to-r from-cyan-500/10 to-purple-600/10 rounded-2xl p-8 border border-gray-700/50 text-center">
              <h2 className="text-2xl font-bold mb-4 text-cyan-400">Need Additional Help?</h2>
              <p className="text-gray-300 mb-6">
                If you need further assistance, check out our Quick Reference guide or contact our support team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/quick-reference')}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  <span>Quick Reference</span>
                </motion.button>
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="mailto:support@edutrack-ai.com"
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Contact Support</span>
                </motion.a>
              </div>
            </div>
          </motion.section>

        </div>
      </main>
    </div>
  );
};

export default UserManualPage;
