// SuperOne Market service worker
// Strategy: "network-first" for the app page so updates appear automatically,
// with a cache fallback so it still works fully offline.
//
// How updates work now:
//  - When online, the app always tries to fetch the newest version first.
//  - The fresh copy is cached for offline use.
//  - If offline, the last cached copy is served.
// This means pushing a new index.html to GitHub shows up on next open,
// with no manual cache-clearing or re-adding the home screen icon.

const CACHE_NAME = 'superone-market-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Network-first: always try to get the latest, fall back to cache when offline.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
