import React, { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/router';
import Dashboard from '../components/Dashboard';

export default function Home() {
    const { isLoaded, isSignedIn } = useAuth();
    const { user } = useUser();
    const router = useRouter();

    useEffect(() => {
        console.log('🏠 Home page mounted');
        console.log('📊 Auth state:', { isLoaded, isSignedIn, hasUser: !!user });
    }, [isLoaded, isSignedIn, user]);

    // Show loading while Clerk is initializing
    if (!isLoaded) {
        return (
            <div className="bg-gray-900 h-screen flex items-center justify-center text-white">
                <div className="text-center">
                    <div className="relative mb-6">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto"></div>
                        <div className="absolute inset-0 rounded-full h-16 w-16 border-2 border-cyan-400/20 mx-auto"></div>
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Loading EduTrack AI</h2>
                    <p className="text-gray-400">Initializing authentication...</p>
                </div>
            </div>
        );
    }

    // Redirect to sign-in if not authenticated
    if (!isSignedIn) {
        console.log('🔄 User not signed in, redirecting to sign-in page');
        // Use replace to avoid back button issues
        router.replace('/sign-in');
        return (
            <div className="bg-gray-900 h-screen flex items-center justify-center text-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                    <p className="text-gray-400">Redirecting to sign-in...</p>
                </div>
            </div>
        );
    }

    // Check email domain
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;
    console.log('📧 User email:', userEmail);
    
    if (userEmail && !userEmail.endsWith('@aot.edu.in')) {
        console.log('🚫 Unauthorized email domain, redirecting to unauthorized page');
        router.replace('/unauthorized');
        return (
            <div className="bg-gray-900 h-screen flex items-center justify-center text-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-400 mx-auto mb-4"></div>
                    <p className="text-gray-400">Checking authorization...</p>
                </div>
            </div>
        );
    }

    // Get the username from the email (part before @) and full name
    const currentUser = userEmail ? userEmail.split('@')[0] : 'User';
    const userFullName = user?.fullName || user?.firstName || currentUser;
    const userProfilePicture = user?.imageUrl || user?.profileImageUrl || null;
    console.log('👤 Current user:', currentUser, 'Full name:', userFullName, 'Profile picture:', userProfilePicture);

    const handleLogout = () => {
        console.log('🚪 Logging out user');
        // Clerk handles logout automatically
        router.push('/sign-in');
    };

    console.log('✅ Rendering Dashboard for authenticated user');
    return <Dashboard currentUser={currentUser} userFullName={userFullName} userProfilePicture={userProfilePicture} onLogout={handleLogout} />;
}
