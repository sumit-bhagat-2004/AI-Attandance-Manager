import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { 
  HelpCircle, 
  Shield, 
  FileText, 
  ExternalLink,
  BookOpen,
  Download,
  Mail,
  Github,
  Heart,
  X,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import HelpModal from './HelpModal';

// Memoized PolicyModal component to prevent constant re-rendering
const PolicyModal = React.memo(({ isOpen, onClose, title, content }) => (
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
          className="bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700 flex-shrink-0">
            <h2 className="text-lg sm:text-xl font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
            <div 
              className="prose prose-gray prose-invert max-w-none text-gray-300"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
));

PolicyModal.displayName = 'PolicyModal';

const Footer = () => {
  const router = useRouter();
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [serviceWorker, setServiceWorker] = useState(null);

  // Check for PWA updates
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then((registration) => {
          setServiceWorker(registration);
          
          // Check for updates on load
          registration.update();
          
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

          // Listen for waiting service worker
          if (registration.waiting) {
            setUpdateAvailable(true);
          }
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });

      // Listen for service worker messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_UPDATED') {
          setUpdateAvailable(true);
        }
      });

      // Periodic update check (every 10 minutes)
      const updateInterval = setInterval(() => {
        navigator.serviceWorker.ready.then((registration) => {
          registration.update();
        });
      }, 10 * 60 * 1000);

      return () => clearInterval(updateInterval);
    }
  }, []);

  // Handle PWA update
  const handlePWAUpdate = useCallback(async () => {
    if (!serviceWorker || !updateAvailable) return;

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

      // Skip waiting and activate new service worker
      if (serviceWorker.waiting) {
        serviceWorker.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

      // Wait for the new service worker to take control
      await new Promise((resolve) => {
        navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true });
      });

      // Reload the page to get the updated app
      window.location.reload();
      
    } catch (error) {
      console.error('Error updating PWA:', error);
      setIsUpdating(false);
    }
  }, [serviceWorker, updateAvailable]);

  const handleCloseHelpModal = useCallback(() => setShowHelpModal(false), []);
  const handleClosePrivacyModal = useCallback(() => setShowPrivacyModal(false), []);
  const handleCloseTermsModal = useCallback(() => setShowTermsModal(false), []);

  const handleOpenHelpModal = useCallback(() => setShowHelpModal(true), []);
  const handleOpenPrivacyModal = useCallback(() => setShowPrivacyModal(true), []);
  const handleOpenTermsModal = useCallback(() => setShowTermsModal(true), []);

  const handleNavigateToUserManual = useCallback(() => {
    router.push('/user-manual');
  }, [router]);

  const handleNavigateToQuickReference = useCallback(() => {
    router.push('/quick-reference');
  }, [router]);

  const privacyPolicyContent = useMemo(() => 
    '<h3 style="color: white; margin-bottom: 1rem;">Privacy Policy for AI Attendance Manager</h3><p><strong>Effective Date:</strong> July 21, 2025</p><h4 style="color: #60A5FA; margin: 1.5rem 0 0.5rem 0;">1. Information We Collect</h4><p>We collect the following types of information:</p><ul><li><strong>Account Information:</strong> Username, email, and profile data</li><li><strong>Attendance Data:</strong> Class attendance records, makeup schedules</li><li><strong>Academic Information:</strong> Subject enrollment, grades, ECA activities</li><li><strong>Usage Data:</strong> App usage patterns and preferences</li></ul><h4 style="color: #60A5FA; margin: 1.5rem 0 0.5rem 0;">2. How We Use Your Information</h4><ul><li>Track and manage your attendance records</li><li>Generate personalized reports and insights</li><li>Provide AI-powered study recommendations</li><li>Improve app functionality and user experience</li></ul><h4 style="color: #60A5FA; margin: 1.5rem 0 0.5rem 0;">3. Data Storage and Security</h4><p>Your data is securely stored using MongoDB Atlas with industry-standard encryption. We implement multiple security measures:</p><ul><li>Encrypted data transmission (HTTPS)</li><li>Secure database access controls</li><li>Regular security audits and updates</li><li>Limited access to authorized personnel only</li></ul><h4 style="color: #60A5FA; margin: 1.5rem 0 0.5rem 0;">4. Data Sharing</h4><p>We do not sell, trade, or share your personal information with third parties except:</p><ul><li>With your explicit consent</li><li>To comply with legal obligations</li><li>To protect our rights and safety</li></ul><h4 style="color: #60A5FA; margin: 1.5rem 0 0.5rem 0;">5. Your Rights</h4><p>You have the right to:</p><ul><li>Access your personal data</li><li>Request data corrections</li><li>Delete your account and data</li><li>Export your data</li></ul><h4 style="color: #60A5FA; margin: 1.5rem 0 0.5rem 0;">6. Contact Us</h4><p>For privacy concerns, contact us through the app\'s support system or email us at <strong>privacy@edutrack-ai.com</strong></p>', 
    []
  );

  const termsConditionsContent = useMemo(() => 
    '<h3 style="color: white; margin-bottom: 1rem;">Terms and Conditions for AI Attendance Manager</h3><p><strong>Effective Date:</strong> July 21, 2025</p><h4 style="color: #60A5FA; margin: 1.5rem 0 0.5rem 0;">1. Acceptance of Terms</h4><p>By using AI Attendance Manager ("the App"), you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the App.</p><h4 style="color: #60A5FA; margin: 1.5rem 0 0.5rem 0;">2. Description of Service</h4><p>AI Attendance Manager is an educational tool designed to:</p><ul><li>Track student attendance records</li><li>Provide attendance analytics and insights</li><li>Generate AI-powered study recommendations</li><li>Manage makeup classes and ECA activities</li></ul><h4 style="color: #60A5FA; margin: 1.5rem 0 0.5rem 0;">3. User Responsibilities</h4><p>Users must:</p><ul><li>Provide accurate attendance information</li><li>Keep login credentials secure</li><li>Use the App only for educational purposes</li><li>Not attempt to hack or manipulate the system</li><li>Respect other users and maintain appropriate conduct</li></ul><h4 style="color: #60A5FA; margin: 1.5rem 0 0.5rem 0;">4. Prohibited Uses</h4><p>You may not:</p><ul><li>Use the App for any illegal activities</li><li>Share false or misleading attendance data</li><li>Attempt to access other users\' data</li><li>Reverse engineer or copy the App\'s code</li><li>Use automated systems to access the App</li></ul><h4 style="color: #60A5FA; margin: 1.5rem 0 0.5rem 0;">5. Data Accuracy</h4><p>While we strive for accuracy, the App is provided "as is." Users are responsible for:</p><ul><li>Verifying attendance data accuracy</li><li>Cross-checking AI recommendations with official sources</li><li>Consulting with academic advisors for important decisions</li></ul><h4 style="color: #60A5FA; margin: 1.5rem 0 0.5rem 0;">6. Limitation of Liability</h4><p>The App developers are not liable for:</p><ul><li>Academic decisions based on App recommendations</li><li>Data loss due to technical issues</li><li>Indirect or consequential damages</li></ul><h4 style="color: #60A5FA; margin: 1.5rem 0 0.5rem 0;">7. Service Availability</h4><p>We aim to provide 99.9% uptime but cannot guarantee uninterrupted service. Maintenance windows will be announced in advance when possible.</p><h4 style="color: #60A5FA; margin: 1.5rem 0 0.5rem 0;">8. Changes to Terms</h4><p>We reserve the right to modify these terms at any time. Users will be notified of significant changes via the App.</p><h4 style="color: #60A5FA; margin: 1.5rem 0 0.5rem 0;">9. Termination</h4><p>We may terminate accounts for violations of these terms. Users may delete their accounts at any time through the App settings.</p><h4 style="color: #60A5FA; margin: 1.5rem 0 0.5rem 0;">10. Contact Information</h4><p>For questions about these terms, contact us at <strong>terms@edutrack-ai.com</strong> or through the App\'s support system.</p>', 
    []
  );

  return (
    <>
      <footer className="mt-12 bg-gray-900/50 backdrop-blur-lg border-t border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              <div className="col-span-1 lg:col-span-1">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    EduTrack AI
                  </span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Smart attendance management with AI-powered insights for academic success.
                </p>
                <div className="flex items-center space-x-4 mt-4">
                  <motion.a
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    href="https://github.com/sumit-bhagat-2004/AI-Attandance-Manager"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <Github className="h-5 w-5" />
                  </motion.a>
                  <motion.a
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    href="mailto:support@edutrack-ai.com"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <Mail className="h-5 w-5" />
                  </motion.a>
                </div>
              </div>

              <div className="col-span-1">
                <h3 className="text-white font-semibold mb-4">Help & Support</h3>
                <ul className="space-y-3">
                  <li>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleOpenHelpModal}
                      className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      <HelpCircle className="h-4 w-4" />
                      <span>Help Center</span>
                    </motion.button>
                  </li>
                  <li>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleNavigateToUserManual}
                      className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      <BookOpen className="h-4 w-4" />
                      <span>User Manual</span>
                    </motion.button>
                  </li>
                  <li>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleNavigateToQuickReference}
                      className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      <Download className="h-4 w-4" />
                      <span>Quick Reference</span>
                    </motion.button>
                  </li>
                </ul>
              </div>

              <div className="col-span-1">
                <h3 className="text-white font-semibold mb-4">Legal</h3>
                <ul className="space-y-3">
                  <li>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleOpenPrivacyModal}
                      className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      <Shield className="h-4 w-4" />
                      <span>Privacy Policy</span>
                    </motion.button>
                  </li>
                  <li>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleOpenTermsModal}
                      className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      <FileText className="h-4 w-4" />
                      <span>Terms & Conditions</span>
                    </motion.button>
                  </li>
                </ul>
              </div>

              <div className="col-span-1">
                <h3 className="text-white font-semibold mb-4">App Info</h3>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li>Version: 1.0.4</li>
                  <li>Release: July 2025</li>
                  <li>Platform: PWA</li>
                  <li>
                    <span className="flex items-center space-x-1">
                      <span>Status:</span>
                      <span className="flex items-center space-x-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        <span className="text-green-400">Active</span>
                      </span>
                    </span>
                  </li>
                  {updateAvailable && (
                    <li>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handlePWAUpdate}
                        disabled={isUpdating}
                        className="flex items-center space-x-2 text-orange-400 hover:text-orange-300 transition-colors font-medium"
                      >
                        {isUpdating ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <AlertCircle className="h-4 w-4" />
                        )}
                        <span>{isUpdating ? 'Updating...' : 'Update Available!'}</span>
                      </motion.button>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-700/50">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <span>© 2025 EduTrack AI. Made with</span>
                  <Heart className="h-4 w-4 text-red-500 animate-pulse" />
                  <span>for students everywhere.</span>
                </div>
                <div className="flex items-center space-x-6 text-sm text-gray-400">
                  <span>Powered by Next.js & MongoDB</span>
                  <span>•</span>
                  <span>Enhanced with Gemini AI</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <HelpModal 
        isOpen={showHelpModal}
        onClose={handleCloseHelpModal}
      />

      <PolicyModal
        isOpen={showPrivacyModal}
        onClose={handleClosePrivacyModal}
        title="Privacy Policy"
        content={privacyPolicyContent}
      />

      <PolicyModal
        isOpen={showTermsModal}
        onClose={handleCloseTermsModal}
        title="Terms & Conditions"
        content={termsConditionsContent}
      />
    </>
  );
};

export default Footer;
