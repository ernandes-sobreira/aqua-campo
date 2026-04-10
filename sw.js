// =====================================================
// AQUA-CAMPO — Service Worker
// Estratégia: Cache-First para assets, offline completo
// Versão: 1.0
// =====================================================

const CACHE_NAME = 'aquacampo-v1';
const CACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  // Fontes do Google (cached na primeira visita)
  'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap'
];

// ===== INSTALL: pre-cacheia todos os assets =====
self.addEventListener('install', event => {
  console.log('[SW] Instalando AQUA-CAMPO v1...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Cacheando assets principais...');
        // Cache o index.html e manifest com prioridade
        // Fontes externas podem falhar — não bloqueia a instalação
        return cache.addAll(['./', './index.html', './manifest.json'])
          .then(() => {
            // Tenta cachear fontes mas não falha se não tiver internet
            cache.addAll(CACHE_URLS.filter(u => u.startsWith('https://'))).catch(() => {});
          });
      })
      .then(() => {
        console.log('[SW] Instalado com sucesso!');
        return self.skipWaiting(); // ativa imediatamente
      })
  );
});

// ===== ACTIVATE: limpa caches antigos =====
self.addEventListener('activate', event => {
  console.log('[SW] Ativando...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[SW] Removendo cache antigo:', key);
            return caches.delete(key);
          })
      )
    ).then(() => {
      console.log('[SW] Ativo — controlando todas as abas');
      return self.clients.claim();
    })
  );
});

// ===== FETCH: Cache-First com fallback para rede =====
self.addEventListener('fetch', event => {
  // Ignora requisições que não são GET
  if (event.request.method !== 'GET') return;

  // Ignora extensões de browser e chrome-extension
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Encontrou no cache — retorna imediatamente (funciona offline)
          // Em background, tenta atualizar o cache se houver rede
          fetch(event.request)
            .then(networkResponse => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(event.request, networkResponse.clone());
                });
              }
            })
            .catch(() => {}); // sem rede — silencioso
          return cachedResponse;
        }

        // Não está no cache — busca na rede
        return fetch(event.request)
          .then(networkResponse => {
            // Cacheia para uso futuro offline
            if (networkResponse && networkResponse.status === 200 && networkResponse.type !== 'opaque') {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Sem rede e sem cache — retorna página offline de emergência
            if (event.request.destination === 'document') {
              return caches.match('./index.html');
            }
          });
      })
  );
});

// ===== SYNC: notifica atualização disponível =====
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
