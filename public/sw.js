var staticCacheName = 'ughie-static-6'
var dynamicEventCacheName = 'ughie-event-6'
var ImageCache = 'ughie-image';

var allcache = [
    staticCacheName,
    dynamicEventCacheName,
    ImageCache
]
var filesToCache = [
    '/',
    '/event',
    '/javascripts/index.js',
    '/javascripts/idb.js',
    '/javascripts/jquery.js',
    '/javascripts/popper.js',
    '/javascripts/bootstrap.js',
    '/javascripts/bootstrap.min.js.map',
    '/stylesheets/style.css',
    '/stylesheets/bootstrap.min.css',
    '/stylesheets/bootstrap.min.css.map',
    '/socket.io/socket.io.js',
];

//sjdhkdjsss
// /jksdjsss


self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(staticCacheName).then(function (cache) {
            return cache.addAll(filesToCache)
        }).catch(function (err) {
            console.log(err);
        })

    )
})

self.addEventListener('activate', function (event) {

    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.filter(function (cacheName) {
                    return cacheName.startsWith('ughie-') &&
                        !allcache.includes(cacheName);
                }).map(function (cacheName) {
                    console.log('deleting: ' + cacheName)
                    return caches.delete(cacheName)
                })
            )
        })

    )
})
// console.log(self)
self.addEventListener('fetch', function (event) {
    const requestURL = new URL(event.request.url);
    // console.log('event', event)
    if (requestURL.pathname.startsWith('/images/uploads/')) {
        return event.respondWith(caches.open(ImageCache).then(function (cache) {
            return cache.match(requestURL).then(function (response) {
                if (response) return response;
                return fetch(requestURL).then(function (networkResponse) {
                    cache.put(requestURL, networkResponse.clone());
                    return networkResponse;
                })
            })
        }))
    }
    if (requestURL.origin === location.origin) {
        // if (new RegExp('/events', "i").test(requestURL.pathname)) {
        // return event.respondWith(
        //     caches.match(event.request).then(function (resp) {
        //         return resp || fetch(event.request).then(function (response) {
        //             return caches.open(dynamicEventCacheName).then(function (cache) {
        //                 cache.put(event.request, response.clone());
        //                 return response;
        //             });
        //         });
        //     })
        // )
        // }
        if (requestURL.pathname === "/" ||
            new RegExp('/events', "i").test(requestURL.pathname) ||
            new RegExp('/event', "i").test(requestURL.pathname)
        ) {
            return event.respondWith(
                async function () {
                    try {
                        return await fetch(event.request).then(function (response) {
                            // return response
                            return caches.open(staticCacheName).then(function (cache) {
                                cache.put(event.request, response.clone())
                                return response;
                            })
                        });
                    } catch (err) {
                        return caches.match(event.request);
                    }
                }()
            )
            // network then catch
            // return event.respondWith(

        }
    }
    event.respondWith(
        caches.match(event.request).then(function (response) {
            return response || fetch(event.request);
        })
    )
})


self.addEventListener('message', function (event) {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});