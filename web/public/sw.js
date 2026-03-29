/* OurGame Service Worker - Push Notifications & PWA Support */
const CACHE_NAME = 'our-game-v1';
const OFFLINE_URL = '/';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([OFFLINE_URL]);
    }).catch((err) => {
      console.warn('Service worker install: failed to cache offline URL', err);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

/**
 * Handle push events from the server.
 * Payload JSON shape:
 * {
 *   title: string,
 *   body: string,
 *   icon?: string,
 *   badge?: string,
 *   url?: string,   // deep link path e.g. "/notifications" or a full route
 *   tag?: string,   // notification tag for deduplication
 *   data?: object   // arbitrary extra data
 * }
 */
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'OurGame', body: event.data.text() };
  }

  const title = payload.title || 'OurGame';
  const options = {
    body: payload.body || '',
    icon: payload.icon || '/icons/icon-192x192.png',
    badge: payload.badge || '/icons/icon-96x96.png',
    tag: payload.tag || 'our-game-notification',
    data: {
      url: payload.url || '/notifications',
      ...(payload.data || {}),
    },
    requireInteraction: false,
    silent: false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

/**
 * Handle notification click - navigate to deep link URL.
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url)
    ? event.notification.data.url
    : '/notifications';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // If there is already a window open, focus it and navigate
        for (const client of windowClients) {
          if ('focus' in client) {
            client.focus();
            if ('navigate' in client) {
              return client.navigate(targetUrl);
            }
            return;
          }
        }
        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

/**
 * Fetch handler - network first, falling back to cache for navigation requests.
 */
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
  }
});
