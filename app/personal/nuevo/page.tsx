'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PersonalForm from '@/components/forms/PersonalForm'
import { useToast } from '@/lib/hooks/useToast'
import type { PersonalFormData } from '@/lib/validations/personal'

export default function NuevoPersonalPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const { showToast } = useToast()

  const handleSubmit = async (data: PersonalFormData) => {
    setError('')
    const res = await fetch('/api/personal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const err = await res.json()
      setError(typeof err.error === 'string' ? err.error : 'Error al crear el empleado')
      return
    }

    showToast('success', 'Empleado creado correctamente')
    router.push('/personal')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[color:var(--color-bg-page)] p-4">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[color:var(--color-text-primary)]">Nuevo Empleado</h1>
          <Link href="/personal" className="text-sm text-blue-light hover:underline">
            Volver
          </Link>
        </div>
        {error && (
          <p className="mb-4 rounded-lg bg-red-alert/15 p-3 text-sm text-red-alert">{error}</p>
        )}
        <PersonalForm onSubmit={handleSubmit} submitLabel="Crear Empleado" />
      </div>
    </div>
  )
}
