// SipSweet Lamia Service Worker
// Handles push notifications and offline caching

const CACHE_NAME = 'sipsweet-lamia-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  // Add other static assets as needed
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Claim all clients immediately
  self.clients.claim();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  let data = {};
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'SipSweet Lamia', body: event.data.text() };
    }
  }

  const options = {
    body: data.body || 'Time for a sip, Princess! 🌸',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'hydration-reminder',
    renotify: true,
    requireInteraction: false,
    silent: false,
    data: {
      url: '/',
      timestamp: Date.now(),
      ...data.data
    },
    actions: [
      {
        action: 'sip',
        title: '💧 Log Sip',
        icon: '/icons/sip-action.png'
      },
      {
        action: 'dismiss',
        title: '⏰ Remind Later',
        icon: '/icons/dismiss-action.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || 'SipSweet Lamia 🌸',
      options
    )
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'sip') {
    // Handle sip action - open app and log sip
    event.waitUntil(
      clients.openWindow('/?action=sip')
    );
  } else if (event.action === 'dismiss') {
    // Handle dismiss action - just close notification
    return;
  } else {
    // Default click - open the app
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url === self.location.origin + '/' && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open new window
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Sync offline data when connection is restored
      syncOfflineData()
    );
  }
});

async function syncOfflineData() {
  // This would sync any offline logged sips to the server
  // Implementation depends on your offline storage strategy
  try {
    // Get offline data from IndexedDB or localStorage
    // Send to server
    // Clear offline data on success
  } catch (error) {
    // Handle sync errors
  }
}
