const CACHE_NAME = 'edutrack-ai-v1.0.4';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/offline.html',
  // Icons - all sizes
  '/icons/icon-16x16.png',
  '/icons/icon-32x32.png',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-180x180.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg',
  // Core pages
  '/sign-in',
  '/sign-up',
  '/user-manual',
  '/quick-reference',
  '/unauthorized',
  // Critical CSS
  '/_next/static/css/app.css',
  // Core JavaScript chunks (these will be dynamically cached)
  '/_next/static/chunks/main.js',
  '/_next/static/chunks/webpack.js',
  '/_next/static/chunks/framework.js'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('EduTrack AI Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Cache addAll failed:', error);
      })
  );
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('EduTrack AI Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Claim clients immediately
  self.clients.claim();
  
  // Notify clients of the update
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({ type: 'SW_UPDATED' });
    });
  });
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip requests to external APIs (Clerk, MongoDB, Gemini)
  if (event.request.url.includes('clerk.') || 
      event.request.url.includes('mongodb.') ||
      event.request.url.includes('googleapis.') ||
      event.request.url.includes('generativelanguage.googleapis.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          console.log('Serving from cache:', event.request.url);
          return response;
        }

        // Important: Clone the request because it's a stream
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Important: Clone the response because it's a stream
          const responseToCache = response.clone();

          // Cache strategy based on request type
          const url = event.request.url;
          const shouldCache = 
            // Cache all static assets
            url.includes('/_next/static/') ||
            // Cache page routes
            url.match(/\/(user-manual|quick-reference|unauthorized)$/) ||
            // Cache CSS files
            url.endsWith('.css') ||
            // Cache font files
            url.match(/\.(woff|woff2|eot|ttf|otf)$/) ||
            // Cache images
            url.match(/\.(png|jpg|jpeg|gif|svg|ico|webp)$/) ||
            // Don't cache API responses except for critical ones
            (!url.includes('/api/') || 
             url.includes('/api/auth') ||
             url.includes('/api/data'));

          if (shouldCache) {
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              })
              .catch((error) => {
                console.log('Failed to cache:', url, error);
              });
          }

          return response;
        }).catch((error) => {
          console.log('Fetch failed for:', event.request.url, error);
          
          // Offline fallback strategies
          if (event.request.mode === 'navigate') {
            // Return offline page for navigation requests
            return caches.match('/offline.html');
          } else if (event.request.destination === 'image') {
            // Return a default icon for images
            return caches.match('/icons/icon-192x192.png');
          } else if (event.request.url.endsWith('.txt')) {
            // Return cached text files or offline message
            return new Response('This content is not available offline.', {
              status: 200,
              statusText: 'OK',
              headers: {
                'Content-Type': 'text/plain'
              }
            });
          } else if (event.request.url.includes('/user-manual') || 
                     event.request.url.includes('/quick-reference')) {
            // Return offline page for documentation
            return caches.match('/offline.html');
          }
          
          // Default fallback
          return new Response('Network error occurred', {
            status: 408,
            statusText: 'Request Timeout'
          });
        });
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from EduTrack AI',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-96x96.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('EduTrack AI', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received:', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'attendance-sync') {
    event.waitUntil(
      // Sync attendance data when connection is restored
      syncAttendanceData()
    );
  }
});

// Sync attendance data function
async function syncAttendanceData() {
  try {
    // Get stored attendance data from IndexedDB
    const storedData = await getStoredAttendanceData();
    
    if (storedData.length > 0) {
      // Send to server
      await fetch('/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'syncOfflineData',
          payload: storedData
        })
      });
      
      // Clear stored data after successful sync
      await clearStoredAttendanceData();
      
      console.log('Attendance data synced successfully');
    }
  } catch (error) {
    console.error('Failed to sync attendance data:', error);
  }
}

// Helper functions for IndexedDB operations
async function getStoredAttendanceData() {
  // Implement IndexedDB read operations
  return [];
}

async function clearStoredAttendanceData() {
  // Implement IndexedDB clear operations
  return true;
}

// Message event handler for communication with clients
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    // Skip the waiting phase and activate immediately
    self.skipWaiting();
  }
});
