'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import LoadingScreen from '@/components/ui/LoadingScreen'
import PersonalForm from '@/components/forms/PersonalForm'
import { useToast } from '@/lib/hooks/useToast'
import type { PersonalEmpresa } from '@/types'
import type { PersonalFormData } from '@/lib/validations/personal'

export default function EditarPersonalPage() {
  const [error, setError] = useState('')
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [personal, setPersonal] = useState<PersonalEmpresa | null>(null)
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

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

  const handleSubmit = async (data: PersonalFormData) => {
    setError('')
    const res = await fetch(`/api/personal/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const err = await res.json()
      setError(typeof err.error === 'string' ? err.error : 'Error al actualizar el empleado')
      return
    }

    showToast('success', 'Empleado actualizado correctamente')
    router.push('/personal')
    router.refresh()
  }

  if (loading) {
    return <LoadingScreen />
  }

  if (!personal) {
    return <LoadingScreen mensaje="Empleado no encontrado" />
  }

  return (
    <div className="min-h-screen bg-[color:var(--color-bg-page)] p-4">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-[color:var(--color-text-primary)]">Editar Empleado</h1>
          <Link href="/personal" className="text-sm text-blue-light hover:underline">
            Volver
          </Link>
        </div>
        {error && (
          <p className="mb-4 rounded-lg bg-red-alert/15 p-3 text-sm text-red-alert">{error}</p>
        )}
        <PersonalForm
          defaultValues={personal}
          onSubmit={handleSubmit}
          submitLabel="Guardar Cambios"
        />
      </div>
    </div>
  )
}
