
const CACHE_NAME = "switchlens-cache-v6.5";

const STATIC_ASSETS = [
  "/home.html",
  "/favorites.html",
  "/guide.html",
  "/index.html",
  "/login.html",
  "/register.html",
  "/resolve.html",
  "/ai-search.html",
  "/icons/site.webmanifest",

  "/js/config.js",
  "/js/main.js",
  "/js/video.js",
  "/js/button.js",
  "/js/favorites.js",
  "/js/landing.js",
  "/js/guide.js",
  "/js/auth.js",
  "/js/resolve.js",
  "/js/turnstile.js",
  "/js/ai-search.js",
  "/js/provider-filter.js",
  "/js/floating-search.js",
  "/js/search-history.js",
  "/js/slider.js",
  "/js/register-sw.js",

  "/icons/web-app-manifest-192x192.png",
  "/icons/web-app-manifest-512x512.png",
  "/icons/favicon-96x96.png"
];


self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        STATIC_ASSETS.map((assetPath) =>
          cache.add(assetPath).catch((err) => {
            console.warn(`Gagal cache asset: ${assetPath}`, err);
          })
        )
      );
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



function isHostOrSubdomain(hostname, baseHost) {
  return hostname === baseHost || hostname.endsWith(`.${baseHost}`);
}

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  const DYNAMIC_API_HOSTS = [
    "workers.dev",
    "pexels.com",
    "pixabay.com",
    "unsplash.com"
  ];

  const isKnownDynamicAPI = DYNAMIC_API_HOSTS.some((host) =>
    isHostOrSubdomain(url.hostname, host)
  );

  const isCrossOriginImage =
    url.origin !== self.location.origin &&
    event.request.destination === "image";

  const isCrossOriginResource = url.origin !== self.location.origin;

  if (isKnownDynamicAPI || isCrossOriginImage || isCrossOriginResource || event.request.method !== "GET") {
    return;
  }

  const isNavigationOrScript =
    event.request.mode === "navigate" ||
    url.pathname.endsWith(".html") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css");

  if (isNavigationOrScript) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || !networkResponse.ok) return networkResponse;
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return networkResponse;
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
