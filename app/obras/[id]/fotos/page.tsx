'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { formatFecha } from '@/lib/utils/formato'
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

  const fetchFotos = () => {
    return fetch(`/api/obras/${id}/fotos`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setFotos(data)
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
    fetchFotos()
  }

  const handleEliminar = async (fotoId: string) => {
    if (!confirm('¿Eliminar esta foto?')) return

    const res = await fetch(`/api/fotos/${fotoId}`, { method: 'DELETE' })
    if (res.ok) fetchFotos()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-slate-500">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">Fotos de la obra</h1>
          <a href={`/obras/${id}`} className="text-sm text-blue-accent hover:underline">
            Volver
          </a>
        </div>

        <div className="mt-6 rounded-lg bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Subir foto</h2>

          {error && (
            <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-alert">{error}</p>
          )}

          <form onSubmit={handleAgregar} className="mt-4 grid grid-cols-1 gap-3">
            <div>
              <label htmlFor="archivo" className="block text-sm font-medium text-slate-700">
                Imagen
              </label>
              <input
                id="archivo"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                capture="environment"
                onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
                className="mt-1 block w-full text-sm text-slate-700"
              />
            </div>
            <div>
              <label htmlFor="fecha" className="block text-sm font-medium text-slate-700">
                Fecha
              </label>
              <input
                id="fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-blue-accent focus:ring-1 focus:ring-blue-accent"
              />
            </div>
            <div>
              <label htmlFor="descripcion" className="block text-sm font-medium text-slate-700">
                Descripción (opcional)
              </label>
              <input
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Ej: Avance de obra"
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-blue-accent focus:ring-1 focus:ring-blue-accent"
              />
            </div>
            <button
              type="submit"
              disabled={subiendo}
              className="rounded-lg bg-blue-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {subiendo ? 'Subiendo...' : '+ Subir foto'}
            </button>
          </form>
        </div>

        <div className="mt-4">
          {fotos.length === 0 ? (
            <p className="rounded-lg bg-white p-4 text-center text-sm text-slate-500 shadow-sm">
              No hay fotos aún. Subí la primera.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {fotos.map((foto) => (
                <div key={foto.id} className="overflow-hidden rounded-lg bg-white shadow-sm">
                  {foto.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={foto.url} alt={foto.descripcion ?? 'Foto de obra'} className="h-40 w-full object-cover" />
                  ) : (
                    <div className="flex h-40 w-full items-center justify-center bg-slate-100 text-xs text-slate-400">
                      Sin vista previa
                    </div>
                  )}
                  <div className="p-2">
                    <p className="text-xs text-slate-500">{formatFecha(foto.fecha)}</p>
                    {foto.descripcion && (
                      <p className="mt-0.5 text-sm text-slate-700">{foto.descripcion}</p>
                    )}
                    <button
                      onClick={() => handleEliminar(foto.id)}
                      className="mt-1 text-xs text-red-alert hover:underline"
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
    </div>
  )
}