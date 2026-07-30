'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Cliente } from '@/types'

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setClientes(data)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-slate-500">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-lg">
        <h1 className="text-xl font-bold text-slate-800">Clientes</h1>

        {clientes.length === 0 ? (
          <div className="mt-8 text-center">
            <p className="text-slate-500">No hay clientes aún</p>
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
                className="rounded-lg bg-white p-3 shadow-sm"
              >
                <p className="font-medium text-slate-800">{c.nombre}</p>
                {c.telefono && (
                  <p className="text-sm text-slate-500">{c.telefono}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}