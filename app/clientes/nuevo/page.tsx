'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ClienteForm from '@/components/forms/ClienteForm'
import type { ClienteFormData } from '@/lib/validations/clientes'

export default function NuevoClientePage() {
  const router = useRouter()
  const [error, setError] = useState('')

  const handleSubmit = async (data: ClienteFormData) => {
    setError('')
    const res = await fetch('/api/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const err = await res.json()
      setError(typeof err.error === 'string' ? err.error : 'Error al crear cliente')
      return
    }

    router.push('/clientes')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-6 text-xl font-bold text-slate-800">Nuevo Cliente</h1>
        {error && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-alert">{error}</p>
        )}
        <ClienteForm onSubmit={handleSubmit} submitLabel="Crear Cliente" />
      </div>
    </div>
  )
}