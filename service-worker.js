const CACHE_NAME = "growcalc-v3";

const urlsToCache = [
  "/",
  "/index.html",
  "/css/styles.css",
  "/js/app.js",
  "/js/data.js",
  "/js/calculator.js",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// INSTALACIÓN
self.addEventListener("install", event => {

  self.skipWaiting();

  event.waitUntil(

    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))

  );

});

// ACTIVACIÓN
self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys().then(keys =>

      Promise.all(

        keys.map(key => {

          if (key !== CACHE_NAME) {

            return caches.delete(key);

          }

        })

      )

    )

  );

  self.clients.claim();

});

// FETCH
self.addEventListener("fetch", event => {

  event.respondWith(

    fetch(event.request)

      .then(response => {

        const clone = response.clone();

        caches.open(CACHE_NAME)

          .then(cache => cache.put(event.request, clone));

        return response;

      })

      .catch(() => caches.match(event.request))

  );

});