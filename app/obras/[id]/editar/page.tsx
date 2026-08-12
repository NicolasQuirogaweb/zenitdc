'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import LoadingScreen from '@/components/ui/LoadingScreen'
import ObraForm from '@/components/forms/ObraForm'
import { useToast } from '@/lib/hooks/useToast'
import type { Obra } from '@/types'
import type { ObraFormData } from '@/lib/validations/obras'

export default function EditarObraPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [obra, setObra] = useState<Obra | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { showToast } = useToast()

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

    showToast('success', 'Obra actualizada correctamente')
    router.push('/obras')
    router.refresh()
  }

  if (loading) {
    return <LoadingScreen />
  }

  if (!obra) {
    return <LoadingScreen mensaje="Obra no encontrada" />
  }

  return (
    <div className="min-h-screen bg-[color:var(--color-bg-page)] p-4">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-[color:var(--color-text-primary)]">Editar Obra</h1>
          <a href="/obras" className="text-sm text-blue-light hover:underline">
            Volver
          </a>
        </div>
        {error && (
          <p className="mb-4 rounded-lg bg-red-alert/15 p-3 text-sm text-red-alert">{error}</p>
        )}
        <ObraForm defaultValues={obra} onSubmit={handleSubmit} submitLabel="Guardar Cambios" />
      </div>
    </div>
  )
}