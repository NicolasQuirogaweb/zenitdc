'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PersonalTercerizadoForm from '@/components/forms/PersonalTercerizadoForm'
import { useToast } from '@/lib/hooks/useToast'
import type { PersonalTercerizadoFormData } from '@/lib/validations/personalTercerizado'

export default function NuevoPersonalTercerizadoPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const { showToast } = useToast()

  const handleSubmit = async (data: PersonalTercerizadoFormData) => {
    setError('')
    const res = await fetch('/api/personal-tercerizado', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const err = await res.json()
      setError(typeof err.error === 'string' ? err.error : 'Error al crear el registro')
      return
    }

    showToast('success', 'Registro creado correctamente')
    router.push('/personal-tercerizado')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[color:var(--color-bg-page)] p-4">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[color:var(--color-text-primary)]">Nuevo Personal Tercerizado</h1>
          <Link href="/personal-tercerizado" className="text-sm text-blue-light hover:underline">
            Volver
          </Link>
        </div>
        {error && (
          <p className="mb-4 rounded-lg bg-red-alert/15 p-3 text-sm text-red-alert">{error}</p>
        )}
        <PersonalTercerizadoForm onSubmit={handleSubmit} submitLabel="Crear" />
      </div>
    </div>
  )
}
