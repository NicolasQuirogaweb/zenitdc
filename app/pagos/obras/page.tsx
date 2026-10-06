'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatMoney } from '@/lib/utils/formato'
import { coincideBusqueda } from '@/lib/utils/texto'
import { calcularResumenGastosObra, agruparPorObra } from '@/lib/utils/resumenObra'
import { SkeletonLista } from '@/components/ui/Skeleton'
import BuscadorInput from '@/components/ui/BuscadorInput'

interface ObraConCliente {
  id: string
  nombre: string
  clientes: { nombre: string } | null
}

interface ObraConTotal extends ObraConCliente {
  totalGastado: number
}

export default function PagosObrasPage() {
  const [obras, setObras] = useState<ObraConTotal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase
        .from('obras')
        .select('id, nombre, clientes(nombre)')
        .order('created_at', { ascending: false }),
      supabase.from('gastos_generales').select('obra_id, concepto, monto'),
      supabase.from('gastos_materiales').select('obra_id, monto'),
      supabase.from('pagos_personal_tercerizado').select('obra_id, monto'),
      supabase.from('pagos_personal').select('obra_id, monto'),
    ]).then(([obrasRes, gastosGenerales, gastosMateriales, pagosPersonalTercerizado, pagosPersonal]) => {
      if (obrasRes.error) {
        setError('Error al cargar las obras')
        setLoading(false)
        return
      }

      const gastosGeneralesPorObra = agruparPorObra(gastosGenerales.data)
      const gastosMaterialesPorObra = agruparPorObra(gastosMateriales.data)
      const pagosPersonalTercerizadoPorObra = agruparPorObra(pagosPersonalTercerizado.data)
      const pagosPersonalPorObra = agruparPorObra(pagosPersonal.data)

      const obrasConTotal = ((obrasRes.data ?? []) as unknown as ObraConCliente[]).map((o) => ({
        ...o,
        totalGastado: calcularResumenGastosObra({
          gastosGenerales: gastosGeneralesPorObra.get(o.id) ?? [],
          gastosMateriales: gastosMaterialesPorObra.get(o.id) ?? [],
          pagosPersonalTercerizado: pagosPersonalTercerizadoPorObra.get(o.id) ?? [],
          pagosPersonal: pagosPersonalPorObra.get(o.id) ?? [],
        }).totalGastado,
      }))

      setObras(obrasConTotal)
      setLoading(false)
    })
  }, [])

  const obrasFiltradas = obras.filter((o) => coincideBusqueda(busqueda, o.nombre, o.clientes?.nombre))

  return (
    <div className="min-h-screen bg-[color:var(--color-bg-page)] p-4">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[color:var(--color-text-primary)]">Pagos de obras</h1>
          <Link href="/pagos" className="text-sm text-blue-light hover:underline">
            Volver
          </Link>
        </div>
        <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">
          Total gastado por obra (costos directos, materiales y gastos generales) — más reciente
          primero
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-red-alert/15 p-3 text-sm text-red-alert">{error}</p>
        )}

        {loading ? (
          <SkeletonLista />
        ) : obras.length === 0 ? (
          <p className="mt-8 text-center text-sm text-[color:var(--color-text-secondary)]">
            No hay obras aún
          </p>
        ) : (
          <>
            <BuscadorInput value={busqueda} onChange={setBusqueda} placeholder="Buscar por obra o cliente..." />
            {obrasFiltradas.length === 0 ? (
              <p className="mt-4 text-sm text-[color:var(--color-text-secondary)]">
                No se encontraron obras para &quot;{busqueda}&quot;
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {obrasFiltradas.map((o) => (
                  <li
                    key={o.id}
                    className="flex items-center justify-between rounded-lg bg-[color:var(--color-bg-surface)] p-3 shadow-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-[color:var(--color-text-primary)]">{o.nombre}</p>
                      {o.clientes && (
                        <p className="text-sm text-[color:var(--color-text-secondary)]">{o.clientes.nombre}</p>
                      )}
                      <p className="text-sm text-[color:var(--color-text-secondary)]">
                        Total gastado: <span className="font-semibold text-[color:var(--color-text-primary)]">{formatMoney(o.totalGastado)}</span>
                      </p>
                    </div>
                    <Link
                      href={`/obras/${o.id}`}
                      className="shrink-0 text-sm text-blue-light hover:underline"
                    >
                      Ver detalle
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  )
}
