'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { proveedorSchema, type ProveedorFormData } from '@/lib/validations/proveedores'
import type { Proveedor } from '@/types'

interface Props {
  defaultValues?: Proveedor
  onSubmit: (data: ProveedorFormData) => Promise<void>
  submitLabel: string
}

export default function ProveedorForm({ defaultValues, onSubmit, submitLabel }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProveedorFormData>({
    resolver: zodResolver(proveedorSchema),
    defaultValues: {
      nombre: defaultValues?.nombre ?? '',
      telefono: defaultValues?.telefono ?? '',
      contacto: defaultValues?.contacto ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-[color:var(--color-text-secondary)]">
          Nombre
        </label>
        <input id="nombre" {...register('nombre')} className="input-field" />
        {errors.nombre && (
          <p className="mt-1 text-sm text-red-alert">{errors.nombre.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="telefono" className="block text-sm font-medium text-[color:var(--color-text-secondary)]">
          Teléfono
        </label>
        <input id="telefono" {...register('telefono')} className="input-field" />
      </div>

      <div>
        <label htmlFor="contacto" className="block text-sm font-medium text-[color:var(--color-text-secondary)]">
          Persona de contacto
        </label>
        <input id="contacto" {...register('contacto')} className="input-field" />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-blue-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
      >
        {isSubmitting ? 'Guardando...' : submitLabel}
      </button>
    </form>
  )
}
