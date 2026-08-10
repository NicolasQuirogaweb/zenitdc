'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatMoney } from '@/lib/utils/formato'
import { RUBROS_PRESUPUESTO } from '@/lib/constantes'
import SelectConOpciones from '@/components/ui/SelectConOpciones'
import type { PresupuestoItem } from '@/types'

interface Props {
  obraId: string
  onDatosCambiaron?: () => void
}

export default function PresupuestoSection({ obraId, onDatosCambiaron }: Props) {
  const [items, setItems] = useState<PresupuestoItem[]>([])
  const [error, setError] = useState('')
  const [rubro, setRubro] = useState('')
  const [monto, setMonto] = useState('')
  const [agregando, setAgregando] = useState(false)

  const fetchItems = () => {
    const supabase = createClient()
    supabase
      .from('presupuesto_items')
      .select('*')
      .eq('obra_id', obraId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) setItems(data)
      })
  }

  useEffect(() => {
    fetchItems()
  }, [obraId])

  const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault()
    const montoNum = Number(monto)
    if (!rubro.trim() || !montoNum || montoNum <= 0) {
      setError('Completá el rubro y un monto mayor a 0')
      return
    }

    setError('')
    setAgregando(true)
    const res = await fetch(`/api/obras/${obraId}/presupuesto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rubro: rubro.trim(), monto: montoNum }),
    })

    setAgregando(false)
    if (!res.ok) {
      const err = await res.json()
      setError(typeof err.error === 'string' ? err.error : 'Error al agregar rubro')
      return
    }

    setRubro('')
    setMonto('')
    fetchItems()
    onDatosCambiaron?.()
  }

  const handleEliminar = async (itemId: string, itemRubro: string) => {
    if (!confirm(`¿Eliminar el rubro "${itemRubro}"?`)) return

    const res = await fetch(`/api/presupuesto/${itemId}`, { method: 'DELETE' })
    if (res.ok) {
      fetchItems()
      onDatosCambiaron?.()
    }
  }

  const total = items.reduce((s, i) => s + Number(i.monto), 0)

  return (
    <div className="rounded-lg bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800">Presupuesto aprobado</h2>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-alert">{error}</p>
      )}

      <form onSubmit={handleAgregar} className="mt-4 grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <SelectConOpciones
            label="Rubro"
            id="rubro"
            opciones={RUBROS_PRESUPUESTO}
            value={rubro}
            onChange={setRubro}
            placeholder="Escribí el rubro"
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
        <button
          type="submit"
          disabled={agregando}
          className="col-span-2 rounded-lg bg-blue-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {agregando ? 'Agregando...' : '+ Agregar rubro'}
        </button>
      </form>

      <div className="mt-4 divide-y divide-slate-100">
        {items.length === 0 ? (
          <p className="py-3 text-sm text-slate-500">No hay rubros cargados aún</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-slate-800">{item.rubro}</p>
                <p className="text-sm text-slate-500">{formatMoney(Number(item.monto))}</p>
              </div>
              <button
                onClick={() => handleEliminar(item.id, item.rubro)}
                className="text-sm text-red-alert hover:underline"
              >
                Eliminar
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
        <p className="font-semibold text-slate-800">Total presupuestado</p>
        <p className="font-semibold text-slate-800">{formatMoney(total)}</p>
      </div>
    </div>
  )
}
