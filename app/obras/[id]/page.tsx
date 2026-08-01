'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Obra, PresupuestoItem, PagoCliente, PagoProveedor } from '@/types'

const formatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 2,
})

const formatFecha = (fecha: string) => {
  const [anio, mes, dia] = fecha.split('-')
  return `${dia}/${mes}/${anio}`
}

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
  const [pagos, setPagos] = useState<PagoCliente[]>([])
  const [errorPago, setErrorPago] = useState('')
  const [montoPago, setMontoPago] = useState('')
  const [fechaPago, setFechaPago] = useState(() => new Date().toISOString().slice(0, 10))
  const [metodoPago, setMetodoPago] = useState('')
  const [observacionesPago, setObservacionesPago] = useState('')
  const [agregandoPago, setAgregandoPago] = useState(false)
  const [pagosProveedor, setPagosProveedor] = useState<PagoProveedor[]>([])
  const [errorProv, setErrorProv] = useState('')
  const [proveedor, setProveedor] = useState('')
  const [concepto, setConcepto] = useState('')
  const [montoProv, setMontoProv] = useState('')
  const [fechaProv, setFechaProv] = useState(() => new Date().toISOString().slice(0, 10))
  const [observacionesProv, setObservacionesProv] = useState('')
  const [agregandoProv, setAgregandoProv] = useState(false)

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
    supabase
      .from('pagos_clientes')
      .select('*')
      .eq('obra_id', id)
      .order('fecha', { ascending: false })
      .then(({ data }) => {
        if (data) setPagos(data)
      })
    supabase
      .from('pagos_proveedores')
      .select('*')
      .eq('obra_id', id)
      .order('fecha', { ascending: false })
      .then(({ data }) => {
        if (data) setPagosProveedor(data)
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

  const handleAgregarPago = async (e: React.FormEvent) => {
    e.preventDefault()
    const montoNum = Number(montoPago)
    if (!montoNum || montoNum <= 0 || !fechaPago) {
      setErrorPago('Completá el monto (mayor a 0) y la fecha')
      return
    }

    setErrorPago('')
    setAgregandoPago(true)
    const res = await fetch(`/api/obras/${id}/pagos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        monto: montoNum,
        fecha: fechaPago,
        metodo_pago: metodoPago.trim() || null,
        observaciones: observacionesPago.trim() || null,
      }),
    })

    setAgregandoPago(false)
    if (!res.ok) {
      const err = await res.json()
      setErrorPago(typeof err.error === 'string' ? err.error : 'Error al registrar pago')
      return
    }

    setMontoPago('')
    setFechaPago(new Date().toISOString().slice(0, 10))
    setMetodoPago('')
    setObservacionesPago('')
    fetchData()
  }

  const handleEliminarPago = async (pagoId: string, pagoMonto: number) => {
    if (!confirm(`¿Eliminar el pago de ${formatter.format(pagoMonto)}?`)) return

    const res = await fetch(`/api/pagos/${pagoId}`, { method: 'DELETE' })
    if (res.ok) fetchData()
  }

  const handleAgregarProv = async (e: React.FormEvent) => {
    e.preventDefault()
    const montoNum = Number(montoProv)
    if (!proveedor.trim() || !montoNum || montoNum <= 0 || !fechaProv) {
      setErrorProv('Completá proveedor, monto (mayor a 0) y fecha')
      return
    }

    setErrorProv('')
    setAgregandoProv(true)
    const res = await fetch(`/api/obras/${id}/pagos-proveedores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        proveedor: proveedor.trim(),
        concepto: concepto.trim() || null,
        monto: montoNum,
        fecha: fechaProv,
        observaciones: observacionesProv.trim() || null,
      }),
    })

    setAgregandoProv(false)
    if (!res.ok) {
      const err = await res.json()
      setErrorProv(typeof err.error === 'string' ? err.error : 'Error al registrar pago a proveedor')
      return
    }

    setProveedor('')
    setConcepto('')
    setMontoProv('')
    setFechaProv(new Date().toISOString().slice(0, 10))
    setObservacionesProv('')
    fetchData()
  }

  const handleEliminarProv = async (pagoId: string, pagoMonto: number) => {
    if (!confirm(`¿Eliminar el pago a proveedor de ${formatter.format(pagoMonto)}?`)) return

    const res = await fetch(`/api/pagos-proveedores/${pagoId}`, { method: 'DELETE' })
    if (res.ok) fetchData()
  }

  const total = items.reduce((s, i) => s + Number(i.monto), 0)
  const totalPagos = pagos.reduce((s, p) => s + Number(p.monto), 0)
  const totalProv = pagosProveedor.reduce((s, p) => s + Number(p.monto), 0)

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

        <div className="mt-4 rounded-lg bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Pagos de clientes</h2>

          {errorPago && (
            <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-alert">{errorPago}</p>
          )}

          <form onSubmit={handleAgregarPago} className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="montoPago" className="block text-sm font-medium text-slate-700">
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
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-blue-accent focus:ring-1 focus:ring-blue-accent"
              />
            </div>
            <div>
              <label htmlFor="fechaPago" className="block text-sm font-medium text-slate-700">
                Fecha
              </label>
              <input
                id="fechaPago"
                type="date"
                value={fechaPago}
                onChange={(e) => setFechaPago(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-blue-accent focus:ring-1 focus:ring-blue-accent"
              />
            </div>
            <div>
              <label htmlFor="metodoPago" className="block text-sm font-medium text-slate-700">
                Método de pago
              </label>
              <input
                id="metodoPago"
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                placeholder="Ej: Transferencia"
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-blue-accent focus:ring-1 focus:ring-blue-accent"
              />
            </div>
            <div>
              <label htmlFor="observacionesPago" className="block text-sm font-medium text-slate-700">
                Observaciones
              </label>
              <input
                id="observacionesPago"
                value={observacionesPago}
                onChange={(e) => setObservacionesPago(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-blue-accent focus:ring-1 focus:ring-blue-accent"
              />
            </div>
            <button
              type="submit"
              disabled={agregandoPago}
              className="col-span-2 rounded-lg bg-blue-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {agregandoPago ? 'Registrando...' : '+ Registrar pago'}
            </button>
          </form>

          <div className="mt-4 divide-y divide-slate-100">
            {pagos.length === 0 ? (
              <p className="py-3 text-sm text-slate-500">No hay pagos registrados aún</p>
            ) : (
              pagos.map((pago) => (
                <div key={pago.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-slate-800">
                      {formatter.format(Number(pago.monto))}
                    </p>
                    <p className="text-sm text-slate-500">
                      {formatFecha(pago.fecha)}
                      {pago.metodo_pago && ` · ${pago.metodo_pago}`}
                    </p>
                    {pago.observaciones && (
                      <p className="text-xs text-slate-400">{pago.observaciones}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleEliminarPago(pago.id, Number(pago.monto))}
                    className="text-sm text-red-alert hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
            <p className="font-semibold text-slate-800">Total pagado</p>
            <p className="font-semibold text-slate-800">{formatter.format(totalPagos)}</p>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Pagos a proveedores</h2>

          {errorProv && (
            <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-alert">{errorProv}</p>
          )}

          <form onSubmit={handleAgregarProv} className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="proveedor" className="block text-sm font-medium text-slate-700">
                Proveedor
              </label>
              <input
                id="proveedor"
                value={proveedor}
                onChange={(e) => setProveedor(e.target.value)}
                placeholder="Ej: Ferretería Central"
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-blue-accent focus:ring-1 focus:ring-blue-accent"
              />
            </div>
            <div>
              <label htmlFor="concepto" className="block text-sm font-medium text-slate-700">
                Concepto
              </label>
              <input
                id="concepto"
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                placeholder="Ej: Material eléctrico"
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-blue-accent focus:ring-1 focus:ring-blue-accent"
              />
            </div>
            <div>
              <label htmlFor="montoProv" className="block text-sm font-medium text-slate-700">
                Monto
              </label>
              <input
                id="montoProv"
                type="number"
                inputMode="decimal"
                min="0.01"
                step="0.01"
                value={montoProv}
                onChange={(e) => setMontoProv(e.target.value)}
                placeholder="0,00"
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-blue-accent focus:ring-1 focus:ring-blue-accent"
              />
            </div>
            <div>
              <label htmlFor="fechaProv" className="block text-sm font-medium text-slate-700">
                Fecha
              </label>
              <input
                id="fechaProv"
                type="date"
                value={fechaProv}
                onChange={(e) => setFechaProv(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-blue-accent focus:ring-1 focus:ring-blue-accent"
              />
            </div>
            <div className="col-span-2">
              <label htmlFor="observacionesProv" className="block text-sm font-medium text-slate-700">
                Observaciones
              </label>
              <input
                id="observacionesProv"
                value={observacionesProv}
                onChange={(e) => setObservacionesProv(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-blue-accent focus:ring-1 focus:ring-blue-accent"
              />
            </div>
            <button
              type="submit"
              disabled={agregandoProv}
              className="col-span-2 rounded-lg bg-blue-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {agregandoProv ? 'Registrando...' : '+ Registrar pago a proveedor'}
            </button>
          </form>

          <div className="mt-4 divide-y divide-slate-100">
            {pagosProveedor.length === 0 ? (
              <p className="py-3 text-sm text-slate-500">No hay pagos a proveedores registrados aún</p>
            ) : (
              pagosProveedor.map((pago) => (
                <div key={pago.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-slate-800">
                      {pago.proveedor}
                      {pago.concepto && <span className="text-slate-500"> · {pago.concepto}</span>}
                    </p>
                    <p className="text-sm text-slate-500">
                      {formatter.format(Number(pago.monto))} · {formatFecha(pago.fecha)}
                    </p>
                    {pago.observaciones && (
                      <p className="text-xs text-slate-400">{pago.observaciones}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleEliminarProv(pago.id, Number(pago.monto))}
                    className="text-sm text-red-alert hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
            <p className="font-semibold text-slate-800">Total pagado a proveedores</p>
            <p className="font-semibold text-slate-800">{formatter.format(totalProv)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
