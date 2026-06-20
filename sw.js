// ==========================================================================
// FOODIES POINT - SERVICE WORKER (NETWORK-FIRST EVOLUTION V9)
// ==========================================================================

const CACHE_NAME = 'foodies-cache-v10';

const ASSETS = [
  '',
  'index.html?v=2',
  'app.js',
  'manifest.json',
  'icon.png'
];

// Instantly install and prepare the worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('PWA Cache Engine V9: Pre-loading system assets');
                return cache.addAll(ASSETS);
            })
            .then(() => self.skipWaiting()) // Forces this worker to become active instantly
    );
});

// Purge old versions (v8 and below) out of the phone's memory database
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('PWA Cache Engine V9: Deleting old cache layer:', key);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Takes control of open app pages instantly
    );
});

// 🚀 FIXED: Network-First Caching Strategy
self.addEventListener('fetch', (event) => {
    if (!event.request.url.startsWith(self.location.origin)) {
        return; 
    }

    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // If online, grab the fresh file from GitHub and silently update local storage
                if (networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            })
            .catch(() => {
                // If offline or GitHub fails, gracefully fall back to the saved cache
                return caches.match(event.request);
            })
    );
});
