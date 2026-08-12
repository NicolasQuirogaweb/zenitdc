'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ObraForm from '@/components/forms/ObraForm'
import { useToast } from '@/lib/hooks/useToast'
import type { ObraFormData } from '@/lib/validations/obras'
import type { Obra } from '@/types'

function NuevaObraContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const clienteId = searchParams.get('cliente_id') ?? ''
  const [error, setError] = useState('')
  const { showToast } = useToast()

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

    showToast('success', 'Obra creada correctamente')
    if (clienteId) {
      router.push(`/clientes/${clienteId}/obras`)
    } else {
      router.push('/obras')
    }
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">Nueva Obra</h1>
          <a
            href={clienteId ? `/clientes/${clienteId}/obras` : '/obras'}
            className="text-sm text-blue-accent hover:underline"
          >
            Volver
          </a>
        </div>
        {error && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-alert">{error}</p>
        )}
        <ObraForm
          onSubmit={handleSubmit}
          submitLabel="Crear Obra"
          defaultValues={clienteId ? ({ cliente_id: clienteId } as unknown as Obra) : undefined}
        />
      </div>
    </div>
  )
}

export default function NuevaObraPage() {
  return (
    <Suspense>
      <NuevaObraContent />
    </Suspense>
  )
}
