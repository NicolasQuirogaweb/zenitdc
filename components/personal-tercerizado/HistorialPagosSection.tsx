'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatMoney, formatFecha } from '@/lib/utils/formato'
import { sumMonto, parsearMonto } from '@/lib/utils/numeros'
import FechaInput from '@/components/ui/FechaInput'
import CollapsibleCard from '@/components/ui/CollapsibleCard'
import { useToast } from '@/lib/hooks/useToast'
import { useConfirm } from '@/lib/hooks/useConfirm'
import type { PagoPersonalTercerizado } from '@/types'

interface Props {
  personalTercerizadoId: string
}

interface ObraOpcion {
  id: string
  nombre: string
}

interface PagoConObra extends PagoPersonalTercerizado {
  obras: { nombre: string } | null
}

export default function HistorialPagosSection({ personalTercerizadoId }: Props) {
  const [pagos, setPagos] = useState<PagoConObra[]>([])
  const [obras, setObras] = useState<ObraOpcion[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const { showToast } = useToast()
  const confirm = useConfirm()

  const [obraId, setObraId] = useState('')
  const [monto, setMonto] = useState('')
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10))
  const [motivo, setMotivo] = useState('')
  const [guardando, setGuardando] = useState(false)

  const fetchTodo = () => {
    const supabase = createClient()
    supabase
      .from('obras')
      .select('id, nombre')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setObras(data)
      })
    supabase
      .from('pagos_personal_tercerizado')
      .select('*, obras(nombre)')
      .eq('personal_tercerizado_id', personalTercerizadoId)
      .order('fecha', { ascending: false })
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (data) setPagos(data as unknown as PagoConObra[])
        else if (error) setError('Error al cargar los pagos')
        setCargando(false)
      })
  }

  useEffect(() => {
    fetchTodo()
  }, [personalTercerizadoId])

  const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault()
    const montoNum = parsearMonto(monto)
    if (!obraId || montoNum === null || !fecha || !motivo.trim()) {
      setError('Completá la obra, un monto válido, la fecha y el motivo')
      return
    }

    setError('')
    setGuardando(true)
    const res = await fetch(`/api/personal-tercerizado/${personalTercerizadoId}/pagos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ obra_id: obraId, monto: montoNum, fecha, motivo: motivo.trim() }),
    })

    setGuardando(false)
    if (!res.ok) {
      const err = await res.json()
      setError(typeof err.error === 'string' ? err.error : 'Error al registrar el pago')
      return
    }

    setObraId('')
    setMonto('')
    setFecha(new Date().toISOString().slice(0, 10))
    setMotivo('')
    showToast('success', 'Pago registrado')
    fetchTodo()
  }

  const handleEliminar = async (pagoId: string, pagoMonto: number) => {
    if (!(await confirm(`¿Eliminar el pago de ${formatMoney(pagoMonto)}?`))) return

    const res = await fetch(`/api/personal-tercerizado-pagos/${pagoId}`, { method: 'DELETE' })
    if (res.ok) {
      showToast('success', 'Pago eliminado')
      fetchTodo()
    }
  }

  const totalPagado = sumMonto(pagos)

  return (
    <CollapsibleCard
      titulo="Historial de pagos"
      subtitulo="Pagos registrados, obra por obra"
    >
      {error && (
        <p className="mt-3 rounded-lg bg-red-alert/15 p-3 text-sm text-red-alert">{error}</p>
      )}

      {!cargando && (
        <div className="mt-3">
          <p className="text-xs text-[color:var(--color-text-muted)]">Total pagado</p>
          <p className="font-semibold text-[color:var(--color-text-primary)]">{formatMoney(totalPagado)}</p>
        </div>
      )}

      <div className="mt-4 border-t border-[color:var(--color-border)] pt-4">
        <h3 className="text-sm font-semibold text-[color:var(--color-text-primary)]">Registrar pago</h3>
        <form onSubmit={handleAgregar} className="mt-2 grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label htmlFor="obraId" className="block text-sm font-medium text-[color:var(--color-text-secondary)]">
              Obra
            </label>
            <select
              id="obraId"
              value={obraId}
              onChange={(e) => setObraId(e.target.value)}
              className="input-field"
            >
              <option value="">Seleccionar obra...</option>
              {obras.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nombre}
                </option>
              ))}
            </select>
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
            <label htmlFor="motivo" className="block text-sm font-medium text-[color:var(--color-text-secondary)]">
              Motivo del pago
            </label>
            <input
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej: Pago cuadrilla semana del 10/9"
              className="input-field"
            />
          </div>
          <button
            type="submit"
            disabled={guardando}
            className="col-span-2 rounded-lg bg-blue-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
          >
            {guardando ? 'Registrando...' : '+ Registrar pago'}
          </button>
        </form>
      </div>

      <div className="mt-4 border-t border-[color:var(--color-border)] pt-4">
        <h3 className="text-sm font-semibold text-[color:var(--color-text-primary)]">Pagos registrados</h3>
        <div className="mt-2 divide-y divide-[color:var(--color-border)]">
          {cargando ? (
            <p className="py-3 text-sm text-[color:var(--color-text-secondary)]">Cargando...</p>
          ) : pagos.length === 0 ? (
            <p className="py-3 text-sm text-[color:var(--color-text-secondary)]">No hay pagos registrados aún</p>
          ) : (
            pagos.map((pago) => (
              <div key={pago.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-[color:var(--color-text-primary)]">
                    {formatMoney(Number(pago.monto))}
                  </p>
                  <p className="text-sm text-[color:var(--color-text-secondary)]">
                    {formatFecha(pago.fecha)} · {pago.obras?.nombre ?? 'Obra'}
                  </p>
                  <p className="text-xs text-[color:var(--color-text-muted)]">{pago.motivo}</p>
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
    </CollapsibleCard>
  )
}
