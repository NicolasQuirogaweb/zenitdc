import { z } from 'zod'

export const personalSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(200),
  rol: z.string().max(100).nullable().optional(),
  telefono: z.string().max(50).nullable().optional(),
})

export type PersonalFormData = z.infer<typeof personalSchema>

export const pagoPersonalSchema = z.object({
  personal_id: z.string().uuid('Seleccioná un empleado'),
  monto: z.number().positive('El monto debe ser mayor a 0'),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
  observaciones: z.string().max(500).nullable().optional(),
})

export type PagoPersonalFormData = z.infer<typeof pagoPersonalSchema>
