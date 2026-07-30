'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ObraForm from '@/components/forms/ObraForm'
import type { Obra } from '@/types'
import type { ObraFormData } from '@/lib/validations/obras'

export default function EditarObraPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [obra, setObra] = useState<Obra | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.from('obras').select('*').eq('id', id).single().then(({ data }) => {
      if (data) setObra(data)
      setLoading(false)
    })
  }, [id])

  const handleSubmit = async (data: ObraFormData) => {
    setError('')
    const res = await fetch(`/api/obras/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const err = await res.json()
      setError(typeof err.error === 'string' ? err.error : 'Error al actualizar obra')
      return
    }

    router.push('/obras')
    router.refresh()
  }

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
        <h1 className="mb-6 text-xl font-bold text-slate-800">Editar Obra</h1>
        {error && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-alert">{error}</p>
        )}
        <ObraForm defaultValues={obra} onSubmit={handleSubmit} submitLabel="Guardar Cambios" />
      </div>
    </div>
  )
}