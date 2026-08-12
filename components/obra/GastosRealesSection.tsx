'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatMoney, formatFecha } from '@/lib/utils/formato'
import SelectConOpciones from '@/components/ui/SelectConOpciones'
import CollapsibleCard from '@/components/ui/CollapsibleCard'
import { useToast } from '@/lib/hooks/useToast'
import { useConfirm } from '@/lib/hooks/useConfirm'
import type { GastoGeneral } from '@/types'

interface Props {
  obraId: string
  titulo: string
  subtitulo: string
  conceptosSugeridos: string[]
  filtro: (concepto: string) => boolean
  placeholder?: string
  onDatosCambiaron?: () => void
}

export default function GastosRealesSection({
  obraId,
  titulo,
  subtitulo,
  conceptosSugeridos,
  filtro,
  placeholder = 'Escribí el concepto',
  onDatosCambiaron,
}: Props) {
  const [gastos, setGastos] = useState<GastoGeneral[]>([])
  const [error, setError] = useState('')
  const [concepto, setConcepto] = useState('')
  const [monto, setMonto] = useState('')
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10))
  const [observaciones, setObservaciones] = useState('')
  const [agregando, setAgregando] = useState(false)
  const { showToast } = useToast()
  const confirm = useConfirm()

  const fetchGastos = () => {
    const supabase = createClient()
    supabase
      .from('gastos_generales')
      .select('*')
      .eq('obra_id', obraId)
      .order('fecha', { ascending: false })
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (data) setGastos((data as GastoGeneral[]).filter((g) => filtro(g.concepto)))
        else if (error) setError('Error al cargar los gastos')
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
    showToast('success', 'Gasto registrado')
    fetchGastos()
    onDatosCambiaron?.()
  }

  const handleEliminar = async (gastoId: string, gastoMonto: number) => {
    if (!(await confirm(`¿Eliminar el gasto de ${formatMoney(gastoMonto)}?`))) return

    const res = await fetch(`/api/gastos-generales/${gastoId}`, { method: 'DELETE' })
    if (res.ok) {
      showToast('success', 'Gasto eliminado')
      fetchGastos()
      onDatosCambiaron?.()
    }
  }

  const total = gastos.reduce((s, g) => s + Number(g.monto), 0)

  return (
    <CollapsibleCard
      titulo={titulo}
      subtitulo={subtitulo}
    >
      {error && (
        <p className="mt-3 rounded-lg bg-red-alert/15 p-3 text-sm text-red-alert">{error}</p>
      )}

      <form onSubmit={handleAgregar} className="mt-4 grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <SelectConOpciones
            label="Concepto"
            id="concepto"
            opciones={conceptosSugeridos}
            value={concepto}
            onChange={setConcepto}
            placeholder={placeholder}
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
          {agregando ? 'Registrando...' : '+ Registrar gasto'}
        </button>
      </form>

      <div className="mt-4 divide-y divide-[color:var(--color-border)]">
        {gastos.length === 0 ? (
          <p className="py-3 text-sm text-[color:var(--color-text-secondary)]">No hay gastos registrados aún</p>
        ) : (
          gastos.map((gasto) => (
            <div key={gasto.id} className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-[color:var(--color-text-primary)]">{gasto.concepto}</p>
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
        <p className="font-semibold text-[color:var(--color-text-primary)]">Total</p>
        <p className="font-semibold text-[color:var(--color-text-primary)]">{formatMoney(total)}</p>
      </div>
    </CollapsibleCard>
  )
}
