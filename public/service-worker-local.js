var CACHE_NAME = "my-pwa-cache-v1";
var urlsToCache = [
    "/",
    "/songs",
    "/index.html",
    "/songs.json",
    "/favicon.ico",
    "/manifest.json",
    "/launcher-144.png",
    "/launcher-192.png",
    "/launcher-512.png",
];

//Cache Files on first load
self.addEventListener("install", function (e) {
    // @ts-ignore
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            // Open a cache and cache our files
            return cache.addAll(urlsToCache);
        })
    );
});

//Serve cached data
self.addEventListener("fetch", function (e) {
    // @ts-ignore
    //console.log(e.request.url);
    // @ts-ignore
    if (e.request.cache === "only-if-cached" && e.request.mode !== "same-origin") return;
    // @ts-ignore
    e.respondWith(
        // @ts-ignore
        caches.match(e.request).then(function (response) {
            // @ts-ignore
            return response || fetch(e.request);
        })
    );
});
