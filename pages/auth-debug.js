import { useAuth, useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function AuthDebug() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const info = {
      isLoaded,
      isSignedIn,
      userId: userId || 'null',
      userEmail: user?.emailAddresses?.[0]?.emailAddress || 'null',
      userObject: user ? 'exists' : 'null',
      pathname: router.pathname,
      timestamp: new Date().toISOString()
    };
    
    setDebugInfo(info);
    console.log('🔍 Debug Info:', info);
  }, [isLoaded, isSignedIn, userId, user, router.pathname]);

  const handleGoToDashboard = () => {
    console.log('🏠 Attempting to go to dashboard');
    router.push('/');
  };

  const handleSignOut = () => {
    console.log('🚪 Signing out');
    signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Authentication Debug</h1>
        
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Debug Information</h2>
          <pre className="text-green-400 text-sm bg-black/50 p-4 rounded-lg overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Auth State</h3>
            <div className="space-y-2 text-sm">
              <div className={`flex items-center gap-2 ${isLoaded ? 'text-green-400' : 'text-yellow-400'}`}>
                <span className="w-3 h-3 rounded-full bg-current"></span>
                isLoaded: {isLoaded ? 'true' : 'false'}
              </div>
              <div className={`flex items-center gap-2 ${isSignedIn ? 'text-green-400' : 'text-red-400'}`}>
                <span className="w-3 h-3 rounded-full bg-current"></span>
                isSignedIn: {isSignedIn ? 'true' : 'false'}
              </div>
              <div className={`flex items-center gap-2 ${userId ? 'text-green-400' : 'text-red-400'}`}>
                <span className="w-3 h-3 rounded-full bg-current"></span>
                userId: {userId ? 'exists' : 'null'}
              </div>
            </div>
          </div>

          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">User Info</h3>
            <div className="space-y-2 text-sm">
              <div className="text-gray-300">
                Email: {user?.emailAddresses?.[0]?.emailAddress || 'Not available'}
              </div>
              <div className="text-gray-300">
                Name: {user?.firstName} {user?.lastName}
              </div>
              <div className={`${user?.emailAddresses?.[0]?.emailAddress?.endsWith('@aot.edu.in') ? 'text-green-400' : 'text-red-400'}`}>
                Domain: {user?.emailAddresses?.[0]?.emailAddress?.endsWith('@aot.edu.in') ? 'Authorized' : 'Unauthorized'}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={handleGoToDashboard}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
          
          {isSignedIn && (
            <button 
              onClick={handleSignOut}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg hover:from-red-600 hover:to-red-700 transition-colors"
            >
              Sign Out
            </button>
          )}
          
          <button 
            onClick={() => router.push('/sign-in')}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-purple-700 transition-colors"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
