import { z } from 'zod'

export const proveedorSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(200),
  telefono: z.string().max(50).nullable().optional(),
  contacto: z.string().max(200).nullable().optional(),
})

export type ProveedorFormData = z.infer<typeof proveedorSchema>
