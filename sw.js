// use a cacheName for cache versioning
var cacheName = 'alarm-system';
var filesname= [
    'index.html',
    'manifest.json',
];

// during the install phase you usually want to cache static assets
self.addEventListener('install', function(e) {
    // once the SW is installed, go ahead and fetch the resources to make this work offline
    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            return cache.addAll(filesname).then(function() {
                self.skipWaiting();
            });
        })
    );
});

self.addEventListener('activate', function(e) {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
      caches.keys().then(function(keyList) {
        return Promise.all(keyList.map(function(key) {
          if (key !== cacheName) {
            console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
          }
        }));
      })
    );
    return self.clients.claim();
  });

self.addEventListener('fetch',function(event){
    if(navigator.onLine){
		event.waitUntil(update(event.request));
    } 
    else event.respondWith(fromCache(event.request));
});

function fromCache(request) {
    return caches.open(cacheName).then(function (cache) {
      return cache.match(request);
    });
  }

  function update(request) {
    return caches.open(cacheName).then(function (cache) {
      return fetch(request).then(function (response) {
        return cache.put(request, response.clone()).then(function () {
          return response;
        });
      });
    });
  }

  