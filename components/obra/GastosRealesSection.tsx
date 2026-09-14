'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatMoney, formatFecha } from '@/lib/utils/formato'
import { sumMonto, parsearMonto } from '@/lib/utils/numeros'
import SelectConOpciones from '@/components/ui/SelectConOpciones'
import FechaInput from '@/components/ui/FechaInput'
import CollapsibleCard from '@/components/ui/CollapsibleCard'
import { useToast } from '@/lib/hooks/useToast'
import { useConfirm } from '@/lib/hooks/useConfirm'
import type { GastoGeneral, Proveedor } from '@/types'

interface GastoGeneralConProveedor extends GastoGeneral {
  proveedores: { nombre: string } | null
}

interface Props {
  obraId: string
  titulo: string
  subtitulo: string
  conceptosSugeridos: string[]
  filtro: (concepto: string) => boolean
  placeholder?: string
  onDatosCambiaron?: () => void
  mostrarProveedor?: boolean
}

export default function GastosRealesSection({
  obraId,
  titulo,
  subtitulo,
  conceptosSugeridos,
  filtro,
  placeholder = 'Escribí el concepto',
  onDatosCambiaron,
  mostrarProveedor = true,
}: Props) {
  const [gastos, setGastos] = useState<GastoGeneralConProveedor[]>([])
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [error, setError] = useState('')
  const [concepto, setConcepto] = useState('')
  const [monto, setMonto] = useState('')
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10))
  const [proveedorId, setProveedorId] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [agregando, setAgregando] = useState(false)
  const { showToast } = useToast()
  const confirm = useConfirm()

  const fetchGastos = () => {
    const supabase = createClient()
    supabase
      .from('gastos_generales')
      .select('*, proveedores(nombre)')
      .eq('obra_id', obraId)
      .order('fecha', { ascending: false })
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (data) setGastos((data as unknown as GastoGeneralConProveedor[]).filter((g) => filtro(g.concepto)))
        else if (error) setError('Error al cargar los gastos')
      })
  }

  useEffect(() => {
    fetchGastos()
    if (!mostrarProveedor) return
    const supabase = createClient()
    supabase.from('proveedores').select('*').order('nombre').then(({ data }) => {
      if (data) setProveedores(data)
    })
  }, [obraId])

  const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault()
    const montoNum = parsearMonto(monto)
    if (!concepto.trim() || montoNum === null || !fecha) {
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
        proveedor_id: proveedorId || null,
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
    setProveedorId('')
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

  const total = sumMonto(gastos)

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
          <FechaInput id="fecha" value={fecha} onChange={setFecha} />
        </div>
        {mostrarProveedor && (
          <div className="col-span-2">
            <label htmlFor="proveedorId" className="block text-sm font-medium text-[color:var(--color-text-secondary)]">
              Proveedor (opcional)
            </label>
            <select
              id="proveedorId"
              value={proveedorId}
              onChange={(e) => setProveedorId(e.target.value)}
              className="input-field"
            >
              <option value="">Sin proveedor</option>
              {proveedores.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>
        )}
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
                  {mostrarProveedor && gasto.proveedores?.nombre && ` · ${gasto.proveedores.nombre}`}
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
