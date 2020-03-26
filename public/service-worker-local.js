console.log('Service Worker code goes here');
var CACHE_NAME = 'my-pwa-cache-v1';
var urlsToCache = [
	'./',
	"./**.js",
	"./**.png",
	"./songs.json",
	'./favicon.ico',
    './manifest.json',
    './launcher-144.png',
    './launcher-192.png',
    './launcher-512.png',
	"./static/js/**.js",
	"./static/css/**.css",
	"./static/media/**.svg",
	'./service-worker-local.js'
];

//Cache Files on first load
self.addEventListener('install', function(e) {
	e.waitUntil(
		caches.open(CACHE_NAME).then(function(cache) {
			// Open a cache and cache our files
			return cache.addAll(urlsToCache);
		})
	);
});

//Serve cached data
self.addEventListener('fetch', function(e) {
	console.log(e.request.url);
	if (e.request.cache === 'only-if-cached' && e.request.mode !== 'same-origin') return;
	e.respondWith(
		caches.match(e.request).then(function(response) {
			return response || fetch(e.request);
		})
	);
});
