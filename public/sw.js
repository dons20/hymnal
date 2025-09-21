const CACHE_NAME = 'hymnal-pwa-v1';
const STATIC_CACHE_NAME = 'hymnal-static-v1';
const DYNAMIC_CACHE_NAME = 'hymnal-dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/launcher-144.png',
  '/launcher-192.png',
  '/launcher-512.png',
  // Add other static assets as needed
];

// Network-first resources (like local JSON data)
const NETWORK_FIRST_PATTERNS = [
  /\/static\/hymns\.json$/,
  /\/api\//
];

// Cache-first resources (like static assets)
const CACHE_FIRST_PATTERNS = [
  /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
  /\.(?:js|css)$/,
  /\/static\//
];

// Block analytics when offline
const ANALYTICS_PATTERNS = [
  /https:\/\/cloud\.umami\.is\/script\.js/,
  /umami/i
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('SW: Installing service worker...');
  
  event.waitUntil(
    (async () => {
      try {
        const staticCache = await caches.open(STATIC_CACHE_NAME);
        // Cache the main app files for offline navigation
        const criticalAssets = ['/', '/index.html', '/manifest.json'];
        await staticCache.addAll(criticalAssets);
        
        // Skip waiting to activate immediately
        self.skipWaiting();
        
        // Notify clients about successful installation
        self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: 'SW_INSTALLED',
              message: 'App cached and ready for offline use!'
            });
          });
        });
      } catch (error) {
        console.error('SW: Failed to cache static assets:', error);
        // Still skip waiting even if caching fails
        self.skipWaiting();
      }
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('SW: Activating service worker...');
  
  event.waitUntil(
    (async () => {
      try {
        // Take control of all clients
        await self.clients.claim();
        
        // Clean up old caches
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME &&
              cacheName.startsWith('hymnal-')
            ) {
              console.log('SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
        
        console.log('SW: Service worker activated');
      } catch (error) {
        console.error('SW: Activation failed:', error);
      }
    })()
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip chrome-extension and other non-http requests
  if (!request.url.startsWith('http')) return;
  
  event.respondWith(
    (async () => {
      try {
        // Block analytics requests when offline
        if (ANALYTICS_PATTERNS.some(pattern => pattern.test(request.url))) {
          if (!navigator.onLine) {
            console.log('SW: Blocking analytics request (offline):', request.url);
            return new Response('', { status: 204 }); // No content response
          }
        }
        
        // For navigation requests, use stale-while-revalidate strategy
        if (request.mode === 'navigate') {
          return await staleWhileRevalidateStrategy(request);
        }
        
        // Network-first strategy for API calls
        if (NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(request.url))) {
          return await networkFirstStrategy(request);
        }
        
        // Cache-first strategy for static assets
        if (CACHE_FIRST_PATTERNS.some(pattern => pattern.test(request.url))) {
          return await cacheFirstStrategy(request);
        }
        
        // Default to network-first for other requests
        return await networkFirstStrategy(request);
        
      } catch (error) {
        console.error('SW: Fetch failed:', error);
        
        // Return offline fallback for navigation requests
        if (request.mode === 'navigate') {
          const staticCache = await caches.open(STATIC_CACHE_NAME);
          const fallback = await staticCache.match('/') || await staticCache.match('/index.html');
          
          if (fallback) {
            console.log('SW: Serving offline fallback for navigation');
            return fallback;
          }
          
          return new Response('App unavailable offline', { 
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
          });
        }
        
        return new Response('Network error', { 
          status: 503,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
    })()
  );
});

// Network-first caching strategy
async function networkFirstStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Clone and cache successful responses
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('SW: Serving from cache (network failed):', request.url);
      return cachedResponse;
    }
    
    // For navigation requests when offline, serve the main app
    if (request.mode === 'navigate') {
      const staticCache = await caches.open(STATIC_CACHE_NAME);
      const mainApp = await staticCache.match('/') || await staticCache.match('/index.html');
      
      if (mainApp) {
        console.log('SW: Serving main app for navigation (offline):', request.url);
        return mainApp;
      }
    }
    
    console.error('SW: No cache available for:', request.url);
    throw error;
  }
}

// Cache-first caching strategy
async function cacheFirstStrategy(request) {
  const staticCache = await caches.open(STATIC_CACHE_NAME);
  const dynamicCache = await caches.open(DYNAMIC_CACHE_NAME);
  
  // Try static cache first
  let cachedResponse = await staticCache.match(request);
  
  // Try dynamic cache if not in static
  if (!cachedResponse) {
    cachedResponse = await dynamicCache.match(request);
  }
  
  if (cachedResponse) {
    console.log('SW: Serving from cache:', request.url);
    return cachedResponse;
  }
  
  // Not in cache, fetch from network
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      dynamicCache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('SW: Network and cache failed for:', request.url);
    throw error;
  }
}

// Stale-while-revalidate caching strategy
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Start fetching from network (don't wait)
  const networkResponse = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => {
    console.log('SW: Network failed for navigation, using cache');
  });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    console.log('SW: Serving stale content:', request.url);
    return cachedResponse;
  }
  
  // Wait for network if no cache
  return await networkResponse;
}

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Sync event for background sync (if needed)
self.addEventListener('sync', (event) => {
  console.log('SW: Background sync:', event.tag);
  
  if (event.tag === 'hymn-data-sync') {
    event.waitUntil(syncHymnData());
  }
});

// Background sync function
async function syncHymnData() {
  try {
    console.log('SW: Syncing hymn data in background...');
    // This could be used to update hymn data when connection is restored
    // Implementation depends on your specific needs
  } catch (error) {
    console.error('SW: Background sync failed:', error);
  }
}