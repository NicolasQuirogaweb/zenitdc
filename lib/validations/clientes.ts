import { z } from 'zod'

export const clienteSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(200),
  telefono: z.string().max(50).nullable().optional(),
  direccion: z.string().max(200).nullable().optional(),
  cuit: z.string().max(20).nullable().optional(),
  email: z
    .string()
    .email('Email inválido')
    .max(200)
    .nullable()
    .optional()
    .or(z.literal('')),
  estado: z.enum(['activo', 'inactivo']),
})

export type ClienteFormData = z.infer<typeof clienteSchema>