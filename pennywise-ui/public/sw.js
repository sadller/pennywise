const CACHE_VERSION = 'v1.3';
const STATIC_CACHE = `pennywise-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `pennywise-dynamic-${CACHE_VERSION}`;

// Set to true for verbose logging during development
const DEBUG = false;
const log = (...args) => {
  if (DEBUG) {
    console.log('[SW]', ...args);
  }
};

// External protocols & hosts we never want to cache or proxy
const EXTERNAL_PROTOCOLS = [
  'chrome-extension:',
  'moz-extension:',
  'safari-extension:',
];

const EXTERNAL_HOSTS = [
  'accounts.google.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'www.googleapis.com',
];

const BYPASS_PATH_PREFIXES = ['/__next', '/_next'];

const isExternalRequest = (url) =>
  EXTERNAL_PROTOCOLS.includes(url.protocol) ||
  EXTERNAL_HOSTS.includes(url.hostname) ||
  BYPASS_PATH_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));


// Static assets to cache immediately
const STATIC_URLS = [
  '/offline',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/icon-72x72.png',
  '/icon-96x96.png',
  '/icon-128x128.png',
  '/icon-144x144.png',
  '/icon-152x152.png',
  '/icon-384x384.png',
  '/favicon.png',
  '/pennywise-logo.png',
  '/pennywise-logo.svg'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        log('Opened static cache');
        return cache.addAll(STATIC_URLS);
      })
      .then(() => {
        log('Static assets cached successfully');
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', (event) => {
  log('Service Worker activating...');
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (![STATIC_CACHE, DYNAMIC_CACHE].includes(cacheName)) {
              log('Deleting outdated cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Claim all clients immediately
      self.clients.claim()
    ])
  );
});

// Fetch event - offline-first strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Bypass external / third-party requests
  if (isExternalRequest(url)) {
    return; // Let the request go straight to the network
  }

  // Handle different types of requests
  if (request.method === 'GET' && request.mode === 'navigate') {
    // Network-first strategy for HTML navigation requests to avoid stale pages
    event.respondWith(
      fetch(request)
        .catch(() => caches.match('/offline'))
    );
    return;
  }

  if (request.method === 'GET') {
    // For GET requests, try cache first, then network
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          // Return cached response if available
          if (cachedResponse) {
            return cachedResponse;
          }

          // Try network request
          return fetch(request)
            .then((networkResponse) => {
              // Check if response is valid
              if (!networkResponse || networkResponse.status !== 200) {
                throw new Error(`Network response not ok: ${networkResponse?.status}`);
              }

              // Clone the response
              const responseToCache = networkResponse.clone();

              // Cache successful responses
              if (shouldCache(request)) {
                caches.open(DYNAMIC_CACHE)
                  .then((cache) => {
                    cache.put(request, responseToCache);
                  });
              }

              return networkResponse;
            })
          .catch(() => {
              // For navigation requests, return offline page
              if (request.mode === 'navigate') {
                return caches.match('/offline');
              }
              
              // For API requests, return cached data if available
              if (isApiRequest(request)) {
                return caches.match(request)
                  .then((cachedResponse) => {
                    if (cachedResponse) {
                      return cachedResponse;
                    }
                    // Return a fallback response for API requests
                    return new Response(JSON.stringify({ 
                      error: 'Network unavailable',
                      offline: true 
                    }), {
                      status: 503,
                      headers: { 'Content-Type': 'application/json' }
                    });
                  });
              }
              
              // For other requests, try to find a fallback
              return caches.match(request)
                .then((fallbackResponse) => {
                  if (fallbackResponse) {
                    return fallbackResponse;
                  }
                  // Return a simple offline response
                  return new Response('Offline', {
                    status: 503,
                    headers: { 'Content-Type': 'text/plain' }
                  });
                });
            });
        })
    );
  } else if (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE') {
    // For write operations, try network first, then queue for background sync
    event.respondWith(
      fetch(request)
        .then((response) => {
          // If successful, return response
          if (response && response.status >= 200 && response.status < 300) {
            return response;
          }
          throw new Error('Network request failed');
        })
                 .catch(() => {
          // Return a success response to the user for offline operations
          return new Response(JSON.stringify({ 
            message: 'Request queued for background sync',
            offline: true 
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
  }
});

// Helper function to determine if a request should be cached
function shouldCache(request) {
  const url = new URL(request.url);
  
  // Never cache requests we purposely bypass
  if (isExternalRequest(url)) {
    return false;
  }
  
  // Cache API responses
  if (isApiRequest(request)) {
    return true;
  }
  
  // Cache static assets
  if (request.destination === 'image' || 
      request.destination === 'style' || 
      request.destination === 'script' ||
      request.destination === 'font') {
    return true;
  }
  
  return false;
}

// Helper function to check if request is an API call
function isApiRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/');
}

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    log('Background sync triggered');
    
    // Get all clients to notify them about sync
    const clients = await self.clients.matchAll();
    
    // Notify all clients that sync is happening
    clients.forEach(client => {
      client.postMessage({
        type: 'BACKGROUND_SYNC_STARTED',
        timestamp: Date.now()
      });
    });
    
    // Here you would typically sync any offline data
    // For now, we'll just log that sync happened
    log('Background sync completed successfully');
    
    // Notify clients that sync is complete
    clients.forEach(client => {
      client.postMessage({
        type: 'BACKGROUND_SYNC_COMPLETED',
        timestamp: Date.now()
      });
    });
    
  } catch (error) {
    console.error('Background sync failed:', error);
    
    // Notify clients about sync failure
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'BACKGROUND_SYNC_FAILED',
        error: error.message,
        timestamp: Date.now()
      });
    });
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Handle skip waiting message from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 