'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface ObraConCliente {
  id: string
  nombre: string
  estado: string
  responsable: string | null
  clientes: { nombre: string } | null
}

export default function ObrasPage() {
  const [obras, setObras] = useState<ObraConCliente[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const fetchObras = () => {
    supabase
      .from('obras')
      .select('id, nombre, estado, responsable, clientes(nombre)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setObras(data as unknown as ObraConCliente[])
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchObras()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta obra? También se eliminarán presupuestos, pagos y gastos asociados.')) return

    const res = await fetch(`/api/obras/${id}`, { method: 'DELETE' })
    if (res.ok) fetchObras()
  }

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
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">Obras</h1>
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="text-sm text-blue-accent hover:underline">
              Volver
            </a>
            <a
              href="/obras/nuevo"
              className="rounded-lg bg-blue-accent px-3 py-1.5 text-sm font-semibold text-white"
            >
              + Nueva
            </a>
          </div>
        </div>

        {obras.length === 0 ? (
          <div className="mt-8 text-center">
            <p className="text-slate-500">No hay obras aún</p>
            <p className="mt-2">
              <a
                href="/obras/nuevo"
                className="inline-block rounded-lg bg-blue-accent px-4 py-2 text-sm font-semibold text-white"
              >
                Crear primera obra
              </a>
            </p>
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {obras.map((o) => (
              <li
                key={o.id}
                className="rounded-lg bg-white p-3 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{o.nombre}</p>
                    {o.clientes && (
                      <p className="text-sm text-slate-500">{o.clientes.nombre}</p>
                    )}
                    <span className={`inline-block mt-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      o.estado === 'terminada' ? 'bg-green-100 text-green-alert' :
                      o.estado === 'en_ejecucion' ? 'bg-blue-100 text-blue-accent' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {o.estado === 'presupuestada' ? 'Presupuestada' :
                       o.estado === 'en_ejecucion' ? 'En ejecución' : 'Terminada'}
                    </span>
                  </div>
                  <div className="flex gap-2 ml-3">
                    <a
                      href={`/obras/${o.id}`}
                      className="text-sm text-blue-accent hover:underline"
                    >
                      Ver
                    </a>
                    <a
                      href={`/obras/${o.id}/editar`}
                      className="text-sm text-blue-accent hover:underline"
                    >
                      Editar
                    </a>
                    <button
                      onClick={() => handleDelete(o.id)}
                      className="text-sm text-red-alert hover:underline"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}