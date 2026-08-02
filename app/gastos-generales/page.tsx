'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatMoney, formatFecha } from '@/lib/utils/formato'
import type { GastoGeneral } from '@/types'

export default function GastosGeneralesPage() {
  const [gastos, setGastos] = useState<GastoGeneral[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [concepto, setConcepto] = useState('')
  const [monto, setMonto] = useState('')
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10))
  const [observaciones, setObservaciones] = useState('')
  const [agregando, setAgregando] = useState(false)

  const fetchGastos = () => {
    const supabase = createClient()
    supabase
      .from('gastos_generales')
      .select('*')
      .order('fecha', { ascending: false })
      .then(({ data }) => {
        if (data) setGastos(data)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchGastos()
  }, [])

  const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault()
    const montoNum = Number(monto)
    if (!concepto.trim() || !montoNum || montoNum <= 0 || !fecha) {
      setError('Completá el concepto, un monto mayor a 0 y la fecha')
      return
    }

    setError('')
    setAgregando(true)
    const res = await fetch('/api/gastos-generales', {
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
      setError(typeof err.error === 'string' ? err.error : 'Error al registrar gasto')
      return
    }

    setConcepto('')
    setMonto('')
    setFecha(new Date().toISOString().slice(0, 10))
    setObservaciones('')
    fetchGastos()
  }

  const handleEliminar = async (gastoId: string, gastoMonto: number) => {
    if (!confirm(`¿Eliminar el gasto de ${formatMoney(gastoMonto)}?`)) return

    const res = await fetch(`/api/gastos-generales/${gastoId}`, { method: 'DELETE' })
    if (res.ok) fetchGastos()
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
          <h1 className="text-xl font-bold text-slate-800">Gastos Generales</h1>
          <a href="/dashboard" className="text-sm text-blue-accent hover:underline">
            Volver
          </a>
        </div>

        <p className="mt-1 text-sm text-slate-500">
          Combustible, seguros, sueldos y otros gastos de la empresa
        </p>

        <div className="mt-6 rounded-lg bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Nuevo gasto</h2>

          {error && (
            <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-alert">{error}</p>
          )}

          <form onSubmit={handleAgregar} className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="concepto" className="block text-sm font-medium text-slate-700">
                Concepto
              </label>
              <input
                id="concepto"
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                placeholder="Ej: Combustible"
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-blue-accent focus:ring-1 focus:ring-blue-accent"
              />
            </div>
            <div>
              <label htmlFor="monto" className="block text-sm font-medium text-slate-700">
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
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-blue-accent focus:ring-1 focus:ring-blue-accent"
              />
            </div>
            <div>
              <label htmlFor="fecha" className="block text-sm font-medium text-slate-700">
                Fecha
              </label>
              <input
                id="fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-blue-accent focus:ring-1 focus:ring-blue-accent"
              />
            </div>
            <div className="col-span-2">
              <label htmlFor="observaciones" className="block text-sm font-medium text-slate-700">
                Observaciones
              </label>
              <input
                id="observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-blue-accent focus:ring-1 focus:ring-blue-accent"
              />
            </div>
            <button
              type="submit"
              disabled={agregando}
              className="col-span-2 rounded-lg bg-blue-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {agregando ? 'Registrando...' : '+ Registrar gasto'}
            </button>
          </form>
        </div>

        <div className="mt-4 divide-y divide-slate-100 rounded-lg bg-white p-4 shadow-sm">
          <h2 className="pb-2 text-lg font-semibold text-slate-800">Gastos registrados</h2>
          {gastos.length === 0 ? (
            <p className="py-3 text-sm text-slate-500">No hay gastos generales registrados aún</p>
          ) : (
            gastos.map((gasto) => (
              <div key={gasto.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-slate-800">
                    {gasto.concepto}
                  </p>
                  <p className="text-sm text-slate-500">
                    {formatMoney(Number(gasto.monto))} · {formatFecha(gasto.fecha)}
                  </p>
                  {gasto.observaciones && (
                    <p className="text-xs text-slate-400">{gasto.observaciones}</p>
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
      </div>
    </div>
  )
}
