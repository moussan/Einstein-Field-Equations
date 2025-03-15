// This service worker can be customized!
// See https://developers.google.com/web/tools/workbox/modules
// for the list of available Workbox modules, or add any other
// code you'd like.

const CACHE_NAME = 'einstein-equations-cache-v1';
const API_CACHE_NAME = 'einstein-equations-api-cache-v1';
const STATIC_CACHE_NAME = 'einstein-equations-static-cache-v1';

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/0.chunk.js',
  '/static/js/bundle.js',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log('Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  
  // Activate the new service worker immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME, API_CACHE_NAME, STATIC_CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Claim clients so the service worker is in control immediately
  self.clients.claim();
});

// Helper function to determine if a request is an API request
const isApiRequest = (url) => {
  return (
    url.pathname.startsWith('/api/') || 
    url.pathname.includes('supabase') ||
    url.pathname.includes('functions/v1')
  );
};

// Helper function to determine if a request is a static asset
const isStaticAsset = (url) => {
  return (
    url.pathname.startsWith('/static/') ||
    url.pathname.startsWith('/assets/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.json')
  );
};

// Helper function to determine if a request is an HTML navigation
const isHtmlNavigation = (request) => {
  return (
    request.mode === 'navigate' ||
    (request.method === 'GET' &&
      request.headers.get('accept').includes('text/html'))
  );
};

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }
  
  // Handle API requests
  if (isApiRequest(url)) {
    event.respondWith(handleApiRequest(event.request));
    return;
  }
  
  // Handle static assets
  if (isStaticAsset(url)) {
    event.respondWith(handleStaticAsset(event.request));
    return;
  }
  
  // Handle HTML navigation requests
  if (isHtmlNavigation(event.request)) {
    event.respondWith(handleHtmlNavigation(event.request));
    return;
  }
  
  // Default strategy - network first, fallback to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache a copy of the response
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        
        return response;
      })
      .catch(() => {
        // If network fails, try to serve from cache
        return caches.match(event.request);
      })
  );
});

// Handle API requests - network first, then cache
async function handleApiRequest(request) {
  // For POST requests, don't use cache
  if (request.method !== 'GET') {
    try {
      return await fetch(request);
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Network error, please try again later' }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }
  
  try {
    // Try network first
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.ok) {
      const responseClone = response.clone();
      const cache = await caches.open(API_CACHE_NAME);
      await cache.put(request, responseClone);
    }
    
    return response;
  } catch (error) {
    // If network fails, try to serve from cache
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If not in cache, return a JSON error
    return new Response(
      JSON.stringify({ error: 'You are offline and this data is not cached' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle static assets - cache first, then network
async function handleStaticAsset(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Return from cache immediately
    // But also update cache in the background
    fetch(request)
      .then((response) => {
        if (response.ok) {
          caches.open(STATIC_CACHE_NAME).then((cache) => {
            cache.put(request, response);
          });
        }
      })
      .catch(() => {
        // Ignore network errors for background updates
      });
    
    return cachedResponse;
  }
  
  // If not in cache, fetch from network and cache
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const responseClone = response.clone();
      const cache = await caches.open(STATIC_CACHE_NAME);
      await cache.put(request, responseClone);
    }
    
    return response;
  } catch (error) {
    // If both cache and network fail, return a fallback
    if (request.url.includes('.png') || request.url.includes('.jpg')) {
      return caches.match('/logo192.png');
    }
    
    // For other assets, just propagate the error
    throw error;
  }
}

// Handle HTML navigation - network first, then cache, then fallback
async function handleHtmlNavigation(request) {
  try {
    // Try network first
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.ok) {
      const responseClone = response.clone();
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, responseClone);
    }
    
    return response;
  } catch (error) {
    // If network fails, try to serve from cache
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If not in cache, try to serve the offline page
    return caches.match('/index.html');
  }
}

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_API_CACHE') {
    caches.delete(API_CACHE_NAME).then(() => {
      console.log('API cache cleared');
    });
  }
}); 