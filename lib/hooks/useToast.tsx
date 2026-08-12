'use client'

import { createContext, useCallback, useContext, useState } from 'react'

interface Toast {
  id: number
  tipo: 'success' | 'error'
  mensaje: string
}

interface ToastContextValue {
  showToast: (tipo: Toast['tipo'], mensaje: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let nextId = 1

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((tipo: Toast['tipo'], mensaje: string) => {
    const id = nextId++
    setToasts((ts) => [...ts, { id, tipo, mensaje }])
    setTimeout(() => {
      setToasts((ts) => ts.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4 md:inset-x-auto md:right-4 md:bottom-4 md:items-end md:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`w-full max-w-sm rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
              t.tipo === 'success' ? 'bg-green-alert' : 'bg-red-alert'
            }`}
          >
            {t.mensaje}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider')
  return ctx
}
