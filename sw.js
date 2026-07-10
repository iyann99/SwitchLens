
const CACHE_NAME = "switchlens-cache-v3.5";

const STATIC_ASSETS = [
  "/home.html",
  "/favorites.html",
  "/guide.html",
  "/index.html",
  "/site.webmanifest",

  "/js/config.js",
  "/js/main.js",
  "/js/video.js",
  "/js/button.js",
  "/js/favorites.js",
  "/js/landing.js",

  "/icons/web-app-manifest-192x192.png",
  "/icons/web-app-manifest-512x512.png",
  "/icons/favicon-96x96.png"
];


self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("Sebagian asset gagal di-cache saat install:", err);
      });
    })
  );
  self.skipWaiting();
});


self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});



self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  const isDynamicContent =
    url.hostname.includes("workers.dev") ||
    url.hostname.includes("pexels.com") ||
    url.hostname.includes("pixabay.com") ||
    url.hostname.includes("unsplash.com");

  if (isDynamicContent || event.request.method !== "GET") {
    return;
  }

  // HTML dan JS/CSS: NETWORK-FIRST.
  // Selalu coba ambil versi terbaru dari server dulu; cache hanya
  // dipakai sebagai fallback kalau benar-benar offline. Ini mencegah
  // pengguna terjebak di versi lama setelah ada update kode.
  const isNavigationOrScript =
    event.request.mode === "navigate" ||
    url.pathname.endsWith(".html") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css");

  if (isNavigationOrScript) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || caches.match("/home.html");
          });
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          if (event.request.mode === "navigate") {
            return caches.match("/home.html");
          }
        });
    })
  );
});
