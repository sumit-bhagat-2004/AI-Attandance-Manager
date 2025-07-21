import '../styles/globals.css';
import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { ClerkProvider } from '@clerk/nextjs';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Register service worker for PWA
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
            
            // Check for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New content is available, show update notification
                    if (confirm('New version available! Reload to update?')) {
                      window.location.reload();
                    }
                  }
                });
              }
            });
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }

    // Handle PWA installation events
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      deferredPrompt = e;
      
      // Store the event for custom install button
      window.deferredPrompt = deferredPrompt;
    });

    window.addEventListener('appinstalled', () => {
      console.log('EduTrack AI was installed');
      // Hide install button
      window.deferredPrompt = null;
    });

    // Handle online/offline events
    const handleOnline = () => {
      console.log('App is online');
      // Trigger background sync if needed
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        navigator.serviceWorker.ready.then((registration) => {
          return registration.sync.register('attendance-sync');
        });
      }
    };

    const handleOffline = () => {
      console.log('App is offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      afterSignInUrl="/"
      afterSignUpUrl="/"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      <Component {...pageProps} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(17, 24, 39, 0.95)',
            color: 'white',
            border: '1px solid rgba(75, 85, 99, 0.3)',
            borderRadius: '12px',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: 'white',
            },
            style: {
              border: '1px solid rgba(16, 185, 129, 0.3)',
              background: 'rgba(5, 46, 22, 0.95)',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#EF4444',
              secondary: 'white',
            },
            style: {
              border: '1px solid rgba(239, 68, 68, 0.3)',
              background: 'rgba(69, 10, 10, 0.95)',
            },
          },
          loading: {
            iconTheme: {
              primary: '#3B82F6',
              secondary: 'white',
            },
            style: {
              border: '1px solid rgba(59, 130, 246, 0.3)',
              background: 'rgba(12, 74, 110, 0.95)',
            },
          },
        }}
      />
    </ClerkProvider>
  );
}

export default MyApp;
