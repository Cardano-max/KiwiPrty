// Minimal service worker — enables PWA install and an offline fallback.
const CACHE = "kiwi-party-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  event.respondWith(
    (async () => {
      try {
        const res = await fetch(request);
        // cache successful navigations/static for offline fallback
        if (res && res.status === 200 && request.url.startsWith(self.location.origin)) {
          const cache = await caches.open(CACHE);
          cache.put(request, res.clone()).catch(() => {});
        }
        return res;
      } catch {
        const cache = await caches.open(CACHE);
        const cached = await cache.match(request);
        if (cached) return cached;
        if (request.mode === "navigate") {
          const home = await cache.match("/");
          if (home) return home;
        }
        return new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } });
      }
    })(),
  );
});
