'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatMoney, formatFecha } from '@/lib/utils/formato'
import { sumMonto, parsearMonto } from '@/lib/utils/numeros'
import FechaInput from '@/components/ui/FechaInput'
import CollapsibleCard from '@/components/ui/CollapsibleCard'
import { useToast } from '@/lib/hooks/useToast'
import { useConfirm } from '@/lib/hooks/useConfirm'
import type { PersonalEmpresa, PagoPersonal } from '@/types'

interface Props {
  obraId: string
  onDatosCambiaron?: () => void
}

interface PagoConPersonal extends PagoPersonal {
  personal_empresa: { nombre: string } | null
}

export default function PersonalSection({ obraId, onDatosCambiaron }: Props) {
  const [personal, setPersonal] = useState<PersonalEmpresa[]>([])
  const [pagos, setPagos] = useState<PagoConPersonal[]>([])
  const [error, setError] = useState('')
  const { showToast } = useToast()
  const confirm = useConfirm()

  const [personalPago, setPersonalPago] = useState('')
  const [montoPago, setMontoPago] = useState('')
  const [fechaPago, setFechaPago] = useState(() => new Date().toISOString().slice(0, 10))
  const [observacionesPago, setObservacionesPago] = useState('')
  const [guardandoPago, setGuardandoPago] = useState(false)

  const fetchTodo = () => {
    const supabase = createClient()
    supabase.from('personal_empresa').select('*').order('nombre').then(({ data }) => {
      if (data) setPersonal(data)
    })
    supabase
      .from('pagos_personal')
      .select('*, personal_empresa(nombre)')
      .eq('obra_id', obraId)
      .order('fecha', { ascending: false })
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (data) setPagos(data as unknown as PagoConPersonal[])
        else if (error) setError('Error al cargar los pagos de personal')
      })
  }

  useEffect(() => {
    fetchTodo()
  }, [obraId])

  const handlePagar = async (e: React.FormEvent) => {
    e.preventDefault()
    const montoNum = parsearMonto(montoPago)
    if (!personalPago || montoNum === null || !fechaPago) {
      setError('Completá el empleado, un monto mayor a 0 y la fecha')
      return
    }

    setError('')
    setGuardandoPago(true)
    const res = await fetch(`/api/obras/${obraId}/personal/pagos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personal_id: personalPago,
        monto: montoNum,
        fecha: fechaPago,
        observaciones: observacionesPago.trim() || null,
      }),
    })

    setGuardandoPago(false)
    if (!res.ok) {
      const err = await res.json()
      setError(typeof err.error === 'string' ? err.error : 'Error al registrar el pago')
      return
    }

    setPersonalPago('')
    setMontoPago('')
    setFechaPago(new Date().toISOString().slice(0, 10))
    setObservacionesPago('')
    showToast('success', 'Pago registrado')
    fetchTodo()
    onDatosCambiaron?.()
  }

  const handleEliminarPago = async (pagoId: string, monto: number) => {
    if (!(await confirm(`¿Eliminar el pago de ${formatMoney(monto)}?`))) return

    const res = await fetch(`/api/personal-pagos/${pagoId}`, { method: 'DELETE' })
    if (res.ok) {
      showToast('success', 'Pago eliminado')
      fetchTodo()
      onDatosCambiaron?.()
    }
  }

  const totalPagado = sumMonto(pagos)

  return (
    <CollapsibleCard
      titulo="Personal de la empresa"
      subtitulo="Pagos a personal propio (en relación de dependencia) por esta obra"
    >
      {error && (
        <p className="mt-3 rounded-lg bg-red-alert/15 p-3 text-sm text-red-alert">{error}</p>
      )}

      {pagos.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-[color:var(--color-text-muted)]">Total pagado en esta obra</p>
          <p className="font-semibold text-[color:var(--color-text-primary)]">{formatMoney(totalPagado)}</p>
        </div>
      )}

      <div className="mt-4 border-t border-[color:var(--color-border)] pt-4">
        <h3 className="text-sm font-semibold text-[color:var(--color-text-primary)]">Registrar pago</h3>
        <form onSubmit={handlePagar} className="mt-2 grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label htmlFor="personalPago" className="block text-sm font-medium text-[color:var(--color-text-secondary)]">
              Empleado
            </label>
            <select
              id="personalPago"
              value={personalPago}
              onChange={(e) => setPersonalPago(e.target.value)}
              className="input-field"
            >
              <option value="">Seleccionar empleado...</option>
              {personal.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="montoPago" className="block text-sm font-medium text-[color:var(--color-text-secondary)]">
              Monto
            </label>
            <input
              id="montoPago"
              type="number"
              inputMode="decimal"
              min="0.01"
              step="0.01"
              value={montoPago}
              onChange={(e) => setMontoPago(e.target.value)}
              placeholder="0,00"
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="fechaPago" className="block text-sm font-medium text-[color:var(--color-text-secondary)]">
              Fecha
            </label>
            <FechaInput id="fechaPago" value={fechaPago} onChange={setFechaPago} />
          </div>
          <div className="col-span-2">
            <label htmlFor="observacionesPago" className="block text-sm font-medium text-[color:var(--color-text-secondary)]">
              Observaciones
            </label>
            <input
              id="observacionesPago"
              value={observacionesPago}
              onChange={(e) => setObservacionesPago(e.target.value)}
              className="input-field"
            />
          </div>
          <button
            type="submit"
            disabled={guardandoPago}
            className="col-span-2 rounded-lg bg-blue-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
          >
            {guardandoPago ? 'Registrando...' : '+ Registrar pago'}
          </button>
        </form>
      </div>

      {pagos.length > 0 && (
        <div className="mt-4 border-t border-[color:var(--color-border)] pt-4">
          <h3 className="text-sm font-semibold text-[color:var(--color-text-primary)]">Historial de pagos</h3>
          <div className="mt-2 divide-y divide-[color:var(--color-border)]">
            {pagos.map((pago) => (
              <div key={pago.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-[color:var(--color-text-primary)]">
                    {formatMoney(Number(pago.monto))}
                  </p>
                  <p className="text-sm text-[color:var(--color-text-secondary)]">
                    {formatFecha(pago.fecha)} · {pago.personal_empresa?.nombre}
                  </p>
                  {pago.observaciones && (
                    <p className="text-xs text-[color:var(--color-text-muted)]">{pago.observaciones}</p>
                  )}
                </div>
                <button
                  onClick={() => handleEliminarPago(pago.id, Number(pago.monto))}
                  className="text-sm text-red-alert hover:underline"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </CollapsibleCard>
  )
}
