'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatMoney, formatFecha } from '@/lib/utils/formato'
import { sumMonto } from '@/lib/utils/numeros'
import { CONCEPTOS_COSTOS_DIRECTOS } from '@/lib/constantes'
import { SkeletonLista } from '@/components/ui/Skeleton'

type Categoria =
  | 'Costos directos'
  | 'Gastos generales'
  | 'Materiales'
  | 'Personal'
  | 'Personal tercerizado'

interface Movimiento {
  id: string
  fecha: string
  createdAt: string
  monto: number
  categoria: Categoria
  descripcion: string
  obraNombre: string | null
}

const COLOR_CATEGORIA: Record<Categoria, string> = {
  'Costos directos': 'bg-blue-accent/15 text-blue-light',
  'Gastos generales': 'bg-blue-accent/15 text-blue-light',
  Materiales: 'bg-[color:var(--color-text-muted)]/15 text-[color:var(--color-text-secondary)]',
  Personal: 'bg-green-alert/15 text-green-600',
  'Personal tercerizado': 'bg-green-alert/15 text-green-600',
}

export default function PagosPage() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const supabase = createClient()

    Promise.all([
      supabase.from('gastos_generales').select('*, obras(nombre), proveedores(nombre)'),
      supabase.from('gastos_materiales').select('*, obras(nombre), proveedores(nombre)'),
      supabase.from('pagos_personal').select('*, obras(nombre), personal_empresa(nombre)'),
      supabase
        .from('pagos_personal_tercerizado')
        .select('*, obras(nombre), personal_tercerizado(nombre)'),
      supabase.from('gastos_empresa').select('*'),
    ]).then(
      ([gastosGenerales, gastosMateriales, pagosPersonal, pagosPersonalTercerizado, gastosEmpresa]) => {
        const algunError = [
          gastosGenerales,
          gastosMateriales,
          pagosPersonal,
          pagosPersonalTercerizado,
          gastosEmpresa,
        ].some((r) => r.error)
        if (algunError) {
          setError('Error al cargar los pagos')
          setLoading(false)
          return
        }

        const todos: Movimiento[] = [
          ...(gastosGenerales.data ?? []).map((g): Movimiento => ({
            id: `gg-${g.id}`,
            fecha: g.fecha,
            createdAt: g.created_at,
            monto: Number(g.monto),
            categoria: CONCEPTOS_COSTOS_DIRECTOS.includes(g.concepto)
              ? 'Costos directos'
              : 'Gastos generales',
            descripcion: [g.concepto, g.proveedores?.nombre].filter(Boolean).join(' · '),
            obraNombre: g.obras?.nombre ?? null,
          })),
          ...(gastosMateriales.data ?? []).map((g): Movimiento => ({
            id: `gm-${g.id}`,
            fecha: g.fecha,
            createdAt: g.created_at,
            monto: Number(g.monto),
            categoria: 'Materiales',
            descripcion: [g.material, g.cantidad, g.proveedores?.nombre].filter(Boolean).join(' · '),
            obraNombre: g.obras?.nombre ?? null,
          })),
          ...(pagosPersonal.data ?? []).map((p): Movimiento => ({
            id: `pp-${p.id}`,
            fecha: p.fecha,
            createdAt: p.created_at,
            monto: Number(p.monto),
            categoria: 'Personal',
            descripcion: [p.personal_empresa?.nombre, p.motivo].filter(Boolean).join(' · '),
            obraNombre: p.obras?.nombre ?? null,
          })),
          ...(pagosPersonalTercerizado.data ?? []).map((p): Movimiento => ({
            id: `ppt-${p.id}`,
            fecha: p.fecha,
            createdAt: p.created_at,
            monto: Number(p.monto),
            categoria: 'Personal tercerizado',
            descripcion: [p.personal_tercerizado?.nombre, p.motivo].filter(Boolean).join(' · '),
            obraNombre: p.obras?.nombre ?? null,
          })),
          ...(gastosEmpresa.data ?? []).map((g): Movimiento => ({
            id: `ge-${g.id}`,
            fecha: g.fecha,
            createdAt: g.created_at,
            monto: Number(g.monto),
            categoria: 'Gastos generales',
            descripcion: [g.concepto, g.observaciones].filter(Boolean).join(' · '),
            obraNombre: null,
          })),
        ]

        todos.sort((a, b) => {
          if (a.fecha !== b.fecha) return a.fecha < b.fecha ? 1 : -1
          return a.createdAt < b.createdAt ? 1 : -1
        })

        setMovimientos(todos)
        setLoading(false)
      }
    )
  }, [])

  const total = sumMonto(movimientos)

  return (
    <div className="min-h-screen bg-[color:var(--color-bg-page)] p-4">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[color:var(--color-text-primary)]">Pagos</h1>
          <Link href="/finanzas" className="text-sm text-blue-light hover:underline">
            Volver
          </Link>
        </div>
        <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">
          Todo lo que la empresa va pagando, más reciente primero — de solo lectura, cada cosa se
          sigue cargando desde su propia sección
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-red-alert/15 p-3 text-sm text-red-alert">{error}</p>
        )}

        <div className="mt-4 rounded-lg bg-[color:var(--color-bg-surface)] p-4 shadow-sm">
          {loading ? (
            <SkeletonLista />
          ) : movimientos.length === 0 ? (
            <p className="py-3 text-sm text-[color:var(--color-text-secondary)]">
              No hay pagos ni gastos registrados aún
            </p>
          ) : (
            <>
              <div className="divide-y divide-[color:var(--color-border)]">
                {movimientos.map((m) => (
                  <div key={m.id} className="flex items-start justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${COLOR_CATEGORIA[m.categoria]}`}
                        >
                          {m.categoria}
                        </span>
                        <p className="text-sm text-[color:var(--color-text-secondary)]">
                          {formatFecha(m.fecha)}
                        </p>
                      </div>
                      <p className="mt-1 font-medium text-[color:var(--color-text-primary)]">
                        {m.descripcion || 'Sin descripción'}
                      </p>
                      <p className="text-xs text-[color:var(--color-text-muted)]">
                        {m.obraNombre ?? 'Sin obra asociada'}
                      </p>
                    </div>
                    <p className="shrink-0 font-semibold text-[color:var(--color-text-primary)]">
                      {formatMoney(m.monto)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[color:var(--color-border)] pt-3">
                <p className="font-semibold text-[color:var(--color-text-primary)]">Total</p>
                <p className="font-semibold text-[color:var(--color-text-primary)]">{formatMoney(total)}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
