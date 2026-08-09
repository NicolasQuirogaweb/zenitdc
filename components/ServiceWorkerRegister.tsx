'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // El registro es opcional: si falla, la app sigue funcionando online
      })
    }
  }, [])

  return null
}
