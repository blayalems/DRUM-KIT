const CACHE_NAME = 'virtual-drum-kit-cache-v1';
const urlsToCache = [
    '/',
    'index.html',
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
    'tom-4.mp3',
    'site.webmanifest',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
    'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js'
];

// Install the service worker and cache all the app's assets.
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Intercept fetch requests and serve from the cache if available.
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                // Otherwise, fetch from the network
                return fetch(event.request);
            }
        )
    );
});

// Clean up old caches when the service worker is activated.
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});