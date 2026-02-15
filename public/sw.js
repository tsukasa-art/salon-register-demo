const CACHE_NAME = 'salon-register-v1';

const urlsToCache = ['/', '/index.html', '/login.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache.map((u) => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.protocol === 'chrome-extension:') return;

  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res && res.status === 200 && res.url.startsWith(event.request.url))
          caches.open(CACHE_NAME).then((c) => c.put(event.request, res.clone()));
        return res;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => {
          if (cached) return cached;
          if (url.pathname === '/' || url.pathname === '/index.html')
            return caches.match('/index.html');
          return new Response('Offline', { status: 404 });
        })
      )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});
