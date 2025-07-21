import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/router';

export default function AuthTest() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  console.log('🔍 AuthTest - Auth state:', { isLoaded, isSignedIn, userId: userId || 'null' });

  if (!isLoaded) {
    return <div className="p-8 text-center">Loading auth...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8">
      <div className="max-w-2xl mx-auto bg-black/30 backdrop-blur-sm rounded-xl p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Authentication Test</h1>
        
        <div className="space-y-4 text-white">
          <div>
            <strong>Is Loaded:</strong> {isLoaded ? '✅ Yes' : '❌ No'}
          </div>
          <div>
            <strong>Is Signed In:</strong> {isSignedIn ? '✅ Yes' : '❌ No'}
          </div>
          <div>
            <strong>User ID:</strong> {userId || 'Not available'}
          </div>
          <div>
            <strong>Email:</strong> {user?.emailAddresses?.[0]?.emailAddress || 'Not available'}
          </div>
          <div>
            <strong>Name:</strong> {user?.firstName} {user?.lastName}
          </div>
        </div>

        <div className="mt-6 space-x-4">
          <button 
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
          <button 
            onClick={() => router.push('/sign-in')}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
