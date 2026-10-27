const CACHE_NAME = "growcalc-v4.0.1";

const ASSETS_TO_CACHE = [
    "/",
    "/index.html",
    "/css/styles.css",
    "/js/app.js",
    "/js/data.js",
    "/js/calculator.js",
    "/js/storage.js",
    "/manifest.json",
    "/icons/favicon.svg",
    "/icons/icon-192.png",
    "/icons/icon-512.png"
];

// INSTALACIÓN INMEDIATA
self.addEventListener("install", (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
});

// ACTIVACIÓN Y PURGA DE VERSIONES ANTERIORES (v3.0.3 y previas)
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys.map((key) => {
                        if (key !== CACHE_NAME) {
                            return caches.delete(key);
                        }
                        return undefined;
                    })
                )
            )
            .then(() => self.clients.claim())
    );
});

// MENSAJE PARA FORZAR ACTUALIZACIÓN SI SE SOLICITA
self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});

// INTERCEPTOR FETCH NETWORK-FIRST CON VALIDACIÓN Y FALLBACK OFFLINE
self.addEventListener("fetch", (event) => {
    const { request } = event;

    if (request.method !== "GET" || !request.url.startsWith("http")) {
        return;
    }

    event.respondWith(
        fetch(request, { cache: "no-cache" })
            .then((response) => {
                if (
                    response &&
                    response.status === 200 &&
                    (response.type === "basic" || response.type === "cors")
                ) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseClone);
                    });
                }
                return response;
            })
            .catch(() =>
                caches
                    .match(request, { ignoreSearch: true })
                    .then((cached) => cached || caches.match("/index.html"))
            )
    );
});
