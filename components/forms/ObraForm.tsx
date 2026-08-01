'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { obraSchema, type ObraFormData } from '@/lib/validations/obras'
import type { Obra, Cliente } from '@/types'

interface Props {
  defaultValues?: Obra
  onSubmit: (data: ObraFormData) => Promise<void>
  submitLabel: string
}

export default function ObraForm({ defaultValues, onSubmit, submitLabel }: Props) {
  const [clientes, setClientes] = useState<Cliente[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase.from('clientes').select('id, nombre').order('nombre').then(({ data }) => {
      if (data) setClientes(data as unknown as Cliente[])
    })
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ObraFormData>({
    resolver: zodResolver(obraSchema),
    defaultValues: {
      cliente_id: defaultValues?.cliente_id ?? '',
      nombre: defaultValues?.nombre ?? '',
      descripcion: defaultValues?.descripcion ?? '',
      fecha_inicio: defaultValues?.fecha_inicio ?? '',
      fecha_estimada_fin: defaultValues?.fecha_estimada_fin ?? '',
      estado: defaultValues?.estado ?? 'presupuestada',
      responsable: defaultValues?.responsable ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="cliente_id" className="block text-sm font-medium text-slate-700">
          Cliente
        </label>
        <select
          id="cliente_id"
          {...register('cliente_id')}
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-blue-accent focus:ring-1 focus:ring-blue-accent"
        >
          <option value="">Seleccionar cliente...</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        {errors.cliente_id && (
          <p className="mt-1 text-sm text-red-alert">{errors.cliente_id.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-slate-700">
          Nombre de la obra
        </label>
        <input
          id="nombre"
          {...register('nombre')}
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-blue-accent focus:ring-1 focus:ring-blue-accent"
        />
        {errors.nombre && (
          <p className="mt-1 text-sm text-red-alert">{errors.nombre.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="descripcion" className="block text-sm font-medium text-slate-700">
          Descripción
        </label>
        <textarea
          id="descripcion"
          rows={3}
          {...register('descripcion')}
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-blue-accent focus:ring-1 focus:ring-blue-accent"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="fecha_inicio" className="block text-sm font-medium text-slate-700">
            Fecha inicio
          </label>
          <input
            id="fecha_inicio"
            type="date"
            {...register('fecha_inicio')}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-blue-accent focus:ring-1 focus:ring-blue-accent"
          />
        </div>
        <div>
          <label htmlFor="fecha_estimada_fin" className="block text-sm font-medium text-slate-700">
            Fecha estimada fin
          </label>
          <input
            id="fecha_estimada_fin"
            type="date"
            {...register('fecha_estimada_fin')}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-blue-accent focus:ring-1 focus:ring-blue-accent"
          />
        </div>
      </div>

      <div>
        <label htmlFor="responsable" className="block text-sm font-medium text-slate-700">
          Responsable
        </label>
        <input
          id="responsable"
          {...register('responsable')}
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-blue-accent focus:ring-1 focus:ring-blue-accent"
        />
      </div>

      <div>
        <label htmlFor="estado" className="block text-sm font-medium text-slate-700">
          Estado
        </label>
        <select
          id="estado"
          {...register('estado')}
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 outline-none focus:border-blue-accent focus:ring-1 focus:ring-blue-accent"
        >
          <option value="presupuestada">Presupuestada</option>
          <option value="en_ejecucion">En ejecución</option>
          <option value="terminada">Terminada</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-blue-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Guardando...' : submitLabel}
      </button>
    </form>
  )
}