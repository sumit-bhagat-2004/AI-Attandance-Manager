import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, User, Lock, Mail, Eye, EyeOff, Sparkles, GraduationCap } from 'lucide-react';
import { cn } from '../lib/utils';

export default function AuthPage({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, isLogin }),
            });

            const data = await response.json();

            if (response.ok) {
                onLogin(username);
            } else {
                setError(data.message || 'An error occurred.');
            }
        } catch (err) {
            setError('Failed to connect to the server.');
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.5 }
        }
    };

    const floatingVariants = {
        animate: {
            y: [-10, 10, -10],
            rotate: [0, 5, -5, 0],
            transition: {
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900"></div>
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-2xl animate-pulse delay-2000"></div>
            </div>

            {/* Floating Elements */}
            <motion.div
                variants={floatingVariants}
                animate="animate"
                className="absolute top-20 left-20 text-cyan-400/20"
            >
                <GraduationCap size={60} />
            </motion.div>
            <motion.div
                variants={floatingVariants}
                animate="animate"
                className="absolute top-40 right-32 text-purple-400/20"
                style={{ animationDelay: '2s' }}
            >
                <BookOpen size={40} />
            </motion.div>
            <motion.div
                variants={floatingVariants}
                animate="animate"
                className="absolute bottom-32 left-32 text-pink-400/20"
                style={{ animationDelay: '4s' }}
            >
                <Sparkles size={50} />
            </motion.div>

            <div className="relative z-10 flex flex-col justify-center items-center min-h-screen p-4">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-md"
                >
                    {/* Header */}
                    <motion.div variants={itemVariants} className="text-center mb-8">
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className="mx-auto mb-4"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl blur opacity-75"></div>
                                <div className="relative bg-gradient-to-r from-cyan-500 to-purple-600 p-4 rounded-2xl">
                                    <BookOpen className="h-12 w-12 text-white mx-auto" />
                                </div>
                            </div>
                        </motion.div>
                        
                        <motion.h1 
                            className="text-4xl md:text-5xl font-bold mb-2 text-gradient"
                            variants={itemVariants}
                        >
                            EduTrack AI
                        </motion.h1>
                        <motion.p 
                            className="text-gray-400 text-lg"
                            variants={itemVariants}
                        >
                            Smart Attendance Management
                        </motion.p>
                    </motion.div>

                    {/* Form Container */}
                    <motion.div variants={itemVariants} className="card-gradient rounded-2xl p-8 shadow-2xl border border-white/10">
                        {/* Tab Switcher */}
                        <div className="flex mb-8 bg-gray-800/50 rounded-xl p-1">
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setIsLogin(true)}
                                className={cn(
                                    "flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200",
                                    isLogin
                                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
                                        : "text-gray-400 hover:text-gray-300"
                                )}
                            >
                                Sign In
                            </motion.button>
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setIsLogin(false)}
                                className={cn(
                                    "flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200",
                                    !isLogin
                                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg"
                                        : "text-gray-400 hover:text-gray-300"
                                )}
                            >
                                Sign Up
                            </motion.button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Username Field */}
                            <motion.div variants={itemVariants}>
                                <label className="block text-gray-300 text-sm font-semibold mb-2">
                                    Username
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                                        placeholder="Enter your username"
                                        required
                                    />
                                </div>
                            </motion.div>

                            {/* Password Field */}
                            <motion.div variants={itemVariants}>
                                <label className="block text-gray-300 text-sm font-semibold mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                                        placeholder="Enter your password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </motion.div>

                            {/* Error Message */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg"
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Submit Button */}
                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={{ scale: loading ? 1 : 1.02 }}
                                whileTap={{ scale: loading ? 1 : 0.98 }}
                                className={cn(
                                    "w-full py-3 rounded-xl font-semibold text-white transition-all duration-300",
                                    loading
                                        ? "bg-gray-600 cursor-not-allowed"
                                        : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg hover:shadow-cyan-500/25"
                                )}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                                        />
                                        Processing...
                                    </div>
                                ) : (
                                    isLogin ? 'Sign In' : 'Create Account'
                                )}
                            </motion.button>
                        </form>

                        {/* Switch Auth Mode */}
                        <motion.div variants={itemVariants} className="text-center mt-6">
                            <p className="text-gray-400">
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors duration-200"
                                >
                                    {isLogin ? 'Sign up' : 'Sign in'}
                                </motion.button>
                            </p>
                        </motion.div>
                    </motion.div>

                    {/* Footer */}
                    <motion.div variants={itemVariants} className="text-center mt-8">
                        <p className="text-gray-500 text-sm">
                            Built with AI • Powered by Intelligence
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
