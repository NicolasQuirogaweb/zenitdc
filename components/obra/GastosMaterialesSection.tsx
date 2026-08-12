'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatMoney, formatFecha } from '@/lib/utils/formato'
import { MATERIALES } from '@/lib/constantes'
import SelectConOpciones from '@/components/ui/SelectConOpciones'
import CollapsibleCard from '@/components/ui/CollapsibleCard'
import { useToast } from '@/lib/hooks/useToast'
import { useConfirm } from '@/lib/hooks/useConfirm'
import type { GastoMaterial } from '@/types'

interface Props {
  obraId: string
  onDatosCambiaron?: () => void
}

export default function GastosMaterialesSection({ obraId, onDatosCambiaron }: Props) {
  const [gastos, setGastos] = useState<GastoMaterial[]>([])
  const [error, setError] = useState('')
  const { showToast } = useToast()
  const confirm = useConfirm()
  const [material, setMaterial] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [monto, setMonto] = useState('')
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10))
  const [observaciones, setObservaciones] = useState('')
  const [agregando, setAgregando] = useState(false)

  const fetchGastos = () => {
    const supabase = createClient()
    supabase
      .from('gastos_materiales')
      .select('*')
      .eq('obra_id', obraId)
      .order('fecha', { ascending: false })
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (data) setGastos(data)
        else if (error) setError('Error al cargar los gastos de materiales')
      })
  }

  useEffect(() => {
    fetchGastos()
  }, [obraId])

  const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault()
    const montoNum = Number(monto)
    if (!material.trim() || !montoNum || montoNum <= 0 || !fecha) {
      setError('Completá el material, un monto mayor a 0 y la fecha')
      return
    }

    setError('')
    setAgregando(true)
    const res = await fetch(`/api/obras/${obraId}/gastos-materiales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        material: material.trim(),
        cantidad: cantidad.trim() || null,
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

    setMaterial('')
    setCantidad('')
    setMonto('')
    setFecha(new Date().toISOString().slice(0, 10))
    setObservaciones('')
    showToast('success', 'Gasto registrado')
    fetchGastos()
    onDatosCambiaron?.()
  }

  const handleEliminar = async (gastoId: string, gastoMonto: number) => {
    if (!(await confirm(`¿Eliminar el gasto de ${formatMoney(gastoMonto)}?`))) return

    const res = await fetch(`/api/gastos-materiales/${gastoId}`, { method: 'DELETE' })
    if (res.ok) {
      showToast('success', 'Gasto eliminado')
      fetchGastos()
      onDatosCambiaron?.()
    }
  }

  const total = gastos.reduce((s, g) => s + Number(g.monto), 0)

  return (
    <CollapsibleCard
      titulo="Gastos de materiales"
      subtitulo="Cargá los materiales comprados para la obra"
    >
      {error && (
        <p className="mt-3 rounded-lg bg-red-alert/15 p-3 text-sm text-red-alert">{error}</p>
      )}

      <form onSubmit={handleAgregar} className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <SelectConOpciones
            label="Material"
            id="material"
            opciones={MATERIALES}
            value={material}
            onChange={setMaterial}
            placeholder="Escribí el material"
          />
        </div>
        <div>
          <label htmlFor="cantidad" className="block text-sm font-medium text-[color:var(--color-text-secondary)]">
            Cantidad
          </label>
          <input
            id="cantidad"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            placeholder="Ej: 10 bolsas"
            className="input-field"
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
          <input
            id="fecha"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="input-field"
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
          {agregando ? 'Registrando...' : '+ Registrar gasto de material'}
        </button>
      </form>

      <div className="mt-4 divide-y divide-[color:var(--color-border)]">
        {gastos.length === 0 ? (
          <p className="py-3 text-sm text-[color:var(--color-text-secondary)]">No hay gastos de materiales registrados aún</p>
        ) : (
          gastos.map((gasto) => (
            <div key={gasto.id} className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-[color:var(--color-text-primary)]">
                  {gasto.material}
                  {gasto.cantidad && <span className="text-[color:var(--color-text-secondary)]"> · {gasto.cantidad}</span>}
                </p>
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
        <p className="font-semibold text-[color:var(--color-text-primary)]">Total en materiales</p>
        <p className="font-semibold text-[color:var(--color-text-primary)]">{formatMoney(total)}</p>
      </div>
    </CollapsibleCard>
  )
}
