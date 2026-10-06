'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatMoney, formatFecha } from '@/lib/utils/formato'
import { sumMonto, parsearMonto } from '@/lib/utils/numeros'
import { coincideBusqueda } from '@/lib/utils/texto'
import FechaInput from '@/components/ui/FechaInput'
import CollapsibleCard from '@/components/ui/CollapsibleCard'
import BuscadorInput from '@/components/ui/BuscadorInput'
import { useToast } from '@/lib/hooks/useToast'
import { useConfirm } from '@/lib/hooks/useConfirm'
import type { PagoPersonal } from '@/types'

interface Props {
  personalId: string
}

interface ObraOpcion {
  id: string
  nombre: string
}

interface PagoConObra extends PagoPersonal {
  obras: { nombre: string } | null
}

export default function HistorialPagosSection({ personalId }: Props) {
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
  const [busqueda, setBusqueda] = useState('')

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
      .from('pagos_personal')
      .select('*, obras(nombre)')
      .eq('personal_id', personalId)
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
  }, [personalId])

  const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault()
    const montoNum = parsearMonto(monto)
    if (montoNum === null || !fecha || !motivo.trim()) {
      setError('Completá un monto válido, la fecha y el motivo')
      return
    }

    setError('')
    setGuardando(true)
    const res = await fetch(`/api/personal/${personalId}/pagos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        obra_id: obraId || null,
        monto: montoNum,
        fecha,
        motivo: motivo.trim(),
      }),
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

    const res = await fetch(`/api/personal-pagos/${pagoId}`, { method: 'DELETE' })
    if (res.ok) {
      showToast('success', 'Pago eliminado')
      fetchTodo()
    }
  }

  const totalPagado = sumMonto(pagos)
  const pagosFiltrados = pagos.filter((p) => coincideBusqueda(busqueda, p.motivo, p.obras?.nombre))

  return (
    <CollapsibleCard
      titulo="Historial de pagos"
      subtitulo="Pagos registrados a este empleado, con o sin obra asociada"
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
              Obra (opcional)
            </label>
            <select
              id="obraId"
              value={obraId}
              onChange={(e) => setObraId(e.target.value)}
              className="input-field"
            >
              <option value="">Sin obra asociada (sueldo fijo, gasto general, etc.)</option>
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
              placeholder="Ej: Sueldo septiembre, viáticos"
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
        {!cargando && pagos.length > 0 && (
          <BuscadorInput
            value={busqueda}
            onChange={setBusqueda}
            placeholder="Buscar por motivo u obra..."
          />
        )}
        <div className="mt-2 divide-y divide-[color:var(--color-border)]">
          {cargando ? (
            <p className="py-3 text-sm text-[color:var(--color-text-secondary)]">Cargando...</p>
          ) : pagos.length === 0 ? (
            <p className="py-3 text-sm text-[color:var(--color-text-secondary)]">No hay pagos registrados aún</p>
          ) : pagosFiltrados.length === 0 ? (
            <p className="py-3 text-sm text-[color:var(--color-text-secondary)]">
              No se encontraron pagos para &quot;{busqueda}&quot;
            </p>
          ) : (
            pagosFiltrados.map((pago) => (
              <div key={pago.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-[color:var(--color-text-primary)]">
                    {formatMoney(Number(pago.monto))}
                  </p>
                  <p className="text-sm text-[color:var(--color-text-secondary)]">
                    {formatFecha(pago.fecha)}
                    {pago.obras?.nombre && ` · ${pago.obras.nombre}`}
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
