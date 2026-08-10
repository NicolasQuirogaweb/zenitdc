'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatMoney, formatFecha } from '@/lib/utils/formato'
import { METODOS_PAGO } from '@/lib/constantes'
import SelectConOpciones from '@/components/ui/SelectConOpciones'
import type { PagoCliente } from '@/types'

interface Props {
  obraId: string
  onDatosCambiaron?: () => void
}

export default function PagosClientesSection({ obraId, onDatosCambiaron }: Props) {
  const [pagos, setPagos] = useState<PagoCliente[]>([])
  const [error, setError] = useState('')
  const [monto, setMonto] = useState('')
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10))
  const [metodoPago, setMetodoPago] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [agregando, setAgregando] = useState(false)

  const fetchPagos = () => {
    const supabase = createClient()
    supabase
      .from('pagos_clientes')
      .select('*')
      .eq('obra_id', obraId)
      .order('fecha', { ascending: false })
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setPagos(data)
      })
  }

  useEffect(() => {
    fetchPagos()
  }, [obraId])

  const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault()
    const montoNum = Number(monto)
    if (!montoNum || montoNum <= 0 || !fecha) {
      setError('Completá el monto (mayor a 0) y la fecha')
      return
    }

    setError('')
    setAgregando(true)
    const res = await fetch(`/api/obras/${obraId}/pagos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        monto: montoNum,
        fecha,
        metodo_pago: metodoPago.trim() || null,
        observaciones: observaciones.trim() || null,
      }),
    })

    setAgregando(false)
    if (!res.ok) {
      const err = await res.json()
      setError(typeof err.error === 'string' ? err.error : 'Error al registrar pago')
      return
    }

    setMonto('')
    setFecha(new Date().toISOString().slice(0, 10))
    setMetodoPago('')
    setObservaciones('')
    fetchPagos()
    onDatosCambiaron?.()
  }

  const handleEliminar = async (pagoId: string, pagoMonto: number) => {
    if (!confirm(`¿Eliminar el pago de ${formatMoney(pagoMonto)}?`)) return

    const res = await fetch(`/api/pagos/${pagoId}`, { method: 'DELETE' })
    if (res.ok) {
      fetchPagos()
      onDatosCambiaron?.()
    }
  }

  return (
    <div className="rounded-lg bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800">Pagos del cliente</h2>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-alert">{error}</p>
      )}

      <form onSubmit={handleAgregar} className="mt-4 grid grid-cols-2 gap-3">
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
          <SelectConOpciones
            label="Método de pago"
            id="metodoPago"
            opciones={METODOS_PAGO}
            value={metodoPago}
            onChange={setMetodoPago}
            placeholder="Escribí el método de pago"
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
          {agregando ? 'Registrando...' : '+ Registrar pago'}
        </button>
      </form>

      <div className="mt-4 divide-y divide-slate-100">
        {pagos.length === 0 ? (
          <p className="py-3 text-sm text-slate-500">No hay pagos registrados aún</p>
        ) : (
          pagos.map((pago) => (
            <div key={pago.id} className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-slate-800">
                  {formatMoney(Number(pago.monto))}
                </p>
                <p className="text-sm text-slate-500">
                  {formatFecha(pago.fecha)}
                  {pago.metodo_pago && ` · ${pago.metodo_pago}`}
                </p>
                {pago.observaciones && (
                  <p className="text-xs text-slate-400">{pago.observaciones}</p>
                )}
              </div>
              <button
                onClick={() => handleEliminar(pago.id, Number(pago.monto))}
                className="text-sm text-red-alert hover:underline"
              >
                Eliminar
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
