// =====================================================
// AQUA-CAMPO — Service Worker
// Estrategia: Network-First para o app (atualizacoes chegam),
//             Cache como fallback (offline completo garantido)
// Versao: 3.0 — Plataforma Nacional
// =====================================================

const CACHE_NAME = 'aquacampo-v3-nacional-q21';
const CACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap'
];

// ===== INSTALL =====
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(['./', './index.html', './manifest.json'])
          .then(() => {
            cache.addAll(CACHE_URLS.filter(u => u.startsWith('https://'))).catch(() => {});
          });
      })
      .then(() => self.skipWaiting())
  );
});

// ===== ACTIVATE: limpa TODOS os caches antigos =====
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ===== FETCH =====
// index.html e navegacao: NETWORK-FIRST (pega versao nova quando online)
// demais assets: cache-first com atualizacao em background
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  const isDocument = event.request.mode === 'navigate' ||
    event.request.destination === 'document' ||
    event.request.url.endsWith('/index.html') ||
    event.request.url.endsWith('/aqua-campo/');

  if (isDocument) {
    // NETWORK-FIRST: sempre tenta a versao mais nova; offline usa cache
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // Assets: cache-first + revalidacao em background
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type !== 'opaque') {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);
      return cachedResponse || fetchPromise;
    })
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
