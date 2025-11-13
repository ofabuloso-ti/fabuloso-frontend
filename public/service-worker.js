// public/service-worker.js
const CACHE_NAME = 'meu-painel-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/App.css',
  '/src/main.jsx',
  '/icons/Aicon-192x192.png',
  '/icons/Aicon-512x512.png',
];

// Durante a instalação, abrir cache e adicionar os arquivos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Cacheando arquivos...');
      return cache.addAll(urlsToCache);
    }),
  );
  self.skipWaiting();
});

// Ativar Service Worker e limpar caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[ServiceWorker] Removendo cache antigo:', cache);
            return caches.delete(cache);
          }
        }),
      ),
    ),
  );
  self.clients.claim();
});

// Interceptar requisições e responder do cache se possível
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
  );
});
