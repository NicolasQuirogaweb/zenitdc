'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ObraForm from '@/components/forms/ObraForm'
import type { ObraFormData } from '@/lib/validations/obras'

export default function NuevaObraPage() {
  const router = useRouter()
  const [error, setError] = useState('')

  const handleSubmit = async (data: ObraFormData) => {
    setError('')
    const res = await fetch('/api/obras', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const err = await res.json()
      setError(typeof err.error === 'string' ? err.error : 'Error al crear obra')
      return
    }

    router.push('/obras')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-6 text-xl font-bold text-slate-800">Nueva Obra</h1>
        {error && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-alert">{error}</p>
        )}
        <ObraForm onSubmit={handleSubmit} submitLabel="Crear Obra" />
      </div>
    </div>
  )
}