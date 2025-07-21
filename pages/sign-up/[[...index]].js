import React from 'react';
import { SignUp } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { BookOpen, GraduationCap, Sparkles } from 'lucide-react';

export default function SignUpPage() {
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
                            className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
                            variants={itemVariants}
                        >
                            EduTrack AI
                        </motion.h1>
                        <motion.p 
                            className="text-gray-400 text-lg mb-2"
                            variants={itemVariants}
                        >
                            Smart Attendance Management
                        </motion.p>
                        <motion.p 
                            className="text-amber-400 text-sm font-medium mb-4 p-3 bg-amber-400/10 border border-amber-400/30 rounded-xl"
                            variants={itemVariants}
                        >
                            🎓 <strong>AOT Students Only</strong><br/>
                            Please use your <strong>@aot.edu.in</strong> email address to sign up.<br/>
                            Other email domains will be automatically rejected.
                        </motion.p>
                    </motion.div>

                    {/* Clerk Sign Up Component with Better Visibility */}
                    <motion.div variants={itemVariants} className="flex justify-center">
                        <div className="w-full max-w-sm">
                            <SignUp 
                                appearance={{
                                    baseTheme: "dark",
                                    variables: {
                                        colorPrimary: "#06b6d4",
                                        colorPrimaryHover: "#0891b2",
                                        colorText: "#ffffff",
                                        colorTextSecondary: "#9ca3af",
                                        colorBackground: "#1f2937",
                                        colorInputBackground: "#374151",
                                        colorInputText: "#ffffff",
                                        borderRadius: "0.75rem"
                                    },
                                    elements: {
                                        rootBox: "w-full",
                                        card: "bg-gray-800/95 border border-gray-600/50 shadow-2xl backdrop-blur-xl rounded-2xl p-6",
                                        headerTitle: "text-white text-xl font-semibold text-center",
                                        headerSubtitle: "text-gray-400 text-center",
                                        socialButtonsBlockButton: "bg-blue-600 hover:bg-blue-700 border-0 rounded-xl transition-all duration-300 text-white font-medium py-3 px-4 w-full",
                                        socialButtonsBlockButtonArrow: "text-white",
                                        socialButtonsBlockButtonText: "text-white font-medium text-sm",
                                        dividerLine: "bg-gray-600",
                                        dividerText: "text-gray-400",
                                        formFieldLabel: "text-gray-300 font-medium text-sm",
                                        formFieldInput: "bg-gray-700/50 border-gray-600 rounded-xl text-white placeholder:text-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20 py-3 px-4",
                                        formButtonPrimary: "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 border-0 rounded-xl transition-all duration-300 text-white font-medium py-3 px-4 w-full",
                                        footerActionLink: "text-cyan-400 hover:text-cyan-300 font-medium",
                                        identityPreviewText: "text-gray-300",
                                        identityPreviewEditButton: "text-cyan-400 hover:text-cyan-300",
                                        formFieldErrorText: "text-red-400 text-sm",
                                        alertError: "bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl p-3",
                                        formFieldSuccessText: "text-green-400 text-sm",
                                        loadingSpinner: "text-cyan-400"
                                    }
                                }}
                                afterSignInUrl="/"
                                afterSignUpUrl="/"
                                redirectUrl="/"
                                signInUrl="/sign-in"
                                routing="path"
                                path="/sign-up"
                            />
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
