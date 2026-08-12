'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { formatFecha } from '@/lib/utils/formato'
import LoadingScreen from '@/components/ui/LoadingScreen'
import { useToast } from '@/lib/hooks/useToast'
import { useConfirm } from '@/lib/hooks/useConfirm'
import type { FotoObra } from '@/types'

interface FotoConUrl extends FotoObra {
  url: string | null
}

export default function FotosPage() {
  const { id } = useParams<{ id: string }>()
  const [fotos, setFotos] = useState<FotoConUrl[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [archivo, setArchivo] = useState<File | null>(null)
  const [descripcion, setDescripcion] = useState('')
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10))
  const [subiendo, setSubiendo] = useState(false)
  const [fotoAmpliada, setFotoAmpliada] = useState<FotoConUrl | null>(null)
  const { showToast } = useToast()
  const confirm = useConfirm()

  const fetchFotos = () => {
    return fetch(`/api/obras/${id}/fotos`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setFotos(data)
        setLoading(false)
      })
      .catch(() => {
        setError('Error al cargar las fotos')
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchFotos()
  }, [])

  const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!archivo || !fecha) {
      setError('Seleccioná una imagen y una fecha')
      return
    }

    setError('')
    setSubiendo(true)
    const formData = new FormData()
    formData.append('file', archivo)
    formData.append('fecha', fecha)
    if (descripcion.trim()) formData.append('descripcion', descripcion.trim())

    const res = await fetch(`/api/obras/${id}/fotos`, { method: 'POST', body: formData })
    setSubiendo(false)

    if (!res.ok) {
      const err = await res.json()
      setError(typeof err.error === 'string' ? err.error : 'Error al subir la imagen')
      return
    }

    setArchivo(null)
    setDescripcion('')
    setFecha(new Date().toISOString().slice(0, 10))
    const input = document.getElementById('archivo') as HTMLInputElement | null
    if (input) input.value = ''
    showToast('success', 'Foto subida')
    fetchFotos()
  }

  const handleEliminar = async (fotoId: string) => {
    if (!(await confirm('¿Eliminar esta foto?'))) return

    const res = await fetch(`/api/fotos/${fotoId}`, { method: 'DELETE' })
    if (res.ok) {
      showToast('success', 'Foto eliminada')
      fetchFotos()
    }
  }

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-[color:var(--color-bg-page)] p-4">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[color:var(--color-text-primary)]">Fotos de la obra</h1>
          <a href={`/obras/${id}`} className="text-sm text-blue-light hover:underline">
            Volver
          </a>
        </div>

        <div className="mt-6 rounded-lg bg-[color:var(--color-bg-surface)] p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-[color:var(--color-text-primary)]">Subir foto</h2>

          {error && (
            <p className="mt-3 rounded-lg bg-red-alert/15 p-3 text-sm text-red-alert">{error}</p>
          )}

          <form onSubmit={handleAgregar} className="mt-4 grid grid-cols-1 gap-3">
            <div>
              <label htmlFor="archivo" className="block text-sm font-medium text-[color:var(--color-text-secondary)]">
                Imagen
              </label>
              <input
                id="archivo"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                capture="environment"
                onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
                className="mt-1 block w-full text-sm text-[color:var(--color-text-secondary)]"
              />
            </div>
            <div>
              <label htmlFor="fecha" className="block text-sm font-medium text-[color:var(--color-text-secondary)]">
                Fecha
              </label>
              <input
                id="fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label htmlFor="descripcion" className="block text-sm font-medium text-[color:var(--color-text-secondary)]">
                Descripción (opcional)
              </label>
              <input
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Ej: Avance de obra"
                className="input-field"
              />
            </div>
            <button
              type="submit"
              disabled={subiendo}
              className="rounded-lg bg-blue-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
            >
              {subiendo ? 'Subiendo...' : '+ Subir foto'}
            </button>
          </form>
        </div>

        <div className="mt-4">
          {fotos.length === 0 ? (
            <div className="rounded-lg bg-[color:var(--color-bg-surface)] p-4 text-center shadow-sm">
              <p className="text-sm text-[color:var(--color-text-secondary)]">No hay fotos aún</p>
              <button
                type="button"
                onClick={() => document.getElementById('archivo')?.focus()}
                className="mt-2 inline-block rounded-lg bg-blue-accent px-4 py-2 text-sm font-semibold text-white"
              >
                Subir primera foto
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {fotos.map((foto) => (
                <div key={foto.id} className="overflow-hidden rounded-lg bg-[color:var(--color-bg-surface)] shadow-sm">
                  {foto.url ? (
                    <button
                      type="button"
                      onClick={() => setFotoAmpliada(foto)}
                      className="block w-full"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={foto.url} alt={foto.descripcion ?? 'Foto de obra'} className="h-40 w-full object-cover" />
                    </button>
                  ) : (
                    <div className="flex h-40 w-full items-center justify-center bg-[color:var(--color-bg-page)] text-xs text-[color:var(--color-text-muted)]">
                      Sin vista previa
                    </div>
                  )}
                  <div className="p-2">
                    <p className="text-xs text-[color:var(--color-text-secondary)]">{formatFecha(foto.fecha)}</p>
                    {foto.descripcion && (
                      <p className="mt-0.5 text-sm text-[color:var(--color-text-secondary)]">{foto.descripcion}</p>
                    )}
                    <button
                      onClick={() => handleEliminar(foto.id)}
                      className="mt-1 text-sm text-red-alert hover:underline"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {fotoAmpliada?.url && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-black/80 p-4"
          onClick={() => setFotoAmpliada(null)}
        >
          <button
            type="button"
            onClick={() => setFotoAmpliada(null)}
            className="absolute top-4 right-4 text-sm text-white underline"
          >
            Cerrar
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fotoAmpliada.url}
            alt={fotoAmpliada.descripcion ?? 'Foto de obra'}
            className="max-h-[85vh] max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {fotoAmpliada.descripcion && (
            <p className="text-sm text-[color:var(--color-text-secondary)]">{fotoAmpliada.descripcion}</p>
          )}
        </div>
      )}
    </div>
  )
}