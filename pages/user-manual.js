import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
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

export default function UserManual() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
            <div className="container mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-4xl mx-auto"
                >
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
                            EduTrack AI User Manual
                        </h1>
                        <p className="text-gray-400 text-lg">
                            Complete guide to managing your attendance with AI-powered insights
                        </p>
                    </div>

                    {/* Content */}
                    <div className="space-y-12">
                        
                        {/* Getting Started Section */}
                        <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
                            <h2 className="text-3xl font-bold mb-6 text-cyan-400">Getting Started</h2>
                            
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-semibold mb-3 text-white">1. Setting Up Your Cycle Start Date</h3>
                                    <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
                                        <p className="text-gray-300 mb-3">
                                            The cycle start date determines when your attendance tracking begins and is crucial for accurate percentage calculations.
                                        </p>
                                        <div className="space-y-2 text-sm">
                                            <p className="text-cyan-400 font-medium">📅 How to set your cycle start date:</p>
                                            <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                                                <li><strong>Desktop:</strong> Click the "Cycle Start" button in the top navigation bar</li>
                                                <li><strong>Mobile:</strong> Open the hamburger menu (☰) and tap "Set Cycle Start Date"</li>
                                                <li><strong>Choose the date:</strong> Select the first day of your academic semester/term</li>
                                                <li><strong>Confirm:</strong> Click "Set Cycle Start Date" to save</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-4">
                                        <p className="text-amber-300 text-sm">
                                            <strong>Important:</strong> Set this to the actual first day of your academic semester. This affects all attendance percentage calculations and week-based features like makeup class scheduling.
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold mb-3 text-white">2. Initial Setup</h3>
                                    <p className="text-gray-300 mb-4">
                                        After logging in with your institutional account, EduTrack AI will automatically initialize your attendance tracking system.
                                    </p>
                                    <ul className="list-disc list-inside text-gray-300 space-y-2">
                                        <li>Your dashboard will display today's class schedule</li>
                                        <li>All subjects will show 0% attendance initially</li>
                                        <li>The system tracks 14 subjects: 7 regular classes, 3 lab sessions, and 4 training modules</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Core Features Section */}
                        <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
                            <h2 className="text-3xl font-bold mb-6 text-cyan-400">Core Features</h2>
                            
                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-xl font-semibold mb-4 text-white">📊 Attendance Tracking</h3>
                                    <div className="space-y-3 text-gray-300">
                                        <p><strong>Mark Present:</strong> Click the green checkmark (✓) on any class card</p>
                                        <p><strong>Mark Absent:</strong> Click the red X mark (✗) on any class card</p>
                                        <p><strong>Bulk Actions:</strong> Use "Mark All Present" or "Mark All Absent" buttons</p>
                                        <p><strong>Time Travel:</strong> Use date controls to mark attendance for past or future dates</p>
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="text-xl font-semibold mb-4 text-white">📈 Smart Analytics</h3>
                                    <div className="space-y-3 text-gray-300">
                                        <p><strong>Real-time Percentages:</strong> See attendance percentages update instantly</p>
                                        <p><strong>Subject Breakdown:</strong> Individual percentage for each subject</p>
                                        <p><strong>Risk Assessment:</strong> Subjects below 80% are flagged as "at risk"</p>
                                        <p><strong>Weekly Trends:</strong> Track your attendance patterns over time</p>
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="text-xl font-semibold mb-4 text-white">🎯 Makeup Classes</h3>
                                    <div className="space-y-3 text-gray-300">
                                        <p><strong>Automatic Detection:</strong> System alerts when makeup is needed</p>
                                        <p><strong>Smart Scheduling:</strong> Browse available makeup slots</p>
                                        <p><strong>Progress Tracking:</strong> Monitor makeup class completion</p>
                                        <p><strong>Multiple Makeups:</strong> Handle multiple subjects requiring makeup</p>
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="text-xl font-semibold mb-4 text-white">🏆 ECA Management</h3>
                                    <div className="space-y-3 text-gray-300">
                                        <p><strong>Activity Logging:</strong> Record extracurricular activities</p>
                                        <p><strong>Bonus Credits:</strong> ECA activities boost attendance percentages</p>
                                        <p><strong>Achievement Tracking:</strong> Monitor participation levels</p>
                                        <p><strong>Calendar Integration:</strong> View ECA activities in calendar view</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Advanced Features Section */}
                        <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
                            <h2 className="text-3xl font-bold mb-6 text-cyan-400">Advanced Features</h2>
                            
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-xl font-semibold mb-4 text-white">🤖 AI-Enhanced Weekly Reports</h3>
                                    <p className="text-gray-300 mb-4">
                                        Generate comprehensive weekly reports with AI-powered insights and recommendations.
                                    </p>
                                    <div className="bg-gray-700/50 rounded-lg p-4">
                                        <h4 className="text-cyan-400 font-medium mb-2">Report Features:</h4>
                                        <ul className="list-disc list-inside text-gray-300 space-y-1">
                                            <li>Detailed attendance breakdown by subject</li>
                                            <li>AI-generated study recommendations</li>
                                            <li>Risk assessment and recovery strategies</li>
                                            <li>Personalized academic advice</li>
                                            <li>Weekly progress comparison</li>
                                        </ul>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold mb-4 text-white">⚡ App Updates</h3>
                                    <p className="text-gray-300 mb-4">
                                        EduTrack AI automatically checks for updates to ensure you always have the latest features and improvements.
                                    </p>
                                    <div className="bg-gray-700/50 rounded-lg p-4">
                                        <h4 className="text-cyan-400 font-medium mb-2">Update Process:</h4>
                                        <ul className="list-disc list-inside text-gray-300 space-y-1">
                                            <li><strong>Automatic Detection:</strong> App checks for updates every 10 minutes</li>
                                            <li><strong>Manual Updates:</strong> Click "Update App" button in footer anytime</li>
                                            <li><strong>Notification:</strong> Orange "New version available!" alert when updates are ready</li>
                                            <li><strong>Safe Updates:</strong> Your data and login session are preserved during updates</li>
                                            <li><strong>Latest Version:</strong> Currently running version 1.0.5</li>
                                        </ul>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold mb-4 text-white">📱 Progressive Web App (PWA)</h3>
                                    <p className="text-gray-300 mb-4">
                                        Install EduTrack AI as a native app on your device for the best experience.
                                    </p>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="bg-gray-700/50 rounded-lg p-4">
                                            <h4 className="text-cyan-400 font-medium mb-2">Installation Benefits:</h4>
                                            <ul className="list-disc list-inside text-gray-300 space-y-1 text-sm">
                                                <li>Native app-like experience</li>
                                                <li>Faster loading times</li>
                                                <li>Offline functionality</li>
                                                <li>Home screen access</li>
                                                <li>Push notifications (future)</li>
                                            </ul>
                                        </div>
                                        <div className="bg-gray-700/50 rounded-lg p-4">
                                            <h4 className="text-cyan-400 font-medium mb-2">How to Install:</h4>
                                            <ul className="list-disc list-inside text-gray-300 space-y-1 text-sm">
                                                <li><strong>Desktop:</strong> Click "Install App" button</li>
                                                <li><strong>Mobile:</strong> Use "Add to Home Screen" option</li>
                                                <li><strong>Chrome:</strong> Look for install prompt in address bar</li>
                                                <li><strong>Safari:</strong> Share menu → "Add to Home Screen"</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Troubleshooting Section */}
                        <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
                            <h2 className="text-3xl font-bold mb-6 text-cyan-400">Troubleshooting & Support</h2>
                            
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-semibold mb-4 text-white">Common Issues</h3>
                                    <div className="space-y-4">
                                        <div className="bg-gray-700/50 rounded-lg p-4">
                                            <h4 className="text-amber-400 font-medium mb-2">Percentages showing as 100% or incorrect values</h4>
                                            <p className="text-gray-300 text-sm mb-2">
                                                This usually happens when the cycle start date is not properly set.
                                            </p>
                                            <p className="text-cyan-400 text-sm">
                                                <strong>Solution:</strong> Go to navigation menu → "Cycle Start" and set the correct semester start date.
                                            </p>
                                        </div>
                                        
                                        <div className="bg-gray-700/50 rounded-lg p-4">
                                            <h4 className="text-amber-400 font-medium mb-2">App not updating or showing old data</h4>
                                            <p className="text-gray-300 text-sm mb-2">
                                                Cache issues or pending app updates.
                                            </p>
                                            <p className="text-cyan-400 text-sm">
                                                <strong>Solution:</strong> Click "Update App" in footer, or refresh with Ctrl+Shift+R (hard refresh).
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold mb-4 text-white">Getting Help</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <h4 className="text-cyan-400 font-medium">In-App Help</h4>
                                            <ul className="list-disc list-inside text-gray-300 space-y-1 text-sm">
                                                <li>Help Center (footer)</li>
                                                <li>Quick Reference guide</li>
                                                <li>This User Manual</li>
                                            </ul>
                                        </div>
                                        <div className="space-y-3">
                                            <h4 className="text-cyan-400 font-medium">Contact Support</h4>
                                            <ul className="list-disc list-inside text-gray-300 space-y-1 text-sm">
                                                <li>Email: sumitbhagat2004@gmail.com</li>
                                                <li>GitHub Issues</li>
                                                <li>Feedback form (coming soon)</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Navigation */}
                        <div className="flex justify-center">
                            <Link 
                                href="/dashboard"
                                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                                ← Back to Dashboard
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
