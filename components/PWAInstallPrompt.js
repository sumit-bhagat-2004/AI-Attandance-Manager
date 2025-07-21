import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowDownTrayIcon, 
    XMarkIcon,
    DevicePhoneMobileIcon,
    ComputerDesktopIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function PWAInstallPrompt({ isVisible, onClose, variant = 'banner' }) {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [deviceType, setDeviceType] = useState('desktop');

    useEffect(() => {
        // Check if app is already installed
        const checkInstalled = () => {
            if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
                setIsInstalled(true);
            }
        };

        // Detect device type
        const detectDevice = () => {
            const userAgent = navigator.userAgent.toLowerCase();
            if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent)) {
                setDeviceType('mobile');
            } else {
                setDeviceType('desktop');
            }
        };

        // Listen for beforeinstallprompt event
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        // Listen for app installation
        const handleAppInstalled = () => {
            setIsInstalled(true);
            setDeferredPrompt(null);
            onClose?.();
        };

        checkInstalled();
        detectDevice();
        
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, [onClose]);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            // Fallback instructions for browsers that don't support install prompt
            showManualInstallInstructions();
            return;
        }

        try {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('User accepted the install prompt');
                setIsInstalled(true);
            } else {
                console.log('User dismissed the install prompt');
            }
            
            setDeferredPrompt(null);
            onClose?.();
        } catch (error) {
            console.error('Error during installation:', error);
            showManualInstallInstructions();
        }
    };

    const showManualInstallInstructions = () => {
        const instructions = deviceType === 'mobile' 
            ? 'Tap the share button and select "Add to Home Screen"'
            : 'Click the install icon in your browser\'s address bar or go to Settings > Install EduTrack AI';
        
        alert(`To install EduTrack AI:\n\n${instructions}`);
    };

    // Don't show if already installed or not visible
    if (isInstalled || !isVisible) return null;

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
