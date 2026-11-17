// Until November 2026 the app itself lived at this address and installed a service worker here.
// The app now lives in app/ (with its own worker), so this one only removes the old worker and its
// caches; the next visit loads the homepage normally.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const appScope = new URL('app/', self.registration.scope).href
      for (const key of await caches.keys()) {
        if (key.startsWith('workbox-precache') && !key.includes(appScope)) await caches.delete(key)
      }
      await self.registration.unregister()
      for (const client of await self.clients.matchAll({ type: 'window' })) client.navigate(client.url)
    })(),
  )
})
