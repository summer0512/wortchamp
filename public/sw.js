const CACHE_NAME = "wortchamp-static-v2";
const PRECACHE_ASSETS = ["/manifest.webmanifest", "/icon.png", "/logo.png"];
const STATIC_DESTINATIONS = new Set(["style", "script", "image", "font"]);

const isSameOriginGet = (request) =>
  request.method === "GET" && request.url.startsWith(self.location.origin);

const isWordListRequest = (url) =>
  url.pathname.startsWith("/wordlists/") && url.pathname.endsWith(".json");

const isStaticAssetRequest = (request) =>
  STATIC_DESTINATIONS.has(request.destination);

const putIfCacheable = async (request, response) => {
  if (!response || response.status !== 200 || response.type === "opaque") {
    return response;
  }
  const cache = await caches.open(CACHE_NAME);
  cache.put(request, response.clone());
  return response;
};

const networkFirst = async (request) => {
  try {
    const response = await fetch(request);
    return putIfCacheable(request, response);
  } catch {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    throw new Error("Network and cache miss");
  }
};

const staleWhileRevalidate = async (request) => {
  const cached = await caches.match(request);
  const networkPromise = fetch(request)
    .then((response) => putIfCacheable(request, response))
    .catch(() => null);

  if (cached) {
    return cached;
  }

  const networkResponse = await networkPromise;
  if (networkResponse) {
    return networkResponse;
  }
  throw new Error("Network and cache miss");
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await Promise.allSettled(
        PRECACHE_ASSETS.map(async (asset) => {
          try {
            await cache.add(asset);
          } catch {
            // Ignore pre-cache misses; runtime fetch still works.
          }
        }),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : Promise.resolve())),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (!isSameOriginGet(request)) {
    return;
  }

  const url = new URL(request.url);

  // Always go to network for pages and API to avoid stale app state.
  if (request.mode === "navigate" || url.pathname.startsWith("/api/")) {
    return;
  }

  if (isWordListRequest(url)) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (isStaticAssetRequest(request)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
