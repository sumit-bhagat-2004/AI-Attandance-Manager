import React from 'react';
import { useAuth, useUser } from '@clerk/nextjs';

export default function DebugAuth() {
    const { isLoaded, isSignedIn, userId } = useAuth();
    const { user } = useUser();

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-cyan-400">
                    🔍 Authentication Debug Page
                </h1>
                
                <div className="space-y-6">
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <h2 className="text-xl font-semibold mb-4 text-white">Auth Status</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Clerk Loaded:</span>
                                <span className={isLoaded ? 'text-green-400' : 'text-red-400'}>
                                    {isLoaded ? '✅ Yes' : '❌ No'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">User Signed In:</span>
                                <span className={isSignedIn ? 'text-green-400' : 'text-red-400'}>
                                    {isSignedIn ? '✅ Yes' : '❌ No'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">User ID:</span>
                                <span className="text-cyan-400 break-all">
                                    {userId || 'Not available'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {user && (
                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                            <h2 className="text-xl font-semibold mb-4 text-white">User Info</h2>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Email:</span>
                                    <span className="text-cyan-400">
                                        {user.emailAddresses?.[0]?.emailAddress || 'Not available'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">First Name:</span>
                                    <span className="text-cyan-400">
                                        {user.firstName || 'Not available'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Last Name:</span>
                                    <span className="text-cyan-400">
                                        {user.lastName || 'Not available'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Created:</span>
                                    <span className="text-cyan-400">
                                        {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'Not available'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <h2 className="text-xl font-semibold mb-4 text-white">Domain Check</h2>
                        <div className="space-y-2 text-sm">
                            {user?.emailAddresses?.[0]?.emailAddress ? (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Email Domain:</span>
                                        <span className="text-cyan-400">
                                            @{user.emailAddresses[0].emailAddress.split('@')[1]}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">AOT Domain Check:</span>
                                        <span className={user.emailAddresses[0].emailAddress.endsWith('@aot.edu.in') ? 'text-green-400' : 'text-red-400'}>
                                            {user.emailAddresses[0].emailAddress.endsWith('@aot.edu.in') ? '✅ Authorized' : '❌ Unauthorized'}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <span className="text-gray-400">No email available</span>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <a 
                            href="/" 
                            className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            Go to Home
                        </a>
                        <a 
                            href="/sign-in" 
                            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            Go to Sign In
                        </a>
                        <a 
                            href="/simple-sign-in" 
                            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            Simple Sign In
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
