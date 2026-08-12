'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatMoney } from '@/lib/utils/formato'
import { RUBROS_PRESUPUESTO } from '@/lib/constantes'
import SelectConOpciones from '@/components/ui/SelectConOpciones'
import CollapsibleCard from '@/components/ui/CollapsibleCard'
import { useToast } from '@/lib/hooks/useToast'
import type { PresupuestoItem } from '@/types'

interface Props {
  obraId: string
  onDatosCambiaron?: () => void
}

export default function PresupuestoSection({ obraId, onDatosCambiaron }: Props) {
  const [items, setItems] = useState<PresupuestoItem[]>([])
  const [error, setError] = useState('')
  const { showToast } = useToast()
  const [rubro, setRubro] = useState('')
  const [monto, setMonto] = useState('')
  const [agregando, setAgregando] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editRubro, setEditRubro] = useState('')
  const [editMonto, setEditMonto] = useState('')

  const fetchItems = () => {
    const supabase = createClient()
    supabase
      .from('presupuesto_items')
      .select('*')
      .eq('obra_id', obraId)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (data) setItems(data)
        else if (error) setError('Error al cargar el presupuesto')
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

    const yaExiste = items.some(
      (item) => item.rubro.trim().toLowerCase() === rubro.trim().toLowerCase()
    )
    if (yaExiste) {
      setError(`El rubro "${rubro.trim()}" ya está cargado. Podés editarlo.`)
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
    showToast('success', 'Rubro agregado')
    fetchItems()
    onDatosCambiaron?.()
  }

  const handleEliminar = async (itemId: string, itemRubro: string) => {
    if (!confirm(`¿Eliminar el rubro "${itemRubro}"?`)) return

    const res = await fetch(`/api/presupuesto/${itemId}`, { method: 'DELETE' })
    if (res.ok) {
      showToast('success', 'Rubro eliminado')
      fetchItems()
      onDatosCambiaron?.()
    }
  }

  const iniciarEdicion = (item: PresupuestoItem) => {
    setEditandoId(item.id)
    setEditRubro(item.rubro)
    setEditMonto(String(item.monto))
    setError('')
  }

  const cancelarEdicion = () => {
    setEditandoId(null)
    setEditRubro('')
    setEditMonto('')
    setError('')
  }

  const guardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editandoId) return
    const montoNum = Number(editMonto)
    if (!editRubro.trim() || !montoNum || montoNum <= 0) {
      setError('Completá el rubro y un monto mayor a 0')
      return
    }

    const yaExiste = items.some(
      (item) =>
        item.id !== editandoId &&
        item.rubro.trim().toLowerCase() === editRubro.trim().toLowerCase()
    )
    if (yaExiste) {
      setError(`El rubro "${editRubro.trim()}" ya está cargado en otro item.`)
      return
    }

    setError('')
    const res = await fetch(`/api/presupuesto/${editandoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rubro: editRubro.trim(), monto: montoNum }),
    })

    if (!res.ok) {
      const err = await res.json()
      setError(typeof err.error === 'string' ? err.error : 'Error al guardar cambios')
      return
    }

    cancelarEdicion()
    showToast('success', 'Cambios guardados')
    fetchItems()
    onDatosCambiaron?.()
  }

  const total = items.reduce((s, i) => s + Number(i.monto), 0)

  return (
    <CollapsibleCard
      titulo="Presupuesto aprobado"
      subtitulo="Cargá el detalle del presupuesto general"
      abiertoInicial
    >
      {error && (
        <p className="mt-3 rounded-lg bg-red-alert/15 p-3 text-sm text-red-alert">{error}</p>
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
        <button
          type="submit"
          disabled={agregando}
          className="col-span-2 rounded-lg bg-blue-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
        >
          {agregando ? 'Agregando...' : '+ Agregar rubro'}
        </button>
      </form>

      <div className="mt-4 divide-y divide-[color:var(--color-border)]">
        {items.length === 0 ? (
          <p className="py-3 text-sm text-[color:var(--color-text-secondary)]">No hay rubros cargados aún</p>
        ) : (
          items.map((item) => {
            const editando = item.id === editandoId
            return (
              <div key={item.id} className="flex items-center justify-between py-2">
                {editando ? (
                  <form onSubmit={guardarEdicion} className="w-full space-y-2">
                    <div>
                      <label
                        htmlFor={`edit-rubro-${item.id}`}
                        className="block text-xs font-medium text-[color:var(--color-text-secondary)]"
                      >
                        Rubro
                      </label>
                      <input
                        id={`edit-rubro-${item.id}`}
                        value={editRubro}
                        onChange={(e) => setEditRubro(e.target.value)}
                        className="input-field py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`edit-monto-${item.id}`}
                        className="block text-xs font-medium text-[color:var(--color-text-secondary)]"
                      >
                        Monto
                      </label>
                      <input
                        id={`edit-monto-${item.id}`}
                        type="number"
                        inputMode="decimal"
                        min="0.01"
                        step="0.01"
                        value={editMonto}
                        onChange={(e) => setEditMonto(e.target.value)}
                        className="input-field py-1.5 text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-green-500"
                      >
                        Guardar
                      </button>
                      <button
                        type="button"
                        onClick={cancelarEdicion}
                        className="flex-1 rounded-lg bg-[color:var(--color-border)] px-3 py-1.5 text-sm font-semibold text-[color:var(--color-text-primary)] hover:opacity-80"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div>
                      <p className="font-medium text-[color:var(--color-text-primary)]">{item.rubro}</p>
                      <p className="text-sm text-[color:var(--color-text-secondary)]">{formatMoney(Number(item.monto))}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => iniciarEdicion(item)}
                        className="text-sm text-blue-light hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(item.id, item.rubro)}
                        className="text-sm text-red-alert hover:underline"
                      >
                        Eliminar
                      </button>
                    </div>
                  </>
                )}
              </div>
            )
          })
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[color:var(--color-border)] pt-3">
        <p className="font-semibold text-[color:var(--color-text-primary)]">Total presupuesto aprobado</p>
        <p className="font-semibold text-[color:var(--color-text-primary)]">{formatMoney(total)}</p>
      </div>
    </CollapsibleCard>
  )
}
