'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatMoney, formatFecha } from '@/lib/utils/formato'
import FechaInput from '@/components/ui/FechaInput'
import CollapsibleCard from '@/components/ui/CollapsibleCard'
import { useToast } from '@/lib/hooks/useToast'
import { useConfirm } from '@/lib/hooks/useConfirm'
import type { Proveedor, PagoManoObra } from '@/types'

interface Props {
  obraId: string
  onDatosCambiaron?: () => void
}

interface PresupuestoFila {
  proveedor_id: string
  monto: number
}

interface PagoConProveedor extends PagoManoObra {
  proveedores: { nombre: string } | null
}

export default function ManoDeObraSection({ obraId, onDatosCambiaron }: Props) {
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [presupuestos, setPresupuestos] = useState<PresupuestoFila[]>([])
  const [pagos, setPagos] = useState<PagoConProveedor[]>([])
  const [error, setError] = useState('')
  const { showToast } = useToast()
  const confirm = useConfirm()

  const [proveedorPresupuesto, setProveedorPresupuesto] = useState('')
  const [montoPresupuesto, setMontoPresupuesto] = useState('')
  const [guardandoPresupuesto, setGuardandoPresupuesto] = useState(false)

  const [proveedorPago, setProveedorPago] = useState('')
  const [montoPago, setMontoPago] = useState('')
  const [fechaPago, setFechaPago] = useState(() => new Date().toISOString().slice(0, 10))
  const [observacionesPago, setObservacionesPago] = useState('')
  const [guardandoPago, setGuardandoPago] = useState(false)

  const fetchTodo = () => {
    const supabase = createClient()
    supabase.from('proveedores').select('*').order('nombre').then(({ data }) => {
      if (data) setProveedores(data)
    })
    supabase
      .from('presupuesto_mano_obra')
      .select('proveedor_id, monto')
      .eq('obra_id', obraId)
      .then(({ data, error }) => {
        if (data) setPresupuestos(data)
        else if (error) setError('Error al cargar el presupuesto de mano de obra')
      })
    supabase
      .from('pagos_mano_obra')
      .select('*, proveedores(nombre)')
      .eq('obra_id', obraId)
      .order('fecha', { ascending: false })
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (data) setPagos(data as unknown as PagoConProveedor[])
        else if (error) setError('Error al cargar los pagos de mano de obra')
      })
  }

  useEffect(() => {
    fetchTodo()
  }, [obraId])

  const handlePresupuestar = async (e: React.FormEvent) => {
    e.preventDefault()
    const montoNum = Number(montoPresupuesto)
    if (!proveedorPresupuesto || montoPresupuesto === '' || Number.isNaN(montoNum) || montoNum < 0) {
      setError('Seleccioná un proveedor y un monto válido')
      return
    }

    setError('')
    setGuardandoPresupuesto(true)
    const res = await fetch(`/api/obras/${obraId}/mano-de-obra/presupuesto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proveedor_id: proveedorPresupuesto, monto: montoNum }),
    })

    setGuardandoPresupuesto(false)
    if (!res.ok) {
      const err = await res.json()
      setError(typeof err.error === 'string' ? err.error : 'Error al guardar el presupuesto')
      return
    }

    setProveedorPresupuesto('')
    setMontoPresupuesto('')
    showToast('success', 'Presupuesto de mano de obra guardado')
    fetchTodo()
    onDatosCambiaron?.()
  }

  const handlePagar = async (e: React.FormEvent) => {
    e.preventDefault()
    const montoNum = Number(montoPago)
    if (!proveedorPago || !montoNum || montoNum <= 0 || !fechaPago) {
      setError('Completá proveedor, un monto mayor a 0 y la fecha')
      return
    }

    setError('')
    setGuardandoPago(true)
    const res = await fetch(`/api/obras/${obraId}/mano-de-obra/pagos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proveedor_id: proveedorPago,
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

    setProveedorPago('')
    setMontoPago('')
    setFechaPago(new Date().toISOString().slice(0, 10))
    setObservacionesPago('')
    showToast('success', 'Pago registrado')
    fetchTodo()
    onDatosCambiaron?.()
  }

  const handleEliminarPago = async (pagoId: string, monto: number) => {
    if (!(await confirm(`¿Eliminar el pago de ${formatMoney(monto)}?`))) return

    const res = await fetch(`/api/mano-de-obra-pagos/${pagoId}`, { method: 'DELETE' })
    if (res.ok) {
      showToast('success', 'Pago eliminado')
      fetchTodo()
      onDatosCambiaron?.()
    }
  }

  const proveedorIds = new Set([
    ...presupuestos.map((p) => p.proveedor_id),
    ...pagos.map((p) => p.proveedor_id),
  ])
  const cuentas = Array.from(proveedorIds).map((proveedorId) => {
    const proveedor = proveedores.find((p) => p.id === proveedorId)
    const presupuestado = Number(
      presupuestos.find((p) => p.proveedor_id === proveedorId)?.monto ?? 0
    )
    const pagado = pagos
      .filter((p) => p.proveedor_id === proveedorId)
      .reduce((s, p) => s + Number(p.monto), 0)
    return {
      proveedorId,
      nombre: proveedor?.nombre ?? 'Proveedor',
      presupuestado,
      pagado,
      saldo: presupuestado - pagado,
    }
  })

  return (
    <CollapsibleCard
      titulo="Mano de obra tercerizada"
      subtitulo="Cuenta corriente con cada proveedor de mano de obra en esta obra"
    >
      {error && (
        <p className="mt-3 rounded-lg bg-red-alert/15 p-3 text-sm text-red-alert">{error}</p>
      )}

      {cuentas.length > 0 && (
        <div className="mt-4 divide-y divide-[color:var(--color-border)]">
          {cuentas.map((c) => (
            <div key={c.proveedorId} className="py-2">
              <p className="font-medium text-[color:var(--color-text-primary)]">{c.nombre}</p>
              <div className="mt-1 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-[color:var(--color-text-muted)]">Presupuestado</p>
                  <p className="text-[color:var(--color-text-secondary)]">{formatMoney(c.presupuestado)}</p>
                </div>
                <div>
                  <p className="text-[color:var(--color-text-muted)]">Pagado</p>
                  <p className="text-[color:var(--color-text-secondary)]">{formatMoney(c.pagado)}</p>
                </div>
                <div>
                  <p className="text-[color:var(--color-text-muted)]">Saldo</p>
                  <p className={c.saldo > 0 ? 'text-red-alert' : 'text-green-600'}>{formatMoney(c.saldo)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 border-t border-[color:var(--color-border)] pt-4">
        <h3 className="text-sm font-semibold text-[color:var(--color-text-primary)]">Presupuestar mano de obra</h3>
        <form onSubmit={handlePresupuestar} className="mt-2 grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label htmlFor="proveedorPresupuesto" className="block text-sm font-medium text-[color:var(--color-text-secondary)]">
              Proveedor
            </label>
            <select
              id="proveedorPresupuesto"
              value={proveedorPresupuesto}
              onChange={(e) => setProveedorPresupuesto(e.target.value)}
              className="input-field"
            >
              <option value="">Seleccionar proveedor...</option>
              {proveedores.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label htmlFor="montoPresupuesto" className="block text-sm font-medium text-[color:var(--color-text-secondary)]">
              Monto presupuestado
            </label>
            <input
              id="montoPresupuesto"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={montoPresupuesto}
              onChange={(e) => setMontoPresupuesto(e.target.value)}
              placeholder="0,00"
              className="input-field"
            />
          </div>
          <button
            type="submit"
            disabled={guardandoPresupuesto}
            className="col-span-2 rounded-lg bg-blue-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
          >
            {guardandoPresupuesto ? 'Guardando...' : 'Guardar presupuesto'}
          </button>
        </form>
      </div>

      <div className="mt-4 border-t border-[color:var(--color-border)] pt-4">
        <h3 className="text-sm font-semibold text-[color:var(--color-text-primary)]">Registrar pago</h3>
        <form onSubmit={handlePagar} className="mt-2 grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label htmlFor="proveedorPago" className="block text-sm font-medium text-[color:var(--color-text-secondary)]">
              Proveedor
            </label>
            <select
              id="proveedorPago"
              value={proveedorPago}
              onChange={(e) => setProveedorPago(e.target.value)}
              className="input-field"
            >
              <option value="">Seleccionar proveedor...</option>
              {proveedores.map((p) => (
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
                    {formatFecha(pago.fecha)} · {pago.proveedores?.nombre}
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
