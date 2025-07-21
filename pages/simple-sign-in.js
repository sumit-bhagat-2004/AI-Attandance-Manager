import React from 'react';
import { SignIn } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { BookOpen, GraduationCap, Sparkles } from 'lucide-react';

export default function SimpleSignInPage() {
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

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-md"
            >
                {/* Header */}
                <motion.div variants={itemVariants} className="text-center mb-8">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl blur opacity-75"></div>
                        <div className="relative bg-gradient-to-r from-cyan-500 to-purple-600 p-4 rounded-2xl mx-auto w-20 h-20 flex items-center justify-center mb-4">
                            <BookOpen className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    
                    <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                        EduTrack AI
                    </h1>
                    <p className="text-gray-400 text-lg mb-4">
                        Smart Attendance Management
                    </p>
                    <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl p-3 mb-6">
                        <p className="text-amber-400 text-sm font-medium">
                            🎓 <strong>AOT Students Only</strong><br/>
                            Please use your <strong>@aot.edu.in</strong> email address to sign in.
                        </p>
                    </div>
                </motion.div>

                {/* Simple Clerk Sign In */}
                <motion.div variants={itemVariants}>
                    <SignIn 
                        routing="hash"
                        appearance={{
                            baseTheme: "dark",
                            variables: {
                                colorPrimary: "#06b6d4",
                                colorBackground: "#1f2937",
                                colorInputBackground: "#374151",
                                colorInputText: "#ffffff",
                                borderRadius: "0.75rem"
                            },
                            elements: {
                                card: "bg-gray-800 border border-gray-600 rounded-xl shadow-xl p-6",
                                headerTitle: "text-white text-lg font-semibold",
                                headerSubtitle: "text-gray-400",
                                socialButtonsBlockButton: "bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 px-4",
                                formFieldInput: "bg-gray-700 border-gray-600 text-white rounded-lg px-4 py-3",
                                formButtonPrimary: "bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg py-3 px-4",
                                footerActionLink: "text-cyan-400 hover:text-cyan-300"
                            }
                        }}
                    />
                </motion.div>
            </motion.div>
        </div>
    );
}
