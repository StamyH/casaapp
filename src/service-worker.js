/* eslint-disable no-restricted-globals */
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

clientsClaim();

// Precache tutti gli asset generati dal build (JS, CSS, ecc.) ma NON index.html
precacheAndRoute(self.__WB_MANIFEST.filter(entry => !entry.url.endsWith('index.html')));

// index.html: sempre dal network (network-first) così i meta tag Apple sono sempre aggiornati
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'html-cache',
    plugins: [new ExpirationPlugin({ maxEntries: 1, maxAgeSeconds: 60 * 60 * 24 })],
  })
);

// Cache immagini con strategia stale-while-revalidate
registerRoute(
  ({ url }) => url.origin === self.location.origin && url.pathname.match(/\.(png|jpg|jpeg|svg|ico)$/),
  new StaleWhileRevalidate({
    cacheName: 'images',
    plugins: [new ExpirationPlugin({ maxEntries: 50 })],
  })
);

// Permette all'app di attivare subito il nuovo service worker
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
