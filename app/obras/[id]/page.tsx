'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatFecha } from '@/lib/utils/formato'
import type { Cliente, Obra } from '@/types'
import PresupuestoSection from '@/components/obra/PresupuestoSection'
import GastosRealesSection from '@/components/obra/GastosRealesSection'
import GastosMaterialesSection from '@/components/obra/GastosMaterialesSection'
import PagosClientesSection from '@/components/obra/PagosClientesSection'
import BalanceSection from '@/components/obra/BalanceSection'

interface ObraConCliente extends Obra {
  clientes: Cliente | null
}

export default function DetalleObraPage() {
  const { id } = useParams<{ id: string }>()
  const [obra, setObra] = useState<ObraConCliente | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  const notificarCambio = () => setRefreshKey((k) => k + 1)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('obras')
      .select('*, clientes(*)')
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
          <a
            href={`/clientes/${obra.cliente_id}/obras`}
            className="text-sm text-blue-accent hover:underline"
          >
            Volver
          </a>
        </div>

        <div className="mt-4 space-y-4">
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Cliente
            </h2>
            {obra.clientes ? (
              <div className="mt-2 text-sm">
                <p className="font-semibold text-slate-800">{obra.clientes.nombre}</p>
                {obra.clientes.telefono && (
                  <p className="mt-1 text-slate-600">Tel: {obra.clientes.telefono}</p>
                )}
                {obra.clientes.direccion && (
                  <p className="mt-1 text-slate-600">Dir: {obra.clientes.direccion}</p>
                )}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">Sin cliente asociado</p>
            )}
          </div>

          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Obra
            </h2>
            <div className="mt-2 space-y-1 text-sm text-slate-600">
              <p>
                <span className="font-semibold text-slate-800">{obra.nombre}</span>
              </p>
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
              {obra.descripcion && <p className="pt-1">{obra.descripcion}</p>}
              {obra.responsable && (
                <p>Responsable: {obra.responsable}</p>
              )}
              {obra.fecha_inicio && <p>Inicio: {formatFecha(obra.fecha_inicio)}</p>}
              {obra.fecha_estimada_fin && (
                <p>Fin estimado: {formatFecha(obra.fecha_estimada_fin)}</p>
              )}
            </div>
            <a
              href={`/obras/${id}/fotos`}
              className="mt-4 inline-flex items-center rounded-lg bg-blue-accent px-4 py-2 text-sm font-semibold text-white"
            >
              Ver fotos
            </a>
          </div>

          <PresupuestoSection obraId={id} onDatosCambiaron={notificarCambio} />
          <GastosRealesSection obraId={id} onDatosCambiaron={notificarCambio} />
          <GastosMaterialesSection obraId={id} onDatosCambiaron={notificarCambio} />
          <PagosClientesSection obraId={id} onDatosCambiaron={notificarCambio} />
          <BalanceSection obraId={id} refreshKey={refreshKey} />
        </div>
      </div>
    </div>
  )
}
