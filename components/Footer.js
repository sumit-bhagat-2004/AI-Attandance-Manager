import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { Heart, Github, Mail, RefreshCw, AlertCircle, ExternalLink, BookOpen, FileText, Calendar, Settings } from 'lucide-react';
import HelpModal from './HelpModal';
import { useRouter } from 'next/router';

const PolicyModal = memo(({ title, content, isOpen, onClose }) => {
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-gray-900/95 backdrop-blur-md border border-gray-700 rounded-2xl p-8 max-w-4xl max-h-[80vh] overflow-y-auto w-full shadow-2xl"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-white">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
                    >
                        ✕
                    </button>
                </div>
                <div 
                    className="text-gray-300 leading-relaxed prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: content }}
                />
            </motion.div>
        </div>
    );
});

export default function Footer() {
    const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
    const [policyModal, setPolicyModal] = useState({ type: null, isOpen: false });
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [serviceWorker, setServiceWorker] = useState(null);
    const router = useRouter();

    // PWA Update Detection
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then((registration) => {
                setServiceWorker(registration);
                
                // Listen for new service worker
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                setUpdateAvailable(true);
                            }
                        });
                    }
                });

                // Check for updates immediately
                registration.update();
                
                // Set up periodic update checks
                const updateInterval = setInterval(() => {
                    registration.update();
                }, 10 * 60 * 1000); // Check every 10 minutes
                
                return () => clearInterval(updateInterval);
            });

            // Listen for messages from service worker
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
                    setUpdateAvailable(true);
                }
            });
        }
    }, []);

    const handlePWAUpdate = useCallback(async () => {
        if (!serviceWorker) return;
        
        setIsUpdating(true);
        
        try {
            // Clear app caches (but not Clerk auth)
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                const appCacheNames = cacheNames.filter(name => 
                    name.includes('edutrack-ai') && !name.includes('clerk')
                );
                
                await Promise.all(
                    appCacheNames.map(name => caches.delete(name))
                );
            }
            
            // Tell service worker to skip waiting
            if (serviceWorker.waiting) {
                serviceWorker.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
            
            // Reload the page
            setTimeout(() => {
                window.location.reload();
            }, 500);
            
        } catch (error) {
            console.error('Update failed:', error);
            setIsUpdating(false);
        }
    }, [serviceWorker]);

    const openPolicyModal = useCallback((type) => {
        setPolicyModal({ type, isOpen: true });
    }, []);

    const closePolicyModal = useCallback(() => {
        setPolicyModal({ type: null, isOpen: false });
    }, []);

    // Privacy Policy content
    const privacyPolicyContent = useMemo(() => `
        <h3>Data Collection</h3>
        <p>EduTrack AI collects attendance data, academic records, and usage analytics to provide personalized attendance tracking and recommendations.</p>
        
        <h3>Data Usage</h3>
        <p>Your data is used exclusively for:</p>
        <ul>
            <li>Attendance tracking and percentage calculations</li>
            <li>AI-powered academic recommendations</li>
            <li>Progress analytics and reporting</li>
            <li>Makeup class scheduling</li>
        </ul>
        
        <h3>Data Storage</h3>
        <p>All data is securely stored using MongoDB Atlas with enterprise-grade encryption. Data is not shared with third parties.</p>
        
        <h3>User Rights</h3>
        <p>You have the right to:</p>
        <ul>
            <li>Access your personal data</li>
            <li>Request data correction or deletion</li>
            <li>Export your attendance records</li>
            <li>Opt-out of analytics</li>
        </ul>
        
        <h3>Contact</h3>
        <p>For privacy concerns, contact: privacy@edutrack-ai.com</p>
    `, []);

    // Terms & Conditions content
    const termsContent = useMemo(() => `
        <h3>Service Description</h3>
        <p>EduTrack AI is an attendance management system designed for educational institutions and students.</p>
        
        <h3>User Responsibilities</h3>
        <ul>
            <li>Provide accurate attendance information</li>
            <li>Use the service in compliance with your institution's policies</li>
            <li>Maintain account security</li>
            <li>Report any technical issues promptly</li>
        </ul>
        
        <h3>Service Limitations</h3>
        <p>EduTrack AI is provided "as is" without warranties. We are not responsible for:</p>
        <ul>
            <li>Academic decisions based on attendance data</li>
            <li>Technical interruptions or data loss</li>
            <li>Compatibility with all devices or browsers</li>
        </ul>
        
        <h3>Intellectual Property</h3>
        <p>All content, features, and functionality are owned by EduTrack AI and protected by copyright laws.</p>
        
        <h3>Termination</h3>
        <p>We reserve the right to suspend or terminate accounts that violate these terms or engage in misuse.</p>
        
        <h3>Governing Law</h3>
        <p>These terms are governed by applicable local laws and regulations.</p>
    `, []);

    return (
        <>
            <footer className="bg-gray-900/80 backdrop-blur-md border-t border-gray-700 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Brand Section */}
                        <div className="lg:col-span-1">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center">
                                        <span className="text-white font-bold text-lg">E</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white">EduTrack AI</h3>
                                </div>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Smart attendance tracking with AI-powered insights for academic success.
                                </p>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-green-400 text-sm font-medium">System Online</span>
                                </div>
                            </motion.div>
                        </div>

                        {/* Help & Support */}
                        <div className="space-y-4">
                            <h4 className="text-white font-semibold text-lg">Help & Support</h4>
                            <nav className="space-y-3">
                                <ul className="space-y-2">
                                    <li>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setIsHelpModalOpen(true)}
                                            className="flex items-center space-x-2 text-gray-400 hover:text-cyan-400 transition-colors text-sm"
                                        >
                                            <BookOpen className="h-4 w-4" />
                                            <span>Help Center</span>
                                        </motion.button>
                                    </li>
                                    <li>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => router.push('/user-manual')}
                                            className="flex items-center space-x-2 text-gray-400 hover:text-cyan-400 transition-colors text-sm"
                                        >
                                            <FileText className="h-4 w-4" />
                                            <span>User Manual</span>
                                        </motion.button>
                                    </li>
                                    <li>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => router.push('/quick-reference')}
                                            className="flex items-center space-x-2 text-gray-400 hover:text-cyan-400 transition-colors text-sm"
                                        >
                                            <Calendar className="h-4 w-4" />
                                            <span>Quick Reference</span>
                                        </motion.button>
                                    </li>
                                </ul>
                            </nav>
                        </div>

                        {/* Legal */}
                        <div className="space-y-4">
                            <h4 className="text-white font-semibold text-lg">Legal</h4>
                            <nav className="space-y-3">
                                <ul className="space-y-2">
                                    <li>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => openPolicyModal('privacy')}
                                            className="text-gray-400 hover:text-cyan-400 transition-colors text-sm"
                                        >
                                            Privacy Policy
                                        </motion.button>
                                    </li>
                                    <li>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => openPolicyModal('terms')}
                                            className="text-gray-400 hover:text-cyan-400 transition-colors text-sm"
                                        >
                                            Terms & Conditions
                                        </motion.button>
                                    </li>
                                </ul>
                            </nav>
                        </div>

                        {/* App Info & Update */}
                        <div className="space-y-4">
                            <h4 className="text-white font-semibold text-lg">App Info</h4>
                            <div className="space-y-3">
                                <div className="text-sm text-gray-400">
                                    <p>Version 1.0.5</p>
                                    <p>Built with Next.js & MongoDB</p>
                                </div>
                                
                                {/* Permanent Update Button */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handlePWAUpdate}
                                    disabled={isUpdating}
                                    className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors font-medium text-sm"
                                >
                                    {isUpdating ? (
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <RefreshCw className="h-4 w-4" />
                                    )}
                                    <span>{isUpdating ? 'Updating...' : 'Update App'}</span>
                                </motion.button>

                                {/* Dynamic Update Notification */}
                                {updateAvailable && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center space-x-2 text-orange-400 text-sm"
                                    >
                                        <AlertCircle className="h-4 w-4" />
                                        <span>New version available!</span>
                                    </motion.div>
                                )}

                                <div className="flex space-x-3">
                                    <a
                                        href="https://github.com/sumit-bhagat-2004/AI-Attandance-Manager"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-400 hover:text-white transition-colors"
                                    >
                                        <Github className="h-5 w-5" />
                                    </a>
                                    <a
                                        href="mailto:sumitbhagat2004@gmail.com"
                                        className="text-gray-400 hover:text-white transition-colors"
                                    >
                                        <Mail className="h-5 w-5" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="mt-12 pt-8 border-t border-gray-700">
                        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                            <p className="text-gray-400 text-sm">
                                © 2025 EduTrack AI. All rights reserved.
                            </p>
                            <div className="flex items-center space-x-2 text-sm text-gray-400">
                                <Heart className="h-4 w-4 text-red-500" />
                                <span>Made with ❤️ for students everywhere</span>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Help Modal */}
            {isHelpModalOpen && (
                <HelpModal 
                    isOpen={isHelpModalOpen} 
                    onClose={() => setIsHelpModalOpen(false)} 
                />
            )}

            {/* Policy Modals */}
            <PolicyModal
                title="Privacy Policy"
                content={privacyPolicyContent}
                isOpen={policyModal.type === 'privacy' && policyModal.isOpen}
                onClose={closePolicyModal}
            />

            <PolicyModal
                title="Terms & Conditions"
                content={termsContent}
                isOpen={policyModal.type === 'terms' && policyModal.isOpen}
                onClose={closePolicyModal}
            />
        </>
    );
}
