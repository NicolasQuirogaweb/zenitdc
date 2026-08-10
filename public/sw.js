const VERSION = 'zenitdc-v3'
const CACHE_STATIC = `${VERSION}-static`
const CACHE_NAV = `${VERSION}-nav`

const PRECACHE_URLS = [
  '/',
  '/login',
  '/dashboard',
  '/obras',
  '/clientes',
  '/balance',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_STATIC)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('zenitdc-') && key !== CACHE_STATIC && key !== CACHE_NAV)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return
  }

  if (url.pathname.startsWith('/_next/webpack-')) {
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request))
    return
  }

  event.respondWith(networkFirst(request))
})

async function networkFirstNavigation(request) {
  const cache = await caches.open(CACHE_NAV)
  try {
    const response = await fetch(request)
    if (response && response.ok && !response.redirected) {
      await cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await cache.match(request)
    if (cached) return cached
    return caches.match('/')
  }
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_STATIC)
  try {
    const response = await fetch(request)
    if (response && response.ok && !response.redirected) {
      await cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await cache.match(request)
    if (cached) return cached
    return Response.error()
  }
}
