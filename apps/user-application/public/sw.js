/**
 * Service worker for offline support + installability.
 *
 * Strategy:
 *  - Precache a tiny app shell + the offline fallback page on install.
 *  - Navigation requests: network-first, fall back to cache, then to /offline.html.
 *  - Static assets (scripts/styles/images/fonts): stale-while-revalidate.
 *  - NEVER cache API / auth / server-function requests — always go to network.
 *  - Bump CACHE_VERSION to invalidate old caches on deploy (old caches are
 *    deleted on activate, and the new worker takes over immediately).
 */
const CACHE_VERSION = "v1";
const CACHE_NAME = `app-cache-${CACHE_VERSION}`;
const APP_SHELL = ["/", "/offline.html", "/manifest.json", "/favicon.ico"];

// Paths that must always hit the network (never served stale).
const NETWORK_ONLY = ["/api/", "/_serverFn/", "/health", "/ready"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  );
  // Activate this worker as soon as it's installed.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Allow the page to tell a waiting worker to take over.
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

function isNetworkOnly(url) {
  return NETWORK_ONLY.some((p) => url.pathname.startsWith(p));
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // don't touch cross-origin
  if (isNetworkOnly(url)) return; // API/auth → default network handling

  // Navigations: network-first with offline fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match("/offline.html")),
        ),
    );
    return;
  }

  // Static assets: stale-while-revalidate.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
