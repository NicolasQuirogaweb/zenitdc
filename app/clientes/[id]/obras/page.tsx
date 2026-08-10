'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface ObraConDatos {
  id: string
  nombre: string
  estado: string
  responsable: string | null
  clientes: { nombre: string } | null
}

export default function ObrasDeClientePage() {
  const { id } = useParams<{ id: string }>()
  const [obras, setObras] = useState<ObraConDatos[]>([])
  const [cliente, setCliente] = useState<{ nombre: string } | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchObras = () => {
    const supabase = createClient()
    supabase
      .from('obras')
      .select('id, nombre, estado, responsable, clientes(nombre)')
      .eq('cliente_id', id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setObras(data as unknown as ObraConDatos[])
        setLoading(false)
      })
  }

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('clientes')
      .select('nombre')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) setCliente(data)
      })
    fetchObras()
  }, [id])

  const handleDelete = async (obraId: string) => {
    if (!confirm('¿Eliminar esta obra? También se eliminarán presupuestos, pagos y gastos asociados.')) return

    const res = await fetch(`/api/obras/${obraId}`, { method: 'DELETE' })
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
          <h1 className="text-xl font-bold text-slate-800">{cliente?.nombre ?? 'Obras'}</h1>
          <a href="/clientes" className="text-sm text-blue-accent hover:underline">
            Volver
          </a>
        </div>

        <p className="mt-1 text-sm text-slate-500">Obras del cliente</p>

        <div className="mt-6 flex justify-end">
          <a
            href={`/obras/nuevo?cliente_id=${id}`}
            className="rounded-lg bg-blue-accent px-3 py-1.5 text-sm font-semibold text-white"
          >
            + Nueva obra
          </a>
        </div>

        {obras.length === 0 ? (
          <div className="mt-8 text-center">
            <p className="text-slate-500">No hay obras para este cliente aún</p>
            <p className="mt-2">
              <a
                href={`/obras/nuevo?cliente_id=${id}`}
                className="inline-block rounded-lg bg-blue-accent px-4 py-2 text-sm font-semibold text-white"
              >
                Crear primera obra
              </a>
            </p>
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {obras.map((o) => (
              <li key={o.id} className="rounded-lg bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{o.nombre}</p>
                    <span
                      className={`inline-block mt-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        o.estado === 'terminada' ? 'bg-green-100 text-green-alert' :
                        o.estado === 'en_ejecucion' ? 'bg-blue-100 text-blue-accent' :
                        'bg-yellow-100 text-yellow-700'
                      }`}
                    >
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
