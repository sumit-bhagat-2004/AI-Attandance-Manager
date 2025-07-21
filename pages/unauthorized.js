import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, GraduationCap, Sparkles, XCircleIcon } from 'lucide-react';
import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/router';

export default function UnauthorizedPage() {
    const { signOut } = useClerk();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        router.push('/sign-in');
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
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900"></div>
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-2xl animate-pulse delay-2000"></div>
            </div>

            {/* Floating Elements */}
            <motion.div
                variants={floatingVariants}
                animate="animate"
                className="absolute top-20 left-20 text-red-400/20"
            >
                <GraduationCap size={60} />
            </motion.div>
            <motion.div
                variants={floatingVariants}
                animate="animate"
                className="absolute top-40 right-32 text-orange-400/20"
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
                    className="w-full max-w-md text-center"
                >
                    {/* Header */}
                    <motion.div variants={itemVariants} className="mb-8">
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className="mx-auto mb-6"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-orange-500 rounded-2xl blur opacity-75"></div>
                                <div className="relative bg-gradient-to-r from-red-500 to-orange-600 p-4 rounded-2xl">
                                    <XCircleIcon className="h-12 w-12 text-white mx-auto" />
                                </div>
                            </div>
                        </motion.div>
                        
                        <motion.h1 
                            className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-red-400 via-orange-500 to-pink-500 bg-clip-text text-transparent"
                            variants={itemVariants}
                        >
                            Access Denied
                        </motion.h1>
                        <motion.p 
                            className="text-gray-400 text-lg mb-4"
                            variants={itemVariants}
                        >
                            Sorry, this application is restricted to AOT students only.
                        </motion.p>
                    </motion.div>

                    {/* Content Card */}
                    <motion.div 
                        variants={itemVariants} 
                        className="bg-gradient-to-br from-gray-800/90 via-gray-900/90 to-black/90 border border-white/10 shadow-2xl backdrop-blur-xl rounded-2xl p-8"
                    >
                        <div className="text-center">
                            <div className="mb-6">
                                <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-4">
                                    <p className="text-red-400 font-semibold text-lg mb-2">
                                        🚫 Unauthorized Email Domain
                                    </p>
                                    <p className="text-gray-300 text-sm">
                                        Only students with <strong>@aot.edu.in</strong> email addresses can access this application.
                                    </p>
                                </div>
                                
                                <div className="bg-amber-500/20 border border-amber-500/30 rounded-xl p-4">
                                    <p className="text-amber-400 font-semibold mb-2">
                                        📧 Need Help?
                                    </p>
                                    <p className="text-gray-300 text-sm">
                                        Please use your official AOT student email address to sign up.
                                    </p>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSignOut}
                                className="w-full bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg"
                            >
                                Sign Out & Try Again
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
