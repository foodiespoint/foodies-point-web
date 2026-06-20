// ==========================================================================
// FOODIES POINT - SERVICE WORKER (PRODUCTION ENGINE V7)
// ==========================================================================

const CACHE_NAME = 'foodies-cache-v9';

// Core asset paths mapped directly to your GitHub repository layout
const ASSETS = [
  '',
  'index.html?v=2',
  'app.js',
  'manifest.json',
  'icon.png'
];

// 1. INSTALL EVENT: Pre-caches production workspace layout shell assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('PWA Cache Engine: Caching pristine system assets');
                return cache.addAll(ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// 2. ACTIVATE EVENT: Instantly purges outdated version files (v6 and below)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('PWA Cache Engine: Purging legacy cache layout layer:', key);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. FETCH EVENT: Seamlessly intercepts and serves UI files locally from cache
self.addEventListener('fetch', (event) => {
    // Exclude third-party cross-origin network strings (like real-time Firebase tracking nodes)
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request);
        })
    );
});
