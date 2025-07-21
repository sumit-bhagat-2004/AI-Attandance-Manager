// Time Travel Machine - Global Date Override for Production Use
// This overrides JavaScript's Date constructor globally (browser only)

import React, { useState, useEffect } from 'react';

// Check if we're in browser environment
const isBrowser = typeof window !== 'undefined';

// Store original Date constructor only in browser
const OriginalDate = isBrowser ? window.Date : Date;

class MockDate extends OriginalDate {
    constructor(...args) {
        // If no arguments provided and we're in simulated mode, return simulated date
        if (args.length === 0 && dateUtils.isSimulating) {
            super(dateUtils.simulatedTime);
        } else {
            super(...args);
        }
    }
    
    static now() {
        if (dateUtils.isSimulating) {
            return dateUtils.simulatedTime;
        }
        return OriginalDate.now();
    }
}

// Copy all static methods from original Date
if (isBrowser) {
    Object.getOwnPropertyNames(OriginalDate).forEach(name => {
        if (name !== 'length' && name !== 'name' && name !== 'prototype') {
            MockDate[name] = OriginalDate[name];
        }
    });
}

export const dateUtils = {
    isSimulating: false,
    simulatedTime: Date.now(),
    
    // Start time simulation
    startSimulation: (date = new Date()) => {
        if (!isBrowser) return new Date();
        
        dateUtils.isSimulating = true;
        dateUtils.simulatedTime = date.getTime();
        
        // Override global Date only in browser
        window.Date = MockDate;
        
        console.log('🕐 Time Travel ACTIVATED:', new Date().toString());
        return new Date();
    },
    
    // Stop time simulation
    stopSimulation: () => {
        if (!isBrowser) return new Date();
        
        dateUtils.isSimulating = false;
        
        // Restore original Date only in browser
        window.Date = OriginalDate;
        
        console.log('🕐 Time Travel DEACTIVATED, returned to reality:', new Date().toString());
        return new Date();
    },
    
    // Advance date by specified days
    advanceDate: (days = 1) => {
        if (!isBrowser) return new Date();
        
        if (!dateUtils.isSimulating) {
            dateUtils.startSimulation();
        }
        
        const newTime = dateUtils.simulatedTime + (days * 24 * 60 * 60 * 1000);
        dateUtils.simulatedTime = newTime;
        
        console.log(`🕐 Time Travel: Advanced ${days} day(s) to:`, new Date().toString());
        return new Date();
    },
    
    // Get current date (simulated or real)
    getCurrentDate: () => {
        return new Date();
    },
    
    // Reset to real current date
    resetToToday: () => {
        if (!isBrowser) return new Date();
        
        const realToday = new OriginalDate();
        dateUtils.simulatedTime = realToday.getTime();
        dateUtils.stopSimulation();
        console.log('🕐 Time Travel: Reset to real time:', realToday.toString());
        return realToday;
    },
    
    // Set specific date
    setDate: (dateString) => {
        if (!isBrowser) return new Date();
        
        const targetDate = new OriginalDate(dateString);
        dateUtils.startSimulation(targetDate);
        console.log('🕐 Time Travel: Jumped to:', new Date().toString());
        return new Date();
    },
    
    // Change time by hours
    changeTime: (hours = 1) => {
        if (!isBrowser) return new Date();
        
        if (!dateUtils.isSimulating) {
            dateUtils.startSimulation();
        }
        
        const newTime = dateUtils.simulatedTime + (hours * 60 * 60 * 1000);
        dateUtils.simulatedTime = newTime;
        
        console.log(`🕐 Time Travel: Changed time by ${hours} hour(s) to:`, new Date().toString());
        return new Date();
    },
    
    // Set specific time (HH:MM format)
    setTime: (timeString) => {
        if (!isBrowser) return new Date();
        
        if (!dateUtils.isSimulating) {
            dateUtils.startSimulation();
        }
        
        try {
            const [hours, minutes] = timeString.split(':').map(Number);
            const currentDate = new Date(dateUtils.simulatedTime);
            currentDate.setHours(hours, minutes, 0, 0);
            dateUtils.simulatedTime = currentDate.getTime();
            
            console.log(`🕐 Time Travel: Set time to ${timeString}:`, new Date().toString());
            return new Date();
        } catch (error) {
            console.error('Invalid time format. Use HH:MM format.');
            return new Date();
        }
    },
    
    // Format date for display
    formatDate: (date = null) => {
        const targetDate = date || new Date();
        return targetDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    },
    
    // Format date to local string for API calls
    formatDateToLocalString: (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },
    
    // Get week start (Monday)
    getWeekStart: (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        return new Date(d.setDate(diff));
    },
    
    // Get week end (Sunday)
    getWeekEnd: (date) => {
        const weekStart = dateUtils.getWeekStart(date);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return weekEnd;
    },
    
    // Check if date is today
    isToday: (date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    },
    
    // Add days to date
    addDays: (date, days) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
};

