'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatMoney, formatFecha } from '@/lib/utils/formato'
import { CONCEPTOS_GASTOS_REALES } from '@/lib/constantes'
import SelectConOpciones from '@/components/ui/SelectConOpciones'
import type { GastoGeneral } from '@/types'

interface Props {
  obraId: string
  onDatosCambiaron?: () => void
}

export default function GastosRealesSection({ obraId, onDatosCambiaron }: Props) {
  const [gastos, setGastos] = useState<GastoGeneral[]>([])
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
      .eq('obra_id', obraId)
      .order('fecha', { ascending: false })
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setGastos(data as GastoGeneral[])
      })
  }

  useEffect(() => {
    fetchGastos()
  }, [obraId])

  const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault()
    const montoNum = Number(monto)
    if (!concepto.trim() || !montoNum || montoNum <= 0 || !fecha) {
      setError('Completá el concepto, un monto mayor a 0 y la fecha')
      return
    }

    setError('')
    setAgregando(true)
    const res = await fetch(`/api/obras/${obraId}/gastos-generales`, {
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
    onDatosCambiaron?.()
  }

  const handleEliminar = async (gastoId: string, gastoMonto: number) => {
    if (!confirm(`¿Eliminar el gasto de ${formatMoney(gastoMonto)}?`)) return

    const res = await fetch(`/api/gastos-generales/${gastoId}`, { method: 'DELETE' })
    if (res.ok) {
      fetchGastos()
      onDatosCambiaron?.()
    }
  }

  const total = gastos.reduce((s, g) => s + Number(g.monto), 0)

  return (
    <div className="rounded-lg bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800">Gastos generales de la obra</h2>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-alert">{error}</p>
      )}

      <form onSubmit={handleAgregar} className="mt-4 grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <SelectConOpciones
            label="Concepto"
            id="concepto"
            opciones={CONCEPTOS_GASTOS_REALES}
            value={concepto}
            onChange={setConcepto}
            placeholder="Ej: Seguro de obra"
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
          {agregando ? 'Registrando...' : '+ Registrar gasto real'}
        </button>
      </form>

      <div className="mt-4 divide-y divide-slate-100">
        {gastos.length === 0 ? (
          <p className="py-3 text-sm text-slate-500">No hay gastos reales registrados aún</p>
        ) : (
          gastos.map((gasto) => (
            <div key={gasto.id} className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-slate-800">{gasto.concepto}</p>
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

      <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
        <p className="font-semibold text-slate-800">Total en gastos reales</p>
        <p className="font-semibold text-slate-800">{formatMoney(total)}</p>
      </div>
    </div>
  )
}
