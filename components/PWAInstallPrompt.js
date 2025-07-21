import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowDownTrayIcon, 
    XMarkIcon,
    DevicePhoneMobileIcon,
    ComputerDesktopIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

function PWAInstallPrompt({ isVisible = true, onClose, variant = 'banner' }) {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [deviceType, setDeviceType] = useState('desktop');
    const [showComponent, setShowComponent] = useState(false);

    useEffect(() => {
        console.log('PWAInstallPrompt mounting, variant:', variant);
        
        // Check if app is already installed
        const checkInstalled = () => {
            const installed = window.matchMedia('(display-mode: standalone)').matches || 
                            window.navigator.standalone || 
                            document.referrer.includes('android-app://');
            setIsInstalled(installed);
            console.log('PWA Install Status:', installed ? 'Already Installed' : 'Not Installed');
            return installed;
        };

        // Detect device type
        const detectDevice = () => {
            const userAgent = navigator.userAgent.toLowerCase();
            const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);
            setDeviceType(isMobile ? 'mobile' : 'desktop');
            console.log('Device Type:', isMobile ? 'Mobile' : 'Desktop');
        };

        // Check for global deferred prompt (set by _app.js)
        const checkGlobalDeferredPrompt = () => {
            if (window.deferredPrompt) {
                console.log('Using global deferred prompt from _app.js');
                setDeferredPrompt(window.deferredPrompt);
                setShowComponent(true);
                return true;
            }
            return false;
        };

        // Listen for beforeinstallprompt event (backup in case global handler missed it)
        const handleBeforeInstallPrompt = (e) => {
            console.log('PWAInstallPrompt: beforeinstallprompt event fired');
            e.preventDefault();
            setDeferredPrompt(e);
            setShowComponent(true);
        };

        // Listen for app installation
        const handleAppInstalled = () => {
            console.log('App successfully installed via PWA prompt');
            setIsInstalled(true);
            setDeferredPrompt(null);
            setShowComponent(false);
            window.deferredPrompt = null; // Clear global prompt
            onClose?.();
        };

        // Initialize
        const installed = checkInstalled();
        detectDevice();
        
        if (!installed) {
            // First, try to use the global deferred prompt
            const hasGlobalPrompt = checkGlobalDeferredPrompt();
            
            if (!hasGlobalPrompt) {
                console.log('No global prompt available, setting up event listener');
                // For button/card variants, show even without prompt
                if (variant === 'button' || variant === 'card') {
                    console.log('Button/Card variant - showing without waiting for beforeinstallprompt');
                    setShowComponent(true);
                }
            }
        }
        
        // Add event listeners as backup
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        // Cleanup
        return () => {
            console.log('PWAInstallPrompt unmounting');
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, [variant, onClose]);

    const handleInstallClick = async () => {
        console.log('=== PWA Install Debug ===');
        console.log('Button clicked in variant:', variant);
        console.log('Device Type:', deviceType);
        console.log('Component deferredPrompt:', !!deferredPrompt);
        console.log('Global window.deferredPrompt:', !!window.deferredPrompt);
        console.log('Is Installed:', isInstalled);
        console.log('Show Component:', showComponent);
        console.log('Is Visible:', isVisible);

        // Use global deferred prompt if component doesn't have it
        const promptToUse = deferredPrompt || window.deferredPrompt;
        
        // For mobile devices, try native install first
        if (deviceType === 'mobile') {
            console.log('Mobile device detected - attempting mobile install...');
            
            // iOS Safari - try to use Web Share API to trigger menu
            if (/iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase()) && !window.MSStream) {
                console.log('iOS Safari detected - attempting share menu...');
                if (navigator.share) {
                    try {
                        await navigator.share({
                            title: 'EduTrack AI - Install App',
                            text: 'Install EduTrack AI for the best experience',
                            url: window.location.origin
                        });
                        console.log('iOS share menu opened successfully');
                        onClose?.();
                        return;
                    } catch (err) {
                        console.log('iOS share cancelled or failed:', err);
                        onClose?.();
                        return;
                    }
                } else {
                    console.log('Web Share API not available on iOS');
                }
            }
        }

        // Try native install prompt (works on Chrome, Edge, etc.)
        if (promptToUse) {
            console.log('Using deferred install prompt (component or global)...');
            try {
                const result = promptToUse.prompt();
                console.log('Install prompt shown, result:', result);
                
                const { outcome } = await promptToUse.userChoice;
                console.log('User install choice:', outcome);
                
                if (outcome === 'accepted') {
                    console.log('User accepted install - app should install now');
                    setIsInstalled(true);
                    setShowComponent(false);
                } else {
                    console.log('User dismissed install prompt');
                }
                
                setDeferredPrompt(null);
                window.deferredPrompt = null; // Clear global prompt
                onClose?.();
            } catch (error) {
                console.error('Error during PWA installation:', error);
                onClose?.();
            }
        } else {
            console.log('No install prompt available - possible reasons:');
            console.log('1. PWA already installed');
            console.log('2. Browser doesn\'t support PWA install');
            console.log('3. beforeinstallprompt event hasn\'t fired yet');
            console.log('4. PWA criteria not met (HTTPS, manifest, service worker)');
            
            // Show a helpful message for debugging
            if (typeof window !== 'undefined') {
                const installAvailable = 'beforeinstallprompt' in window;
                const isHTTPS = location.protocol === 'https:' || location.hostname === 'localhost';
                const hasServiceWorker = 'serviceWorker' in navigator;
                
                console.log('PWA Debug Info:');
                console.log('- beforeinstallprompt supported:', installAvailable);
                console.log('- HTTPS/localhost:', isHTTPS);
                console.log('- Service Worker supported:', hasServiceWorker);
                console.log('- Component deferredPrompt:', !!deferredPrompt);
                console.log('- Global window.deferredPrompt:', !!window.deferredPrompt);
                console.log('- Current URL:', location.href);
                console.log('- User Agent:', navigator.userAgent);
                
                // For debugging - show more detailed alert in development
                if (location.hostname === 'localhost') {
                    const debugMsg = `PWA Install Debug:
• Install prompt available: ${installAvailable}
• HTTPS/localhost: ${isHTTPS}
• Service Worker: ${hasServiceWorker}
• Variant: ${variant}
• Device: ${deviceType}

Current Status:
• Is Installed: ${isInstalled}
• Show Component: ${showComponent}
• Component Prompt: ${!!deferredPrompt}
• Global Prompt: ${!!window.deferredPrompt}

Try:
1. Refresh the page
2. Check browser dev tools
3. Ensure all PWA criteria are met`;
                    
                    alert(debugMsg);
                }
            }
            
            // Don't close immediately for buttons - let user see the debug info
            if (variant !== 'button') {
                onClose?.();
            }
        }
    };

    // Show component based on variant and installation status
    const shouldShow = isVisible && !isInstalled && 
        (showComponent || variant === 'button' || variant === 'card');

    if (!shouldShow) return null;

    const BannerVariant = () => (
        <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-cyan-600 to-purple-600 text-white p-4 shadow-lg"
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <ArrowDownTrayIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-semibold">Install EduTrack AI</p>
                        <p className="text-sm opacity-90">Get the full app experience with offline access</p>
                    </div>
                </div>
                
                <div className="flex items-center space-x-2">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleInstallClick}
                        className="bg-white text-cyan-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors"
                    >
                        Install
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <XMarkIcon className="w-4 h-4" />
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );

    const ButtonVariant = () => (
        <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleInstallClick}
            className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-semibold shadow-lg transition-all duration-200"
        >
            <ArrowDownTrayIcon className="w-5 h-5" />
            <span>Install App</span>
        </motion.button>
    );

    const CardVariant = () => (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 shadow-2xl max-w-md mx-auto"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center">
                        {deviceType === 'mobile' ? (
                            <DevicePhoneMobileIcon className="w-6 h-6 text-white" />
                        ) : (
                            <ComputerDesktopIcon className="w-6 h-6 text-white" />
                        )}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Install EduTrack AI</h3>
                        <p className="text-gray-400 text-sm">Get the full app experience</p>
                    </div>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                >
                    <XMarkIcon className="w-5 h-5 text-gray-400" />
                </motion.button>
            </div>

            <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3 text-gray-300">
                    <CheckCircleIcon className="w-5 h-5 text-green-400" />
                    <span>Works offline</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                    <CheckCircleIcon className="w-5 h-5 text-green-400" />
                    <span>Faster loading</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                    <CheckCircleIcon className="w-5 h-5 text-green-400" />
                    <span>Push notifications</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                    <CheckCircleIcon className="w-5 h-5 text-green-400" />
                    <span>Home screen access</span>
                </div>
            </div>

            <div className="flex space-x-3">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleInstallClick}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-4 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    <span>Install Now</span>
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="px-4 py-3 border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white rounded-xl font-semibold transition-colors"
                >
                    Later
                </motion.button>
            </div>
        </motion.div>
    );

    return (
        <AnimatePresence>
            {variant === 'banner' && <BannerVariant />}
            {variant === 'button' && <ButtonVariant />}
            {variant === 'card' && <CardVariant />}
        </AnimatePresence>
    );
}

PWAInstallPrompt.displayName = 'PWAInstallPrompt';

export default PWAInstallPrompt;