// Time Travel Control Panel
export const DateControlPanel = ({ onDateChange }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isSimulating, setIsSimulating] = useState(false);
    
    // Only run in browser
    if (!isBrowser) {
        return <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 mb-4">
            <span className="text-gray-400">Date controls loading...</span>
        </div>;
    }
    
    // Update display every second
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentDate(new Date());
            setIsSimulating(dateUtils.isSimulating);
        }, 1000);
        
        return () => clearInterval(interval);
    }, []);
    
    const handleAdvance = (days) => {
        const newDate = dateUtils.advanceDate(days);
        setCurrentDate(new Date(newDate));
        setIsSimulating(true);
        if (onDateChange) onDateChange(newDate);
    };
    
    const handleReset = () => {
        const newDate = dateUtils.resetToToday();
        setCurrentDate(new Date(newDate));
        setIsSimulating(false);
        if (onDateChange) onDateChange(newDate);
    };
    
    const handleSetSpecificDate = () => {
        const dateStr = prompt('Enter date (YYYY-MM-DD):');
        if (dateStr) {
            try {
                const newDate = dateUtils.setDate(dateStr);
                setCurrentDate(new Date(newDate));
                setIsSimulating(true);
                if (onDateChange) onDateChange(newDate);
            } catch (error) {
                alert('Invalid date format. Use YYYY-MM-DD');
            }
        }
    };
    
    const handleTimeChange = (hours) => {
        const newDate = dateUtils.changeTime(hours);
        setCurrentDate(new Date(newDate));
        setIsSimulating(true);
        if (onDateChange) onDateChange(newDate);
    };
    
    const handleSetSpecificTime = () => {
        const timeStr = prompt('Enter time (HH:MM format, 24-hour):');
        if (timeStr) {
            try {
                const newDate = dateUtils.setTime(timeStr);
                setCurrentDate(new Date(newDate));
                setIsSimulating(true);
                if (onDateChange) onDateChange(newDate);
            } catch (error) {
                alert('Invalid time format. Use HH:MM (24-hour format)');
            }
        }
    };
    
    return (
        <div className={`border rounded-lg p-4 mb-4 ${
            isSimulating 
                ? 'bg-purple-900 border-purple-600' 
                : 'bg-yellow-900 border-yellow-600'
        }`}>
            <div className="flex items-center justify-between mb-2">
                <span className={`font-semibold flex items-center gap-2 ${
                    isSimulating ? 'text-purple-200' : 'text-yellow-200'
                }`}>
                    {isSimulating ? '🕐 TIME TRAVEL ACTIVE' : '🌍 REAL TIME'}
                    <span className="text-xs px-2 py-1 rounded bg-black/30">
                        {isSimulating ? 'SIMULATED' : 'LIVE'}
                    </span>
                </span>
                <button 
                    onClick={handleReset}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                        isSimulating 
                            ? 'bg-purple-600 hover:bg-purple-500 text-purple-100' 
                            : 'bg-yellow-600 hover:bg-yellow-500 text-yellow-100'
                    }`}
                >
                    Return to Reality
                </button>
            </div>
            
            <div className={`text-sm mb-3 font-mono ${
                isSimulating ? 'text-purple-100' : 'text-yellow-100'
            }`}>
                {currentDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                })}
            </div>
            
            <div className="space-y-3">
                {/* Date Controls */}
                <div className="flex gap-2 flex-wrap">
                    <button 
                        onClick={() => handleAdvance(1)}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1 rounded transition-colors"
                    >
                        +1 Day
                    </button>
                    <button 
                        onClick={() => handleAdvance(7)}
                        className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-3 py-1 rounded transition-colors"
                    >
                        +1 Week
                    </button>
                    <button 
                        onClick={() => handleAdvance(-1)}
                        className="bg-red-600 hover:bg-red-500 text-white text-xs px-3 py-1 rounded transition-colors"
                    >
                        -1 Day
                    </button>
                    <button 
                        onClick={() => handleAdvance(-7)}
                        className="bg-orange-600 hover:bg-orange-500 text-white text-xs px-3 py-1 rounded transition-colors"
                    >
                        -1 Week
                    </button>
                    <button 
                        onClick={handleSetSpecificDate}
                        className="bg-green-600 hover:bg-green-500 text-white text-xs px-3 py-1 rounded transition-colors"
                    >
                        Jump to Date
                    </button>
                </div>
                
                {/* Time Controls */}
                <div className="flex gap-2 flex-wrap border-t border-gray-600/50 pt-2">
                    <button 
                        onClick={() => handleTimeChange(1)}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-3 py-1 rounded transition-colors"
                    >
                        +1 Hour
                    </button>
                    <button 
                        onClick={() => handleTimeChange(6)}
                        className="bg-teal-600 hover:bg-teal-500 text-white text-xs px-3 py-1 rounded transition-colors"
                    >
                        +6 Hours
                    </button>
                    <button 
                        onClick={() => handleTimeChange(-1)}
                        className="bg-rose-600 hover:bg-rose-500 text-white text-xs px-3 py-1 rounded transition-colors"
                    >
                        -1 Hour
                    </button>
                    <button 
                        onClick={() => handleTimeChange(-6)}
                        className="bg-amber-600 hover:bg-amber-500 text-white text-xs px-3 py-1 rounded transition-colors"
                    >
                        -6 Hours
                    </button>
                    <button 
                        onClick={handleSetSpecificTime}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1 rounded transition-colors"
                    >
                        Set Time
                    </button>
                </div>
            </div>
            
            {isSimulating && (
                <div className="mt-2 text-xs text-purple-300 italic">
                    ⚠️ All system dates are now simulated. Components will use this time.
                </div>
            )}
        </div>
    );
};

// Format date to local string for consistency
export const formatDateToLocalString = (date) => {
    return dateUtils.formatDateToLocalString(date);
};

// Get current time in HH:MM format
export const getCurrentTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

// Parse time string to minutes since midnight
export const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

// Convert minutes since midnight to time string
export const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

// Check if current time is within a time range
export const isWithinTimeRange = (startTime, endTime) => {
    const currentMinutes = timeToMinutes(getCurrentTime());
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
};

export default dateUtils;
