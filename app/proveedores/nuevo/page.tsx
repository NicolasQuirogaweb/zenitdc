'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ProveedorForm from '@/components/forms/ProveedorForm'
import { useToast } from '@/lib/hooks/useToast'
import type { ProveedorFormData } from '@/lib/validations/proveedores'

export default function NuevoProveedorPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const { showToast } = useToast()

  const handleSubmit = async (data: ProveedorFormData) => {
    setError('')
    const res = await fetch('/api/proveedores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const err = await res.json()
      setError(typeof err.error === 'string' ? err.error : 'Error al crear proveedor')
      return
    }

    showToast('success', 'Proveedor creado correctamente')
    router.push('/proveedores')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[color:var(--color-bg-page)] p-4">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[color:var(--color-text-primary)]">Nuevo Proveedor</h1>
          <a href="/proveedores" className="text-sm text-blue-light hover:underline">
            Volver
          </a>
        </div>
        {error && (
          <p className="mb-4 rounded-lg bg-red-alert/15 p-3 text-sm text-red-alert">{error}</p>
        )}
        <ProveedorForm onSubmit={handleSubmit} submitLabel="Crear Proveedor" />
      </div>
    </div>
  )
}
