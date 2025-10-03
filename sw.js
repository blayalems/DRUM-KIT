// Import the Workbox library from a CDN
importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

// Set a name for the cache
const CACHE_NAME = "virtual-drum-kit-cache-v2";

// Define the assets to be cached immediately upon installation
// This ensures the core app shell is always available offline
const urlsToPrecache = [
    '/',
    'index.html',
    'manifest.json',
    'crash.png',
    'kick.png',
    'snare.png',
    'tom1.png',
    'tom2.png',
    'tom3.png',
    'tom4.png',
    'crash.mp3',
    'kick-bass.mp3',
    'snare.mp3',
    'tom-1.mp3',
    'tom-2.mp3',
    'tom-3.mp3',
    'tom-4.mp3'
];

// Precache all the defined assets
workbox.precaching.precacheAndRoute(urlsToPrecache.map(url => ({
    url: url,
    revision: null // No revision tracking needed for this simple case
})));

// Caching strategy for external assets (CDNs)
// Stale-While-Revalidate: Serve from cache first for speed, then update from network in the background.
workbox.routing.registerRoute(
    ({url}) => url.origin === 'https://cdn.jsdelivr.net' || url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: 'external-assets-cache',
        plugins: [
            new workbox.expiration.ExpirationPlugin({
                maxEntries: 30, // Max number of assets to cache
            }),
        ],
    })
);

// Caching strategy for the app's own assets (images, sounds) if not precached
// Cache First: Once an asset is in the cache, it will be served from there.
workbox.routing.registerRoute(
  ({request}) => request.destination === 'image' || request.destination === 'audio',
  new workbox.strategies.CacheFirst({
    cacheName: 'app-media-cache',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  })
);

// This allows the service worker to take control of the page immediately.
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Clean up old caches during activation
self.addEventListener('activate', event => {
    const currentCaches = [CACHE_NAME, 'external-assets-cache', 'app-media-cache', 'workbox-precache-v2-' + self.location.pathname];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (currentCaches.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

