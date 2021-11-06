var CACHE_NAME = '2021-11-06 12:10';
var urlsToCache = [
  "/asmr-english-words/",
  "/asmr-english-words/data/0.tsv",
  "/asmr-english-words/data/1.tsv",
  "/asmr-english-words/data/2.tsv",
  "/asmr-english-words/data/3.tsv",
  "/asmr-english-words/data/4.tsv",
  "/asmr-english-words/data/5.tsv",
  "/asmr-english-words/data/6.tsv",
  "/asmr-english-words/index.js",
  "/asmr-english-words/favicon/original.svg",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js",
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(urlsToCache);
      }),
  );
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }),
  );
});

self.addEventListener("activate", function (event) {
  var cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
});
