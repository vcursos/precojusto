// Root-scoped Service Worker (controls entire site)
// Keep this file at the site root to ensure scope='/' in all browsers, including iOS Safari
// Version bump to force updates on clients
const CACHE_NAME = 'precomercado-v6';
const APP_SHELL = [
  '/',
  '/index.html',
  '/produto.html',
  '/admin.html',
  '/manifest.json',
  '/offline.html',
  '/css/style.css',
  '/css/style-admin.css',
  '/js/script.js',
  '/js/admin.js',
  '/js/firebase-loader.js',
  '/js/firebase-init.js',
  '/images/icons/maskable-icon.svg',
  '/images/cabecalho.png'
];

const RUNTIME_CACHE = 'runtime-precomercado';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME && k !== RUNTIME_CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

// Support manual SKIP_WAITING from page
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Network-first for documents; cache-first for app shell; SWR for images/fonts
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== 'GET' || url.protocol.startsWith('chrome')) return;

  if (req.destination === 'document') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req, { cache: 'no-store' });
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, fresh.clone());
        return fresh;
      } catch (err) {
        const cached = await caches.match(req);
        return cached || caches.match('/offline.html');
      }
    })());
    return;
  }

  if (APP_SHELL.some(p => url.pathname === p)) {
    event.respondWith(
      caches.match(req).then(res => res || fetch(req).then(fresh => {
        return caches.open(CACHE_NAME).then(c => { c.put(req, fresh.clone()); return fresh; });
      }))
    );
    return;
  }

  if (req.destination === 'image' || req.destination === 'font' || url.hostname.includes('googleapis.com')) {
    event.respondWith((async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      const cached = await cache.match(req);
      const fetched = fetch(req).then(resp => { cache.put(req, resp.clone()); return resp; }).catch(() => null);
      return cached || fetched || cached;
    })());
    return;
  }

  event.respondWith((async () => {
    try { return await fetch(req); } catch { return await caches.match(req) || caches.match('/offline.html'); }
  })());
});
