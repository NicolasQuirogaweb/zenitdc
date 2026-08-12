'use client'

import { createContext, useCallback, useContext, useState } from 'react'

interface ConfirmContextValue {
  confirm: (mensaje: string) => Promise<boolean>
}

interface PendingConfirm {
  mensaje: string
  resolve: (ok: boolean) => void
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null)

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null)

  const confirm = useCallback((mensaje: string) => {
    return new Promise<boolean>((resolve) => {
      setPending({ mensaje, resolve })
    })
  }, [])

  const responder = (ok: boolean) => {
    pending?.resolve(ok)
    setPending(null)
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-bg-surface)] p-4 shadow-lg">
            <p className="text-sm text-[color:var(--color-text-primary)]">{pending.mensaje}</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => responder(false)}
                className="rounded-lg border border-[color:var(--color-border)] px-3 py-1.5 text-sm font-semibold text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-border)]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => responder(true)}
                className="rounded-lg bg-red-alert px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm debe usarse dentro de ConfirmProvider')
  return ctx.confirm
}
