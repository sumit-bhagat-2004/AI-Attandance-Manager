import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    XMarkIcon, 
    CogIcon,
    EyeIcon,
    EyeSlashIcon,
    BookOpenIcon,
    TrophyIcon,
    BellIcon,
    CalendarDaysIcon,
    AcademicCapIcon,
    ChartBarIcon,
    DevicePhoneMobileIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

const DEFAULT_SETTINGS = {
    showScheduleView: true,
    showStatsView: true,
    showMakeupView: true,
    showCalendarView: true,
    showAITopics: true,
    showSubjectChange: true,
    showStatsPanel: true,
    showWeeklyReports: true,
    showECAManager: true,
    showStudyMaterials: true,
    showTimeMachine: true,
    showCycleStartSettings: true,
    showPWAInstallPrompt: true
};

export default function SettingsModal({ isOpen, onClose, currentUser }) {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [isSaving, setIsSaving] = useState(false);

    // Load settings when modal opens
    useEffect(() => {
        if (isOpen && currentUser) {
            loadSettings();
        }
    }, [isOpen, currentUser]);

    const loadSettings = async () => {
        try {
            const savedSettings = localStorage.getItem(`app-settings-${currentUser}`);
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                setSettings({ ...DEFAULT_SETTINGS, ...parsed });
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
            setSettings(DEFAULT_SETTINGS);
        }
    };

    const saveSettings = async () => {
        setIsSaving(true);
        try {
            localStorage.setItem(`app-settings-${currentUser}`, JSON.stringify(settings));
            
            // Dispatch custom event to notify other components
            window.dispatchEvent(new CustomEvent('settingsChanged', { 
                detail: settings 
            }));
            
            setTimeout(() => {
                setIsSaving(false);
                onClose();
            }, 500);
        } catch (error) {
            console.error('Failed to save settings:', error);
            setIsSaving(false);
        }
    };

    const toggleSetting = (key) => {
        setSettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const resetSettings = () => {
        setSettings(DEFAULT_SETTINGS);
    };

    const settingsOptions = [
        {
            key: 'showScheduleView',
            title: 'Schedule View',
            description: 'Show daily class schedule and attendance tracking',
            icon: BookOpenIcon,
            category: 'Views'
        },
        {
            key: 'showStatsView',
            title: 'Statistics View',
            description: 'Show attendance statistics and analytics',
            icon: TrophyIcon,
            category: 'Views'
        },
        {
            key: 'showMakeupView',
            title: 'Makeup Classes',
            description: 'Show makeup class management and scheduling',
            icon: BellIcon,
            category: 'Views'
        },
        {
            key: 'showCalendarView',
            title: 'Calendar View',
            description: 'Show calendar with attendance and makeup classes',
            icon: CalendarDaysIcon,
            category: 'Views'
        },
        {
            key: 'showAITopics',
            title: 'AI Topics Generator',
            description: 'Show AI-powered topic suggestions for classes',
            icon: AcademicCapIcon,
            category: 'Features'
        },
        {
            key: 'showSubjectChange',
            title: 'Subject Change',
            description: 'Allow changing subjects for teacher absence',
            icon: CogIcon,
            category: 'Features'
        },
        {
            key: 'showStatsPanel',
            title: 'Stats Panel',
            description: 'Show attendance statistics in sidebar',
            icon: ChartBarIcon,
            category: 'Features'
        },
        {
            key: 'showWeeklyReports',
            title: 'Weekly Reports',
            description: 'Show weekly attendance reports and analytics',
            icon: ChartBarIcon,
            category: 'Features'
        },
        {
            key: 'showECAManager',
            title: 'ECA Manager',
            description: 'Show Extra-Curricular Activities management',
            icon: TrophyIcon,
            category: 'Features'
        },
        {
            key: 'showStudyMaterials',
            title: 'Study Materials',
            description: 'Show study materials and resources',
            icon: BookOpenIcon,
            category: 'Features'
        },
        {
            key: 'showTimeMachine',
            title: 'Time Machine',
            description: 'Show date control panel for time travel functionality',
            icon: ClockIcon,
            category: 'Features'
        },
        {
            key: 'showCycleStartSettings',
            title: 'Cycle Start Settings',
            description: 'Show cycle start date configuration',
            icon: CalendarDaysIcon,
            category: 'Features'
        },
        {
            key: 'showPWAInstallPrompt',
            title: 'PWA Install Prompt',
            description: 'Show Progressive Web App installation prompts',
            icon: DevicePhoneMobileIcon,
            category: 'Features'
        }
    ];

    const categories = [...new Set(settingsOptions.map(option => option.category))];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div 
                className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-2 sm:p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div 
                    className="glass-card rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] border border-gray-700/50 overflow-hidden overflow-y-auto"
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="relative p-4 sm:p-6 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-b border-gray-700/50">
                        <motion.button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition-colors group"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <XMarkIcon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                        </motion.button>
                        
                        <div className="flex items-start space-x-3 sm:space-x-4 pr-12">
                            <motion.div
                                className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
                                initial={{ rotate: 0 }}
                                animate={{ rotate: 360 }}
                                transition={{ duration: 0.8, ease: "easeInOut" }}
                            >
                                <CogIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </motion.div>
                            <div className="min-w-0 flex-1">
                                <h3 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent leading-tight">
                                    App Settings
                                </h3>
                                <p className="text-gray-400 mt-1 text-sm sm:text-base">
                                    Customize which features you want to see. Turn off unused features to make the app less cluttered.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-6">
                        {categories.map(category => (
                            <div key={category} className="mb-8">
                                <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                                    <span>{category}</span>
                                </h4>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                    {settingsOptions.filter(option => option.category === category).map(option => {
                                        const IconComponent = option.icon;
                                        const isEnabled = settings[option.key];
                                        
                                        return (
                                            <motion.div
                                                key={option.key}
                                                className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                                                    isEnabled 
                                                        ? 'bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/20' 
                                                        : 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50'
                                                }`}
                                                onClick={() => toggleSetting(option.key)}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <div className="flex items-start space-x-3">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                        isEnabled 
                                                            ? 'bg-cyan-500/20 text-cyan-400' 
                                                            : 'bg-gray-700/50 text-gray-500'
                                                    }`}>
                                                        <IconComponent className="w-5 h-5" />
                                                    </div>
                                                    
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <h5 className={`font-medium ${
                                                                isEnabled ? 'text-white' : 'text-gray-400'
                                                            }`}>
                                                                {option.title}
                                                            </h5>
                                                            <div className="flex items-center space-x-2">
                                                                {isEnabled ? (
                                                                    <EyeIcon className="w-4 h-4 text-cyan-400" />
                                                                ) : (
                                                                    <EyeSlashIcon className="w-4 h-4 text-gray-500" />
                                                                )}
                                                                <div className={`w-10 h-5 rounded-full transition-colors ${
                                                                    isEnabled ? 'bg-cyan-500' : 'bg-gray-600'
                                                                }`}>
                                                                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                                                                        isEnabled ? 'translate-x-5' : 'translate-x-0.5'
                                                                    } mt-0.5`} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-gray-500">
                                                            {option.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="p-4 sm:p-6 bg-gray-800/30 border-t border-gray-700/50">
                        <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
                            <div className="text-sm text-gray-400">
                                Settings are saved locally for your account
                            </div>
                            
                            <div className="flex space-x-3">
                                <motion.button
                                    onClick={resetSettings}
                                    className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-lg font-medium transition-colors text-sm"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Reset to Default
                                </motion.button>
                                
                                <motion.button
                                    onClick={saveSettings}
                                    disabled={isSaving}
                                    className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 text-sm disabled:opacity-50"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {isSaving ? 'Saving...' : 'Save Settings'}
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// Hook to use settings in other components
export const useSettings = (currentUser) => {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);

    useEffect(() => {
        if (currentUser) {
            const loadSettings = () => {
                try {
                    const savedSettings = localStorage.getItem(`app-settings-${currentUser}`);
                    if (savedSettings) {
                        const parsed = JSON.parse(savedSettings);
                        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
                    }
                } catch (error) {
                    console.error('Failed to load settings:', error);
                    setSettings(DEFAULT_SETTINGS);
                }
            };

            loadSettings();

            // Listen for settings changes
            const handleSettingsChange = (event) => {
                setSettings(event.detail);
            };

            window.addEventListener('settingsChanged', handleSettingsChange);
            return () => window.removeEventListener('settingsChanged', handleSettingsChange);
        }
    }, [currentUser]);

    return settings;
};
