import { z } from 'zod'

export const presupuestoItemSchema = z.object({
  rubro: z.string().min(1, 'El rubro es requerido').max(100),
  monto: z.number().positive('El monto debe ser mayor a 0'),
})

export type PresupuestoItemFormData = z.infer<typeof presupuestoItemSchema>
