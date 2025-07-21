const CACHE_NAME = 'edutrack-ai-v1.0.2';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-16x16.png',
  '/icons/icon-32x32.png',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-180x180.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  // Core pages
  '/sign-in',
  '/sign-up'
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
  self.clients.claim();
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
        // Return cached version or fetch from network
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

          // Don't cache API responses except for static data
          if (!event.request.url.includes('/api/') || 
              event.request.url.includes('/api/auth') ||
              event.request.url.includes('/api/data')) {
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
          }

          return response;
        }).catch(() => {
          // Return offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
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
