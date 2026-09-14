'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import LoadingScreen from '@/components/ui/LoadingScreen'
import HistorialPagosSection from '@/components/personal/HistorialPagosSection'
import type { PersonalEmpresa } from '@/types'

export default function DetallePersonalPage() {
  const { id } = useParams<{ id: string }>()
  const [personal, setPersonal] = useState<PersonalEmpresa | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('personal_empresa')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) setPersonal(data)
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return <LoadingScreen />
  }

  if (!personal) {
    return <LoadingScreen mensaje="Empleado no encontrado" />
  }

  return (
    <div className="min-h-screen bg-[color:var(--color-bg-page)] p-4">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[color:var(--color-text-primary)]">{personal.nombre}</h1>
          <Link href="/personal" className="text-sm text-blue-light hover:underline">
            Volver
          </Link>
        </div>

        <div className="mt-4 space-y-4">
          <div className="rounded-lg bg-[color:var(--color-bg-surface)] p-4 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[color:var(--color-text-secondary)]">
              Datos
            </h2>
            <div className="mt-2 space-y-1 text-sm text-[color:var(--color-text-secondary)]">
              {personal.rol && <p>Rol: {personal.rol}</p>}
              {personal.telefono && <p>Tel: {personal.telefono}</p>}
              {!personal.rol && !personal.telefono && <p>Sin datos adicionales cargados</p>}
            </div>
            <Link
              href={`/personal/${id}/editar`}
              className="mt-3 inline-block text-sm text-blue-light hover:underline"
            >
              Editar datos
            </Link>
          </div>

          <HistorialPagosSection personalId={id} />
        </div>
      </div>
    </div>
  )
}
