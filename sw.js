// ==========================================================================
// FOODIES POINT SERVICE WORKER (v55 - NATIVE WEB PUSH LISTENER)
// ==========================================================================
const CACHE_NAME = 'fp-cache-v55';

const ASSETS_TO_CACHE = [
  '/foodies-point-beta/',
  '/foodies-point-beta/index.html?v=55',
  '/foodies-point-beta/app.js?v=55',
  '/foodies-point-beta/manifest.json?v=55',
  '/foodies-point-beta/icon.png'
];

self.addEventListener('install', (event) => {
  console.log('[SW v55] Installing new service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW v55] Activating & wiping old caches...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('push', (event) => {
  console.log('[SW v55] Native Push Event Received:', event);

  let data = { title: "Foodies Point 🍛", body: "Today's live menu is updated!" };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/foodies-point-beta/icon.png',
    badge: '/foodies-point-beta/icon.png',
    vibrate: [100, 50, 100],
    data: { url: '/foodies-point-beta/' }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/foodies-point-beta/')
  );
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  if (event.request.mode === 'navigate' || requestUrl.pathname.endsWith('.js') || requestUrl.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return networkResponse;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request);
      })
    );
  }
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
