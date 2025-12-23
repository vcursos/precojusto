// service-worker.js
// Versão de cache atualizada para incluir novos ícones PWA
const CACHE_NAME = 'precomercado-v4'; // bump version when changing strategy or assets
const APP_SHELL = [
    '/',
    '/index.html',
    '/produto.html',
    '/admin.html',
    '/manifest.json',
    '/offline.html',
    '/css/style.css',
    '/css/admin.css',
    '/js/script.js',
    '/js/firebase-loader.js',
    '/js/firebase-init.js',
    // Ícones essenciais para instalação / home screen
    '/images/icons/maskable-icon.svg',
    '/images/cabecalho.png'
];

// Runtime cache patterns (fonts, images, external libs)
const RUNTIME_CACHE = 'runtime-precomercado';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        (async () => {
            const keys = await caches.keys();
            await Promise.all(keys.filter(k => k !== CACHE_NAME && k !== RUNTIME_CACHE).map(k => caches.delete(k)));
            await self.clients.claim();
        })()
    );
});

// Network-first for HTML to get fresh content; cache-first for static assets.
self.addEventListener('fetch', (event) => {
    const req = event.request;
    const url = new URL(req.url);

    // Ignore non-GET and chrome-extension requests
    if (req.method !== 'GET' || url.protocol.startsWith('chrome')) return;

    if (req.destination === 'document') {
        // Network-first for documents
        event.respondWith(
            (async () => {
                try {
                    const fresh = await fetch(req);
                    const cache = await caches.open(CACHE_NAME);
                    cache.put(req, fresh.clone());
                    return fresh;
                } catch (err) {
                                const cached = await caches.match(req);
                                return cached || caches.match('/offline.html');
                }
            })()
        );
        return;
    }

    // Static asset: try cache first
    if (APP_SHELL.some(p => url.pathname === p)) {
        event.respondWith(
            caches.match(req).then(res => res || fetch(req).then(fresh => {
                return caches.open(CACHE_NAME).then(c => { c.put(req, fresh.clone()); return fresh; });
            }))
        );
        return;
    }

    // Images & fonts: stale-while-revalidate
    if (req.destination === 'image' || req.destination === 'font' || url.hostname.includes('googleapis.com')) {
        event.respondWith(
            (async () => {
                const cache = await caches.open(RUNTIME_CACHE);
                const cached = await cache.match(req);
                const fetchPromise = fetch(req).then(resp => { cache.put(req, resp.clone()); return resp; }).catch(() => null);
                return cached || fetchPromise || cached; // fallback to cached if fetch fails
            })()
        );
        return;
    }

        // Default: network with fallback to cache
    event.respondWith(
        (async () => {
                try { return await fetch(req); } catch { return await caches.match(req) || caches.match('/offline.html'); }
        })()
    );
});