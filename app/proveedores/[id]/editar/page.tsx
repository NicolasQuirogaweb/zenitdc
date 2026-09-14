'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import LoadingScreen from '@/components/ui/LoadingScreen'
import ProveedorForm from '@/components/forms/ProveedorForm'
import { useToast } from '@/lib/hooks/useToast'
import type { Proveedor } from '@/types'
import type { ProveedorFormData } from '@/lib/validations/proveedores'

export default function EditarProveedorPage() {
  const [error, setError] = useState('')
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [proveedor, setProveedor] = useState<Proveedor | null>(null)
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

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

  const handleSubmit = async (data: ProveedorFormData) => {
    setError('')
    const res = await fetch(`/api/proveedores/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const err = await res.json()
      setError(typeof err.error === 'string' ? err.error : 'Error al actualizar proveedor')
      return
    }

    showToast('success', 'Proveedor actualizado correctamente')
    router.push('/proveedores')
    router.refresh()
  }

  if (loading) {
    return <LoadingScreen />
  }

  if (!proveedor) {
    return <LoadingScreen mensaje="Proveedor no encontrado" />
  }

  return (
    <div className="min-h-screen bg-[color:var(--color-bg-page)] p-4">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-[color:var(--color-text-primary)]">Editar Proveedor</h1>
          <a href="/proveedores" className="text-sm text-blue-light hover:underline">
            Volver
          </a>
        </div>
        {error && (
          <p className="mb-4 rounded-lg bg-red-alert/15 p-3 text-sm text-red-alert">{error}</p>
        )}
        <ProveedorForm
          defaultValues={proveedor}
          onSubmit={handleSubmit}
          submitLabel="Guardar Cambios"
        />
      </div>
    </div>
  )
}
