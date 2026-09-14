'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import LoadingScreen from '@/components/ui/LoadingScreen'
import EmpleadosSection from '@/components/proveedor/EmpleadosSection'
import CuentaCorrienteSection from '@/components/proveedor/CuentaCorrienteSection'
import type { Proveedor } from '@/types'

export default function DetalleProveedorPage() {
  const { id } = useParams<{ id: string }>()
  const [proveedor, setProveedor] = useState<Proveedor | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('proveedores')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) setProveedor(data)
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return <LoadingScreen />
  }

  if (!proveedor) {
    return <LoadingScreen mensaje="Proveedor no encontrado" />
  }

  return (
    <div className="min-h-screen bg-[color:var(--color-bg-page)] p-4">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[color:var(--color-text-primary)]">{proveedor.nombre}</h1>
          <Link href="/proveedores" className="text-sm text-blue-light hover:underline">
            Volver
          </Link>
        </div>

        <div className="mt-4 space-y-4">
          <div className="rounded-lg bg-[color:var(--color-bg-surface)] p-4 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[color:var(--color-text-secondary)]">
              Datos
            </h2>
            <div className="mt-2 space-y-1 text-sm text-[color:var(--color-text-secondary)]">
              {proveedor.telefono && <p>Tel: {proveedor.telefono}</p>}
              {proveedor.contacto && <p>Contacto: {proveedor.contacto}</p>}
              {!proveedor.telefono && !proveedor.contacto && <p>Sin datos de contacto cargados</p>}
            </div>
            <a
              href={`/proveedores/${id}/editar`}
              className="mt-3 inline-block text-sm text-blue-light hover:underline"
            >
              Editar datos
            </a>
          </div>

          <CuentaCorrienteSection proveedorId={id} />
          <EmpleadosSection proveedorId={id} />
        </div>
      </div>
    </div>
  )
}
