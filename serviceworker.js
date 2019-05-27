'use strict';
importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');
console.log('Service Worker Registered');

// Force development builds
workbox.setConfig({
    debug: true
});

// Setup cache details
workbox.core.setCacheNameDetails({
    prefix: 'clc',
    suffix: 'v1',
    precache: 'precache'
});

// Cache offline files.
workbox.precaching.precacheAndRoute([
    '/offline/offline.css',
    '/offline/offline.jpg',
    {
        url: '/offline/'
    },
]);

// Cache CSS files.
workbox.routing.registerRoute(
    /\.css$/,
    new workbox.strategies.CacheFirst({
        cacheName: 'css-cache',
    })
);

// Cache JS files.
workbox.routing.registerRoute(
    /\.js$/,
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: 'js-cache',
    })
);

// Cache image files.
workbox.routing.registerRoute(
    /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
    new workbox.strategies.CacheFirst({
        cacheName: 'image-cache',
        plugins: [
            new workbox.expiration.Plugin({
                maxEntries: 20,
                maxAgeSeconds: 7 * 24 * 60 * 60,
                purgeOnQuotaError: true,
            })
        ],
    })
);

// Enable offline google analytics.
workbox.googleAnalytics.initialize();

// Offline fallback 
const offlinePage = '/offline/';
workbox.routing.registerRoute(/\//,
    async ({
        event
    }) => {
        try {
            return await workbox.strategies.staleWhileRevalidate({
                cacheName: 'cache-pages'
            }).handle({
                event
            });
        } catch (error) {
            return caches.match(offlinePage);
        }
    }
);