const cacheName = 'astroguard-offline-__VERSION__'
const assets = __ASSETS__
const scope = self.registration.scope
const urls = assets.map((asset) => new URL(asset, scope).href)

self.addEventListener('install', (event) => {
  // A failed download prevents activation; the previous complete build stays usable.
  event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(urls)))
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys()
    await Promise.all(names.filter((name) => name.startsWith('astroguard-offline-') && name !== cacheName).map((name) => caches.delete(name)))
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== new URL(scope).origin) return
  const shell = new URL('index.html', scope).href
  const isHome = url.pathname === new URL(scope).pathname || url.pathname === new URL(shell).pathname
  const key = request.mode === 'navigate' && isHome ? shell : url.href
  if (!urls.includes(key)) return
  event.respondWith((async () => {
    const cache = await caches.open(cacheName)
    return (await cache.match(key)) || fetch(request)
  })())
})
