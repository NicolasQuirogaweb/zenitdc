'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import CollapsibleCard from '@/components/ui/CollapsibleCard'
import { useToast } from '@/lib/hooks/useToast'
import { useConfirm } from '@/lib/hooks/useConfirm'
import type { EmpleadoTercerizado } from '@/types'

interface Props {
  proveedorId: string
}

export default function EmpleadosSection({ proveedorId }: Props) {
  const [empleados, setEmpleados] = useState<EmpleadoTercerizado[]>([])
  const [error, setError] = useState('')
  const { showToast } = useToast()
  const confirm = useConfirm()
  const [nombre, setNombre] = useState('')
  const [oficio, setOficio] = useState('')
  const [dni, setDni] = useState('')
  const [telefono, setTelefono] = useState('')
  const [agregando, setAgregando] = useState(false)

  const fetchEmpleados = () => {
    const supabase = createClient()
    supabase
      .from('empleados_tercerizados')
      .select('*')
      .eq('proveedor_id', proveedorId)
      .order('nombre', { ascending: true })
      .then(({ data, error }) => {
        if (data) setEmpleados(data)
        else if (error) setError('Error al cargar los empleados')
      })
  }

  useEffect(() => {
    fetchEmpleados()
  }, [proveedorId])

  const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) {
      setError('Completá el nombre')
      return
    }

    setError('')
    setAgregando(true)
    const res = await fetch(`/api/proveedores/${proveedorId}/empleados`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: nombre.trim(),
        oficio: oficio.trim() || null,
        dni: dni.trim() || null,
        telefono: telefono.trim() || null,
      }),
    })

    setAgregando(false)
    if (!res.ok) {
      const err = await res.json()
      setError(typeof err.error === 'string' ? err.error : 'Error al agregar empleado')
      return
    }

    setNombre('')
    setOficio('')
    setDni('')
    setTelefono('')
    showToast('success', 'Empleado agregado')
    fetchEmpleados()
  }

  const handleEliminar = async (empleadoId: string, empleadoNombre: string) => {
    if (!(await confirm(`¿Eliminar a ${empleadoNombre}?`))) return

    const res = await fetch(`/api/empleados-tercerizados/${empleadoId}`, { method: 'DELETE' })
    if (res.ok) {
      showToast('success', 'Empleado eliminado')
      fetchEmpleados()
    }
  }

  return (
    <CollapsibleCard
      titulo="Empleados"
      subtitulo="Personal de la cuadrilla de este proveedor (referencia y contacto)"
    >
      {error && (
        <p className="mt-3 rounded-lg bg-red-alert/15 p-3 text-sm text-red-alert">{error}</p>
      )}

      <form onSubmit={handleAgregar} className="mt-4 grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label htmlFor="nombre" className="block text-sm font-medium text-[color:var(--color-text-secondary)]">
            Nombre
          </label>
          <input
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label htmlFor="oficio" className="block text-sm font-medium text-[color:var(--color-text-secondary)]">
            Oficio
          </label>
          <input
            id="oficio"
            value={oficio}
            onChange={(e) => setOficio(e.target.value)}
            placeholder="Ej: Albañil"
            className="input-field"
          />
        </div>
        <div>
          <label htmlFor="dni" className="block text-sm font-medium text-[color:var(--color-text-secondary)]">
            DNI
          </label>
          <input
            id="dni"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            className="input-field"
          />
        </div>
        <div className="col-span-2">
          <label htmlFor="telefono" className="block text-sm font-medium text-[color:var(--color-text-secondary)]">
            Teléfono
          </label>
          <input
            id="telefono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="input-field"
          />
        </div>
        <button
          type="submit"
          disabled={agregando}
          className="col-span-2 rounded-lg bg-blue-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
        >
          {agregando ? 'Agregando...' : '+ Agregar empleado'}
        </button>
      </form>

      <div className="mt-4 divide-y divide-[color:var(--color-border)]">
        {empleados.length === 0 ? (
          <p className="py-3 text-sm text-[color:var(--color-text-secondary)]">No hay empleados cargados aún</p>
        ) : (
          empleados.map((empleado) => (
            <div key={empleado.id} className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-[color:var(--color-text-primary)]">{empleado.nombre}</p>
                <p className="text-sm text-[color:var(--color-text-secondary)]">
                  {[empleado.oficio, empleado.dni, empleado.telefono].filter(Boolean).join(' · ')}
                </p>
              </div>
              <button
                onClick={() => handleEliminar(empleado.id, empleado.nombre)}
                className="text-sm text-red-alert hover:underline"
              >
                Eliminar
              </button>
            </div>
          ))
        )}
      </div>
    </CollapsibleCard>
  )
}
