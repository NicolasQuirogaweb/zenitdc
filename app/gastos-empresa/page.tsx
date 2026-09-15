'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatMoney, formatFecha } from '@/lib/utils/formato'
import { sumMonto, parsearMonto } from '@/lib/utils/numeros'
import { CONCEPTOS_GASTOS_EMPRESA } from '@/lib/constantes'
import SelectConOpciones from '@/components/ui/SelectConOpciones'
import FechaInput from '@/components/ui/FechaInput'
import { SkeletonLista } from '@/components/ui/Skeleton'
import { useToast } from '@/lib/hooks/useToast'
import { useConfirm } from '@/lib/hooks/useConfirm'
import type { GastoEmpresa } from '@/types'

export default function GastosEmpresaPage() {
  const [gastos, setGastos] = useState<GastoEmpresa[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [concepto, setConcepto] = useState('')
  const [monto, setMonto] = useState('')
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10))
  const [observaciones, setObservaciones] = useState('')
  const [agregando, setAgregando] = useState(false)
  const { showToast } = useToast()
  const confirm = useConfirm()

  const fetchGastos = () => {
    const supabase = createClient()
    supabase
      .from('gastos_empresa')
      .select('*')
      .order('fecha', { ascending: false })
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (data) setGastos(data)
        else if (error) setError('Error al cargar los gastos de la empresa')
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchGastos()
  }, [])

  const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault()
    const montoNum = parsearMonto(monto)
    if (!concepto.trim() || montoNum === null || !fecha) {
      setError('Completá el concepto, un monto mayor a 0 y la fecha')
      return
    }

    setError('')
    setAgregando(true)
    const res = await fetch('/api/gastos-empresa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        concepto: concepto.trim(),
        monto: montoNum,
        fecha,
        observaciones: observaciones.trim() || null,
      }),
    })

    setAgregando(false)
    if (!res.ok) {
      const err = await res.json()
      setError(typeof err.error === 'string' ? err.error : 'Error al registrar el gasto')
      return
    }

    setConcepto('')
    setMonto('')
    setFecha(new Date().toISOString().slice(0, 10))
    setObservaciones('')
    showToast('success', 'Gasto registrado')
    fetchGastos()
  }

  const handleEliminar = async (id: string, gastoMonto: number) => {
    if (!(await confirm(`¿Eliminar el gasto de ${formatMoney(gastoMonto)}?`))) return

    const res = await fetch(`/api/gastos-empresa/${id}`, { method: 'DELETE' })
    if (res.ok) {
      showToast('success', 'Gasto eliminado')
      fetchGastos()
    }
  }

  const total = sumMonto(gastos)

  return (
    <div className="min-h-screen bg-[color:var(--color-bg-page)] p-4">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[color:var(--color-text-primary)]">Gastos generales</h1>
          <Link href="/finanzas" className="text-sm text-blue-light hover:underline">
            Volver
          </Link>
        </div>
        <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">
          Gastos generales sin obra asociada (alquiler, impuestos, contador, etc.)
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-red-alert/15 p-3 text-sm text-red-alert">{error}</p>
        )}

        <div className="mt-4 rounded-lg bg-[color:var(--color-bg-surface)] p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-[color:var(--color-text-primary)]">Registrar gasto</h2>
          <form onSubmit={handleAgregar} className="mt-3 grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <SelectConOpciones
                label="Concepto"
                id="concepto"
                opciones={CONCEPTOS_GASTOS_EMPRESA}
                value={concepto}
                onChange={setConcepto}
                placeholder="Ej: Gastos administrativos"
              />
            </div>
            <div>
              <label htmlFor="monto" className="block text-sm font-medium text-[color:var(--color-text-secondary)]">
                Monto
              </label>
              <input
                id="monto"
                type="number"
                inputMode="decimal"
                min="0.01"
                step="0.01"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="0,00"
                className="input-field"
              />
            </div>
            <div>
              <label htmlFor="fecha" className="block text-sm font-medium text-[color:var(--color-text-secondary)]">
                Fecha
              </label>
              <FechaInput id="fecha" value={fecha} onChange={setFecha} />
            </div>
            <div className="col-span-2">
              <label htmlFor="observaciones" className="block text-sm font-medium text-[color:var(--color-text-secondary)]">
                Observaciones
              </label>
              <input
                id="observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="input-field"
              />
            </div>
            <button
              type="submit"
              disabled={agregando}
              className="col-span-2 rounded-lg bg-blue-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
            >
              {agregando ? 'Registrando...' : '+ Registrar gasto'}
            </button>
          </form>
        </div>

        <div className="mt-4 rounded-lg bg-[color:var(--color-bg-surface)] p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-[color:var(--color-text-primary)]">Historial</h2>
          {loading ? (
            <SkeletonLista />
          ) : (
            <>
              <div className="mt-2 divide-y divide-[color:var(--color-border)]">
                {gastos.length === 0 ? (
                  <p className="py-3 text-sm text-[color:var(--color-text-secondary)]">No hay gastos registrados aún</p>
                ) : (
                  gastos.map((gasto) => (
                    <div key={gasto.id} className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-medium text-[color:var(--color-text-primary)]">{gasto.concepto}</p>
                        <p className="text-sm text-[color:var(--color-text-secondary)]">
                          {formatMoney(Number(gasto.monto))} · {formatFecha(gasto.fecha)}
                        </p>
                        {gasto.observaciones && (
                          <p className="text-xs text-[color:var(--color-text-muted)]">{gasto.observaciones}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleEliminar(gasto.id, Number(gasto.monto))}
                        className="text-sm text-red-alert hover:underline"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))
                )}
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
