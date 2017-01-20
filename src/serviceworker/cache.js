export function setInstall(event, caches) {
    const resources = [
        '/index.html',
        '/manifest.json',
        'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css',
        '/pwa.bundle.js',
        '/serviceworker.bundle.js'
    ];

    // https://jakearchibald.com/2014/offline-cookbook/
    // https://mobiforge.com/design-development/taking-web-offline-service-workers
    event.waitUntil(
        caches
            .open('pwa-demo-v1')
            .then(cache => cache.addAll(resources))
    );
}

function createOfflineServiceResponse(responseObj) {
    //const response = {'sendUptime': false, 'offline': true};
    const responseBlob = new Blob([JSON.stringify(responseObj)], {type: 'application/json'});
    const responseInit = {'status': 200, 'statusText': 'ok'};
    return new Response(responseBlob, responseInit);
}

export function setFetch(event) {
    // Parse the URL:
    const requestURL = new URL(event.request.url);
    console.log('%csw/cache:', 'color: green; font-weight: bold', 'Fetch event', requestURL.pathname, requestURL.href);

    //event.respondWith(caches
    //    .match(event.request)
    //    .then(response => response || fetch(event.request))
    //);

    // Handle requests to a particular host specifically
    //if(requestURL.pathname === '/index.html') {
    //    console.log('%csw/cache:', 'color: green; font-weight: bold', 'Intercepted index.html');
    //    event.respondWith(caches
    //        .match(event.request)
    //        .then(response => response || fetch(event.request))
    //    );
    //} else
    if (requestURL.pathname === '/sendUptime') {
        console.log('%csw/cache:', 'color: green; font-weight: bold', 'Intercepted sendUptime');
        // Network, falling back to custom response
        event.respondWith(fetch(event.request)
            .catch(function () {
                console.warn('%csw/cache:', 'color: green; font-weight: bold', 'Can\'t reach /sendUptime');
                // To return cached response: caches.match(event.request);
                const response = {'sendUptime': false, 'offline': true};
                return createOfflineServiceResponse(response);
            }));
        return;
    } else if (requestURL.pathname === '/subscribe') {
        console.log('%csw/cache:', 'color: green; font-weight: bold', 'Intercepted subscribe');
        // Network, falling back to custom response
        event.respondWith(fetch(event.request)
            .catch(function() {
                console.warn('%csw/cache:', 'color: green; font-weight: bold', 'Can\'t reach /subscribe');
                const response = {'result': 'offline'};
                return createOfflineServiceResponse(response);
            }));
        return;
    } else {
        // Network, falling back to cache
        event.respondWith(caches
            .match(event.request)
            .catch(() => fetch(event.request))
            .then(response => {
                caches
                    .open('pwa-demo-v1')
                    .then(cache => {
                        cache.put(event.request, response);
                    });
                return response.clone();
            })
            .catch(() => caches.match('/index.html')));
    }
};