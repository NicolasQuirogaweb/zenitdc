'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SkeletonLista } from '@/components/ui/Skeleton'
import { useToast } from '@/lib/hooks/useToast'
import type { Cliente } from '@/types'

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const supabase = createClient()
  const { showToast } = useToast()

  const fetchClientes = () => {
    supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (data) setClientes(data)
        else if (error) setError('Error al cargar los clientes')
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchClientes()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este cliente?')) return

    const res = await fetch(`/api/clientes/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setError('')
      showToast('success', 'Cliente eliminado')
      fetchClientes()
      return
    }
    const err = await res.json()
    setError(typeof err.error === 'string' ? err.error : 'No se pudo eliminar el cliente')
  }

  return (
    <div className="min-h-screen bg-[color:var(--color-bg-page)] p-4">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[color:var(--color-text-primary)]">Clientes</h1>
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="text-sm text-blue-light hover:underline">
              Volver
            </a>
            <a
              href="/clientes/nuevo"
              className="rounded-lg bg-blue-accent px-3 py-1.5 text-sm font-semibold text-white"
            >
              + Nuevo
            </a>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-alert/15 p-3 text-sm text-red-alert">{error}</p>
        )}

        {loading ? (
          <SkeletonLista />
        ) : clientes.length === 0 ? (
          <div className="mt-8 text-center">
            <p className="text-[color:var(--color-text-secondary)]">No hay clientes aún</p>
            <p className="mt-2">
              <a
                href="/clientes/nuevo"
                className="inline-block rounded-lg bg-blue-accent px-4 py-2 text-sm font-semibold text-white"
              >
                Crear primer cliente
              </a>
            </p>
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {clientes.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between rounded-lg bg-[color:var(--color-bg-surface)] p-3 shadow-sm"
              >
                <div>
                  <p className="font-medium text-[color:var(--color-text-primary)]">{c.nombre}</p>
                  {c.telefono && (
                    <p className="text-sm text-[color:var(--color-text-secondary)]">{c.telefono}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`/clientes/${c.id}/obras`}
                    className="text-sm text-blue-light hover:underline"
                  >
                    Ver obras
                  </a>
                  <a
                    href={`/clientes/${c.id}/editar`}
                    className="text-sm text-blue-light hover:underline"
                  >
                    Editar
                  </a>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-sm text-red-alert hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}