// ==========================================================================
// FOODIES POINT - SERVICE WORKER (GITHUB PAGES COMPATIBLE)
// ==========================================================================

const CACHE_NAME = 'foodies-cache-v4';

// Relative path tracking loops targeting subfolder directory isolation
const ASSETS = [
  './',
  './index.html?v=2',
  './app.js',
  './manifest.json',
  './icon.png'
];

// 1. INSTALL EVENT: Pre-caches core assets relative to repository subfolder
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('PWA Cache Engine: Caching repository layout assets');
                return cache.addAll(ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// 2. ACTIVATE EVENT: Purges legacy cache layers across version transitions
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('PWA Cache Engine: Clearing obsolete cache layer:', key);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. FETCH EVENT: Intercepts network asset compilation loops locally
self.addEventListener('fetch', (event) => {
    // Skip cross-origin Firebase tracking streaming calls
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
