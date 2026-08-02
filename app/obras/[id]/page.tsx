'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Obra } from '@/types'
import PresupuestoSection from '@/components/obra/PresupuestoSection'
import PagosClientesSection from '@/components/obra/PagosClientesSection'
import PagosProveedoresSection from '@/components/obra/PagosProveedoresSection'
import GastosMaterialesSection from '@/components/obra/GastosMaterialesSection'

interface ObraConCliente extends Obra {
  clientes: { nombre: string } | null
}

export default function DetalleObraPage() {
  const { id } = useParams<{ id: string }>()
  const [obra, setObra] = useState<ObraConCliente | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('obras')
      .select('*, clientes(nombre)')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) setObra(data as unknown as ObraConCliente)
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-slate-500">Cargando...</p>
      </div>
    )
  }

  if (!obra) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-slate-500">Obra no encontrada</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">{obra.nombre}</h1>
          <a href="/obras" className="text-sm text-blue-accent hover:underline">
            Volver
          </a>
        </div>

        {obra.clientes && <p className="mt-1 text-sm text-slate-500">{obra.clientes.nombre}</p>}

        <span
          className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
            obra.estado === 'terminada' ? 'bg-green-100 text-green-alert' :
            obra.estado === 'en_ejecucion' ? 'bg-blue-100 text-blue-accent' :
            'bg-yellow-100 text-yellow-700'
          }`}
        >
          {obra.estado === 'presupuestada' ? 'Presupuestada' :
           obra.estado === 'en_ejecucion' ? 'En ejecución' : 'Terminada'}
        </span>

        {obra.descripcion && <p className="mt-3 text-sm text-slate-600">{obra.descripcion}</p>}

        <div className="mt-6 space-y-4">
          <PresupuestoSection obraId={id} />
          <PagosClientesSection obraId={id} />
          <PagosProveedoresSection obraId={id} />
          <GastosMaterialesSection obraId={id} />
        </div>
      </div>
    </div>
  )
}
