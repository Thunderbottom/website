const CACHE_NAME = "maych-in-cache";
const urlsToCache = [
  "/",
  "/blog/",
  "/photography/",
  "/projects/",
  "/now/",
  "/fonts/playfair-display/playfair-display-v22-latin-600.woff2",
  "/fonts/jetbrains-mono/jetbrains-mono-v20-latin-regular.woff2",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
  );
});
