import { useAuth, useUser } from '@clerk/nextjs';

export default function AuthStatus() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { user } = useUser();

  if (!isLoaded) {
    return <div className="p-4 text-center">Loading authentication...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Authentication Status</h1>
        
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Status</h3>
              <div className="space-y-2 text-sm">
                <div className={`flex items-center gap-2 ${isSignedIn ? 'text-green-400' : 'text-red-400'}`}>
                  <span className="w-3 h-3 rounded-full bg-current"></span>
                  {isSignedIn ? 'Signed In' : 'Not Signed In'}
                </div>
                <div className="text-gray-300">
                  User ID: {userId || 'None'}
                </div>
              </div>
            </div>

            {user && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">User Info</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <div>Name: {user.firstName} {user.lastName}</div>
                  <div>Email: {user.emailAddresses[0]?.emailAddress}</div>
                  <div className={user.emailAddresses[0]?.emailAddress?.endsWith('@aot.edu.in') ? 'text-green-400' : 'text-red-400'}>
                    Domain: {user.emailAddresses[0]?.emailAddress?.endsWith('@aot.edu.in') ? 'Authorized' : 'Unauthorized'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="text-center space-x-4">
          <a 
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-colors"
          >
            Go to Dashboard
          </a>
          <a 
            href="/sign-in"
            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-purple-700 transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
