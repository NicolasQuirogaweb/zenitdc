'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatMoney, formatFecha } from '@/lib/utils/formato'
import { sumMonto } from '@/lib/utils/numeros'
import { coincideBusqueda } from '@/lib/utils/texto'
import { SkeletonLista } from '@/components/ui/Skeleton'
import BuscadorInput from '@/components/ui/BuscadorInput'

interface PagoConNombre {
  id: string
  fecha: string
  created_at: string
  monto: number
  motivo: string
  personal_empresa: { nombre: string } | null
  obras: { nombre: string } | null
}

export default function PagosPersonalPage() {
  const [pagos, setPagos] = useState<PagoConNombre[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('pagos_personal')
      .select('*, personal_empresa(nombre), obras(nombre)')
      .order('fecha', { ascending: false })
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (data) setPagos(data as unknown as PagoConNombre[])
        else if (error) setError('Error al cargar los pagos')
        setLoading(false)
      })
  }, [])

  const pagosFiltrados = pagos.filter((p) =>
    coincideBusqueda(busqueda, p.personal_empresa?.nombre, p.motivo, p.obras?.nombre)
  )
  const total = sumMonto(pagosFiltrados)

  return (
    <div className="min-h-screen bg-[color:var(--color-bg-page)] p-4">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[color:var(--color-text-primary)]">
            Pagos a empleados de la empresa
          </h1>
          <Link href="/pagos" className="text-sm text-blue-light hover:underline">
            Volver
          </Link>
        </div>
        <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">
          Historial de todos los pagos a personal propio — de solo lectura, se sigue cargando
          desde la ficha de cada empleado
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-red-alert/15 p-3 text-sm text-red-alert">{error}</p>
        )}

        <div className="mt-4 rounded-lg bg-[color:var(--color-bg-surface)] p-4 shadow-sm">
          {loading ? (
            <SkeletonLista />
          ) : pagos.length === 0 ? (
            <p className="py-3 text-sm text-[color:var(--color-text-secondary)]">
              No hay pagos registrados aún
            </p>
          ) : (
            <>
              <BuscadorInput
                value={busqueda}
                onChange={setBusqueda}
                placeholder="Buscar por nombre, motivo u obra..."
              />
              {pagosFiltrados.length === 0 ? (
                <p className="mt-4 py-3 text-sm text-[color:var(--color-text-secondary)]">
                  No se encontraron pagos para &quot;{busqueda}&quot;
                </p>
              ) : (
                <>
                  <div className="mt-4 divide-y divide-[color:var(--color-border)]">
                    {pagosFiltrados.map((p) => (
                      <div key={p.id} className="flex items-start justify-between gap-3 py-3">
                        <div className="min-w-0">
                          <p className="font-medium text-[color:var(--color-text-primary)]">
                            {p.personal_empresa?.nombre ?? 'Sin nombre'}
                          </p>
                          <p className="text-sm text-[color:var(--color-text-secondary)]">
                            {formatFecha(p.fecha)} · {p.motivo}
                          </p>
                          <p className="text-xs text-[color:var(--color-text-muted)]">
                            {p.obras?.nombre ?? 'Sin obra asociada'}
                          </p>
                        </div>
                        <p className="shrink-0 font-semibold text-[color:var(--color-text-primary)]">
                          {formatMoney(Number(p.monto))}
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}
