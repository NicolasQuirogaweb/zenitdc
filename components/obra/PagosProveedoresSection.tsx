'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatMoney, formatFecha } from '@/lib/utils/formato'
import type { PagoProveedor } from '@/types'

interface Props {
  obraId: string
}

export default function PagosProveedoresSection({ obraId }: Props) {
  const [pagos, setPagos] = useState<PagoProveedor[]>([])
  const [error, setError] = useState('')
  const [proveedor, setProveedor] = useState('')
  const [concepto, setConcepto] = useState('')
  const [monto, setMonto] = useState('')
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10))
  const [observaciones, setObservaciones] = useState('')
  const [agregando, setAgregando] = useState(false)

  const fetchPagos = () => {
    const supabase = createClient()
    supabase
      .from('pagos_proveedores')
      .select('*')
      .eq('obra_id', obraId)
      .order('fecha', { ascending: false })
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
    if (!proveedor.trim() || !montoNum || montoNum <= 0 || !fecha) {
      setError('Completá el proveedor, un monto mayor a 0 y la fecha')
      return
    }

    setError('')
    setAgregando(true)
    const res = await fetch(`/api/obras/${obraId}/pagos-proveedor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proveedor: proveedor.trim(),
        concepto: concepto.trim() || null,
        monto: montoNum,
        fecha,
        observaciones: observaciones.trim() || null,
      }),
    })

    setAgregando(false)
    if (!res.ok) {
      const err = await res.json()
      setError(typeof err.error === 'string' ? err.error : 'Error al registrar pago')
      return
    }

    setProveedor('')
    setConcepto('')
    setMonto('')
    setFecha(new Date().toISOString().slice(0, 10))
    setObservaciones('')
    fetchPagos()
  }

  const handleEliminar = async (pagoId: string, pagoMonto: number) => {
    if (!confirm(`¿Eliminar el pago a proveedor de ${formatMoney(pagoMonto)}?`)) return

    const res = await fetch(`/api/pagos-proveedor/${pagoId}`, { method: 'DELETE' })
    if (res.ok) fetchPagos()
  }

  const total = pagos.reduce((s, p) => s + Number(p.monto), 0)

  return (
    <div className="rounded-lg bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800">Pagos a proveedores</h2>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-alert">{error}</p>
      )}

      <form onSubmit={handleAgregar} className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="proveedor" className="block text-sm font-medium text-slate-700">
            Proveedor
          </label>
          <input
            id="proveedor"
            value={proveedor}
            onChange={(e) => setProveedor(e.target.value)}
            placeholder="Ej: Ferretería Central"
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-blue-accent focus:ring-1 focus:ring-blue-accent"
          />
        </div>
        <div>
          <label htmlFor="concepto" className="block text-sm font-medium text-slate-700">
            Concepto
          </label>
          <input
            id="concepto"
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
            placeholder="Ej: Material eléctrico"
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
          {agregando ? 'Registrando...' : '+ Registrar pago a proveedor'}
        </button>
      </form>

      <div className="mt-4 divide-y divide-slate-100">
        {pagos.length === 0 ? (
          <p className="py-3 text-sm text-slate-500">No hay pagos a proveedores registrados aún</p>
        ) : (
          pagos.map((pago) => (
            <div key={pago.id} className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-slate-800">
                  {pago.proveedor}
                  {pago.concepto && <span className="text-slate-500"> · {pago.concepto}</span>}
                </p>
                <p className="text-sm text-slate-500">
                  {formatMoney(Number(pago.monto))} · {formatFecha(pago.fecha)}
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

      <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
        <p className="font-semibold text-slate-800">Total pagado a proveedores</p>
        <p className="font-semibold text-slate-800">{formatMoney(total)}</p>
      </div>
    </div>
  )
}
