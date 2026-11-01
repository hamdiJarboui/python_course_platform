/* PyCourses service worker (T-070): offline app shell, visited lessons and the Pyodide runtime.
 *
 * - Navigation requests: network first, fall back to the cached app shell (index.html) so deep links work offline.
 * - Same-origin assets (hashed JS/CSS/fonts, lesson JSON): stale-while-revalidate.
 * - Pyodide files from jsDelivr: cache first (they are versioned and immutable).
 * - Never intercepts PDF downloads' range requests or non-GET requests.
 */
const VERSION = 'v1';
const SHELL_CACHE = `pycourses-shell-${VERSION}`;
const ASSET_CACHE = `pycourses-assets-${VERSION}`;
const PYODIDE_CACHE = `pycourses-pyodide-${VERSION}`;
const KEEP = [SHELL_CACHE, ASSET_CACHE, PYODIDE_CACHE];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(['./', 'favicon.svg', 'manifest.webmanifest']))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !KEEP.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function networkFirstShell(request) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const fresh = await fetch(request);
    if (fresh.ok) cache.put('./', fresh.clone());
    return fresh;
  } catch {
    return (await cache.match('./')) || (await cache.match(request)) || Response.error();
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const refresh = fetch(request)
    .then((res) => {
      if (res.ok) cache.put(request, res.clone());
      return res;
    })
    .catch(() => undefined);
  return cached || (await refresh) || Response.error();
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const res = await fetch(request);
  if (res.ok || res.type === 'opaque') cache.put(request, res.clone());
  return res;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || request.headers.has('range')) return;
  const url = new URL(request.url);

  if (url.hostname === 'cdn.jsdelivr.net' && url.pathname.startsWith('/pyodide/')) {
    event.respondWith(cacheFirst(request, PYODIDE_CACHE));
    return;
  }
  if (url.origin !== self.location.origin) return;
  if (url.pathname.includes('/pdf/')) return; // large, generated: let the browser handle it

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstShell(request));
    return;
  }
  event.respondWith(staleWhileRevalidate(request, ASSET_CACHE));
});
