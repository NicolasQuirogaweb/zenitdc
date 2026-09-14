'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { SkeletonLista } from '@/components/ui/Skeleton'
import { useToast } from '@/lib/hooks/useToast'
import { useConfirm } from '@/lib/hooks/useConfirm'
import type { PersonalTercerizado } from '@/types'

export default function PersonalTercerizadoPage() {
  const [personal, setPersonal] = useState<PersonalTercerizado[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const supabase = createClient()
  const { showToast } = useToast()
  const confirm = useConfirm()

  const fetchPersonal = () => {
    supabase
      .from('personal_tercerizado')
      .select('*')
      .order('nombre', { ascending: true })
      .then(({ data, error }) => {
        if (data) setPersonal(data)
        else if (error) setError('Error al cargar el personal tercerizado')
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchPersonal()
  }, [])

  const handleDelete = async (id: string) => {
    if (!(await confirm('¿Eliminar este registro?'))) return

    const res = await fetch(`/api/personal-tercerizado/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setError('')
      showToast('success', 'Registro eliminado')
      fetchPersonal()
      return
    }
    const err = await res.json()
    setError(typeof err.error === 'string' ? err.error : 'No se pudo eliminar el registro')
  }

  return (
    <div className="min-h-screen bg-[color:var(--color-bg-page)] p-4">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[color:var(--color-text-primary)]">Personal tercerizado</h1>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-blue-light hover:underline">
              Volver
            </Link>
            <Link
              href="/personal-tercerizado/nuevo"
              className="rounded-lg bg-blue-accent px-3 py-1.5 text-sm font-semibold text-white"
            >
              + Nuevo
            </Link>
          </div>
        </div>
        <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">
          Mano de obra subcontratada (ej: cuadrilla de albañilería, herrería)
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-red-alert/15 p-3 text-sm text-red-alert">{error}</p>
        )}

        {loading ? (
          <SkeletonLista />
        ) : personal.length === 0 ? (
          <div className="mt-8 text-center">
            <p className="text-[color:var(--color-text-secondary)]">No hay personal tercerizado cargado aún</p>
            <p className="mt-2">
              <Link
                href="/personal-tercerizado/nuevo"
                className="inline-block rounded-lg bg-blue-accent px-4 py-2 text-sm font-semibold text-white"
              >
                Crear el primero
              </Link>
            </p>
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {personal.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between rounded-lg bg-[color:var(--color-bg-surface)] p-3 shadow-sm"
              >
                <div>
                  <p className="font-medium text-[color:var(--color-text-primary)]">{p.nombre}</p>
                  {p.oficio && (
                    <p className="text-sm text-[color:var(--color-text-secondary)]">{p.oficio}</p>
                  )}
                  {p.telefono && (
                    <p className="text-sm text-[color:var(--color-text-secondary)]">{p.telefono}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/personal-tercerizado/${p.id}`} className="text-sm text-blue-light hover:underline">
                    Ver
                  </Link>
                  <Link href={`/personal-tercerizado/${p.id}/editar`} className="text-sm text-blue-light hover:underline">
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-sm text-red-alert hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
