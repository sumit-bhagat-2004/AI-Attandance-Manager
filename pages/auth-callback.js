import React, { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/router';

export default function AuthCallback() {
    const { isLoaded, isSignedIn } = useAuth();
    const { user } = useUser();
    const router = useRouter();

    useEffect(() => {
        console.log('🔄 Auth callback triggered');
        
        if (isLoaded) {
            if (isSignedIn && user) {
                const email = user.emailAddresses?.[0]?.emailAddress;
                console.log('📧 Post-login email check:', email);
                
                if (email && email.endsWith('@aot.edu.in')) {
                    console.log('✅ Valid AOT email, redirecting to dashboard');
                    router.replace('/');
                } else {
                    console.log('❌ Invalid email domain, redirecting to unauthorized');
                    router.replace('/unauthorized');
                }
            } else {
                console.log('❌ Not signed in, redirecting to sign-in');
                router.replace('/sign-in');
            }
        }
    }, [isLoaded, isSignedIn, user, router]);

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="text-center text-white">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-6"></div>
                <h2 className="text-xl font-semibold mb-2">Processing Login</h2>
                <p className="text-gray-400">Please wait while we verify your account...</p>
            </div>
        </div>
    );
}
