// Svenska Kungen Service Worker
const CACHE_NAME = 'kungen-hoppar-flaggor-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/game.js',
  '/audio.js',
  '/favicon.svg',
  '/favicon.ico'
];

// Installera Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('🇸🇪 Service Worker: Caching app files');
        return cache.addAll(urlsToCache);
      })
  );
});

// Aktivera Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🇸🇪 Service Worker: Clearing old cache');
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Hantera fetch requests
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Returnera cached version eller hämta från nätet
        return response || fetch(event.request);
      }
    )
  );
}); 