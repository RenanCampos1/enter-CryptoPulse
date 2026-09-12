// Service Worker do CryptoPulse — cache mínimo do app shell.
// API externas (CoinGecko, Fear&Greed, notícias) passam direto (network-only).
const CACHE = "cryptopulse-v1";
const API_HOSTS = ["api.coingecko.com", "api.alternative.me", "min-api.cryptocompare.com", "spb-t4n2026430cl3036"];

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
    self.clients.claim()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (API_HOSTS.some((h) => url.hostname.includes(h))) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok && url.origin === self.location.origin) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
