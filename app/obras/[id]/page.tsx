'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatFecha } from '@/lib/utils/formato'
import { CONCEPTOS_COSTOS_DIRECTOS, CONCEPTOS_GASTOS_REALES } from '@/lib/constantes'
import LoadingScreen from '@/components/ui/LoadingScreen'
import { SkeletonDetalleObra } from '@/components/ui/Skeleton'
import EstadoObraBadge from '@/components/ui/EstadoObraBadge'
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
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const notificarCambio = () => setRefreshKey((k) => k + 1)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('obras')
      .select('*, clientes(*)')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (data) setObra(data as unknown as ObraConCliente)
        else if (error) setError('Error al cargar la obra')
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return <SkeletonDetalleObra />
  }

  if (!obra) {
    return <LoadingScreen mensaje={error || 'Obra no encontrada'} />
  }

  return (
    <div className="min-h-screen bg-[color:var(--color-bg-page)] p-4">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[color:var(--color-text-primary)]">{obra.nombre}</h1>
          <a
            href={`/clientes/${obra.cliente_id}/obras`}
            className="text-sm text-blue-light hover:underline"
          >
            Volver
          </a>
        </div>

        <div className="mt-4 space-y-4">
          <div className="rounded-lg bg-[color:var(--color-bg-surface)] p-4 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[color:var(--color-text-secondary)]">
              Cliente
            </h2>
            {obra.clientes ? (
              <div className="mt-2 text-sm">
                <p className="font-semibold text-[color:var(--color-text-primary)]">{obra.clientes.nombre}</p>
                {obra.clientes.telefono && (
                  <p className="mt-1 text-[color:var(--color-text-secondary)]">Tel: {obra.clientes.telefono}</p>
                )}
                {obra.clientes.direccion && (
                  <p className="mt-1 text-[color:var(--color-text-secondary)]">Dir: {obra.clientes.direccion}</p>
                )}
              </div>
            ) : (
              <p className="mt-2 text-sm text-[color:var(--color-text-secondary)]">Sin cliente asociado</p>
            )}
          </div>

          <div className="rounded-lg bg-[color:var(--color-bg-surface)] p-4 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[color:var(--color-text-secondary)]">
              Obra
            </h2>
            <div className="mt-2 space-y-1 text-sm text-[color:var(--color-text-secondary)]">
              <p>
                <span className="font-semibold text-[color:var(--color-text-primary)]">{obra.nombre}</span>
              </p>
              <EstadoObraBadge estado={obra.estado} />
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
          <GastosRealesSection
            obraId={id}
            titulo="Costos directos de obra"
            subtitulo="Mano de obra, instalación eléctrica y movimiento de suelo"
            conceptosSugeridos={CONCEPTOS_COSTOS_DIRECTOS}
            filtro={(c) => CONCEPTOS_COSTOS_DIRECTOS.includes(c)}
            placeholder="Ej: Cuadrilla de albañilería"
            onDatosCambiaron={notificarCambio}
          />
          <GastosMaterialesSection obraId={id} onDatosCambiaron={notificarCambio} />
          <PagosClientesSection obraId={id} onDatosCambiaron={notificarCambio} />
          <GastosRealesSection
            obraId={id}
            titulo="Gastos generales de la obra"
            subtitulo="Gastos indirectos de la obra (seguros, combustible, etc.)"
            conceptosSugeridos={CONCEPTOS_GASTOS_REALES}
            filtro={(c) => !CONCEPTOS_COSTOS_DIRECTOS.includes(c)}
            placeholder="Ej: Seguro de obra"
            onDatosCambiaron={notificarCambio}
          />
          <BalanceSection obraId={id} refreshKey={refreshKey} />
        </div>
      </div>
    </div>
  )
}
