import { z } from 'zod'

export const pagoClienteSchema = z.object({
  monto: z.number().positive('El monto debe ser mayor a 0'),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
  numero_etapa: z.number().int().positive().nullable().optional(),
  metodo_pago: z.string().max(50).nullable().optional(),
  observaciones: z.string().max(500).nullable().optional(),
})

export type PagoClienteFormData = z.infer<typeof pagoClienteSchema>
