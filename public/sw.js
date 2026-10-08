// Service worker Surat Solat.
// - Halaman (navigasi): network-first, jatuh ke cache kalau offline.
// - /_next/static/*: cache-first (nama file ber-hash, isinya tidak pernah berubah).
// - Request lintas origin (API myquran, dll) TIDAK disentuh sama sekali.
// Naikkan VERSION hanya kalau logika file ini berubah.
const VERSION = "v1";
const STATIC_CACHE = `static-${VERSION}`;
const PAGE_CACHE = `pages-${VERSION}`;
const KEEP = [STATIC_CACHE, PAGE_CACHE];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(PAGE_CACHE);
        await cache.add(new Request(self.registration.scope, { cache: "reload" }));
      } catch {
        /* tetap lanjut install walau precache gagal */
      }
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((n) => !KEEP.includes(n)).map((n) => caches.delete(n)));
      await self.clients.claim();
    })(),
  );
});

const pageKey = (url) => {
  const u = new URL(url);
  u.search = "";
  u.hash = "";
  return u.href;
};

async function networkFirst(request) {
  const cache = await caches.open(PAGE_CACHE);
  try {
    const res = await fetch(request);
    // Respons hasil redirect tidak boleh dipakai ulang untuk navigasi.
    if (res.ok && !res.redirected) await cache.put(pageKey(request.url), res.clone());
    return res;
  } catch {
    return (
      (await cache.match(pageKey(request.url))) ||
      (await cache.match(self.registration.scope)) ||
      Response.error()
    );
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok) await cache.put(request, res.clone());
  return res;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
  } else if (url.pathname.includes("/_next/static/") || url.pathname.includes("/icons/")) {
    event.respondWith(cacheFirst(request));
  }
});
