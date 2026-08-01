import { z } from 'zod'

export const pagoClienteSchema = z.object({
  monto: z.number().positive('El monto debe ser mayor a 0'),
  fecha: z.string().min(1, 'La fecha es requerida'),
  metodo_pago: z.string().max(50).nullable().optional(),
  observaciones: z.string().max(500).nullable().optional(),
})

export type PagoClienteFormData = z.infer<typeof pagoClienteSchema>
