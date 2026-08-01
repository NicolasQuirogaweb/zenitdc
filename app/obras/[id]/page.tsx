'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Obra, PresupuestoItem } from '@/types'

const formatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 2,
})

interface ObraConCliente extends Obra {
  clientes: { nombre: string } | null
}

export default function DetalleObraPage() {
  const { id } = useParams<{ id: string }>()
  const [obra, setObra] = useState<ObraConCliente | null>(null)
  const [items, setItems] = useState<PresupuestoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rubro, setRubro] = useState('')
  const [monto, setMonto] = useState('')
  const [agregando, setAgregando] = useState(false)

  const fetchData = () => {
    const supabase = createClient()
    supabase
      .from('obras')
      .select('*, clientes(nombre)')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) setObra(data as unknown as ObraConCliente)
      })
    supabase
      .from('presupuesto_items')
      .select('*')
      .eq('obra_id', id)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) setItems(data)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault()
    const montoNum = Number(monto)
    if (!rubro.trim() || !montoNum || montoNum <= 0) {
      setError('Completá el rubro y un monto mayor a 0')
      return
    }

    setError('')
    setAgregando(true)
    const res = await fetch(`/api/obras/${id}/presupuesto`, {
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
    fetchData()
  }

  const handleEliminar = async (itemId: string, itemRubro: string) => {
    if (!confirm(`¿Eliminar el rubro "${itemRubro}"?`)) return

    const res = await fetch(`/api/presupuesto/${itemId}`, { method: 'DELETE' })
    if (res.ok) fetchData()
  }

  const total = items.reduce((s, i) => s + Number(i.monto), 0)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-slate-500">Cargando...</p>
      </div>
    )
  }

  if (!obra) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-slate-500">Obra no encontrada</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">{obra.nombre}</h1>
          <a href="/obras" className="text-sm text-blue-accent hover:underline">
            Volver
          </a>
        </div>

        {obra.clientes && <p className="mt-1 text-sm text-slate-500">{obra.clientes.nombre}</p>}

        <span
          className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
            obra.estado === 'terminada' ? 'bg-green-100 text-green-alert' :
            obra.estado === 'en_ejecucion' ? 'bg-blue-100 text-blue-accent' :
            'bg-yellow-100 text-yellow-700'
          }`}
        >
          {obra.estado === 'presupuestada' ? 'Presupuestada' :
           obra.estado === 'en_ejecucion' ? 'En ejecución' : 'Terminada'}
        </span>

        {obra.descripcion && <p className="mt-3 text-sm text-slate-600">{obra.descripcion}</p>}

        <div className="mt-6 rounded-lg bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Presupuesto</h2>

          {error && (
            <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-alert">{error}</p>
          )}

          <form onSubmit={handleAgregar} className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="rubro" className="block text-sm font-medium text-slate-700">
                Rubro
              </label>
              <input
                id="rubro"
                value={rubro}
                onChange={(e) => setRubro(e.target.value)}
                placeholder="Ej: Materiales"
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-blue-accent focus:ring-1 focus:ring-blue-accent"
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
                    <p className="text-sm text-slate-500">{formatter.format(Number(item.monto))}</p>
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
            <p className="font-semibold text-slate-800">{formatter.format(total)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
