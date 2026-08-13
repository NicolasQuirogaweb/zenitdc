'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatMoney, formatFecha } from '@/lib/utils/formato'
import { METODOS_PAGO } from '@/lib/constantes'
import SelectConOpciones from '@/components/ui/SelectConOpciones'
import FechaInput from '@/components/ui/FechaInput'
import CollapsibleCard from '@/components/ui/CollapsibleCard'
import { useToast } from '@/lib/hooks/useToast'
import { useConfirm } from '@/lib/hooks/useConfirm'
import type { PagoCliente } from '@/types'

interface Props {
  obraId: string
  onDatosCambiaron?: () => void
}

export default function PagosClientesSection({ obraId, onDatosCambiaron }: Props) {
  const [pagos, setPagos] = useState<PagoCliente[]>([])
  const [error, setError] = useState('')
  const { showToast } = useToast()
  const confirm = useConfirm()
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
      .then(({ data, error }) => {
        if (data) setPagos(data)
        else if (error) setError('Error al cargar los pagos')
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
    showToast('success', 'Pago registrado')
    fetchPagos()
    onDatosCambiaron?.()
  }

  const handleEliminar = async (pagoId: string, pagoMonto: number) => {
    if (!(await confirm(`¿Eliminar el pago de ${formatMoney(pagoMonto)}?`))) return

    const res = await fetch(`/api/pagos/${pagoId}`, { method: 'DELETE' })
    if (res.ok) {
      showToast('success', 'Pago eliminado')
      fetchPagos()
      onDatosCambiaron?.()
    }
  }

  const total = pagos.reduce((s, p) => s + Number(p.monto), 0)

  return (
    <CollapsibleCard
      titulo="Pagos del cliente"
      subtitulo="Registrá los pagos recibidos del cliente"
    >
      {error && (
        <p className="mt-3 rounded-lg bg-red-alert/15 p-3 text-sm text-red-alert">{error}</p>
      )}

      <form onSubmit={handleAgregar} className="mt-4 grid grid-cols-2 gap-3">
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
          {agregando ? 'Registrando...' : '+ Registrar pago'}
        </button>
      </form>

      <div className="mt-4 divide-y divide-[color:var(--color-border)]">
        {pagos.length === 0 ? (
          <p className="py-3 text-sm text-[color:var(--color-text-secondary)]">No hay pagos registrados aún</p>
        ) : (
          pagos.map((pago) => (
            <div key={pago.id} className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-[color:var(--color-text-primary)]">
                  {formatMoney(Number(pago.monto))}
                </p>
                <p className="text-sm text-[color:var(--color-text-secondary)]">
                  {formatFecha(pago.fecha)}
                  {pago.metodo_pago && ` · ${pago.metodo_pago}`}
                </p>
                {pago.observaciones && (
                  <p className="text-xs text-[color:var(--color-text-muted)]">{pago.observaciones}</p>
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

      <div className="mt-4 flex items-center justify-between border-t border-[color:var(--color-border)] pt-3">
        <p className="font-semibold text-[color:var(--color-text-primary)]">Total pagado por el cliente.</p>
        <p className="font-semibold text-[color:var(--color-text-primary)]">{formatMoney(total)}</p>
      </div>
    </CollapsibleCard>
  )
}
