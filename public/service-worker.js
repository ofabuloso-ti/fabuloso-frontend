// public/service-worker.js

const CACHE_NAME = 'fabuloso-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/Aicon-192x192.png',
  '/icons/Aicon-512x512.png',
];

// Instala o SW e salva apenas os arquivos estáticos garantidos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Cache inicial...');
      return cache.addAll(STATIC_ASSETS);
    }),
  );
  self.skipWaiting();
});

// Remove caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Removendo cache antigo:', key);
            return caches.delete(key);
          }
        }),
      ),
    ),
  );
  self.clients.claim();
});

// Estratégia: NETWORK FIRST para tudo que não é estático
self.addEventListener('fetch', (event) => {
  // Não interceptar API para evitar interferência no login/logout
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request)),
  );
});
