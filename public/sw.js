const VERSION = 'zenitdc-v1'
const CACHE_STATIC = `${VERSION}-static`
const CACHE_NAV = `${VERSION}-nav`

const PRECACHE_URLS = [
  '/',
  '/login',
  '/dashboard',
  '/obras',
  '/clientes',
  '/gastos-generales',
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

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request))
    return
  }

  if (url.pathname.startsWith('/_next/') || url.pathname.startsWith('/static/')) {
    event.respondWith(cacheFirstStatic(request))
    return
  }

  event.respondWith(cacheFirstStatic(request))
})

async function networkFirstNavigation(request) {
  const cache = await caches.open(CACHE_NAV)
  try {
    const response = await fetch(request)
    if (response && response.ok) {
      await cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await cache.match(request)
    if (cached) return cached
    return caches.match('/')
  }
}

async function cacheFirstStatic(request) {
  const cache = await caches.open(CACHE_STATIC)
  const cached = await cache.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response && response.ok) {
      await cache.put(request, response.clone())
    }
    return response
  } catch {
    return cached
  }
}
