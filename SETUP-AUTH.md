/* Psyche v21 — offline-first service worker */
const CACHE = 'psyche-v21-1';
const ASSETS = [
  './', './index.html', './app.js', './cloud.js', './config.js', './r.html',
  './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png'
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) =>
    Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
  ).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // never intercept Supabase / CDN
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => { try { c.put(e.request, copy); } catch (x) {} });
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
