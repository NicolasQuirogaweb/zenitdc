import { z } from 'zod'

export const gastoGeneralSchema = z.object({
  concepto: z.string().min(1, 'El concepto es requerido').max(200),
  monto: z.number().positive('El monto debe ser mayor a 0'),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
  observaciones: z.string().max(500).nullable().optional(),
})

export type GastoGeneralFormData = z.infer<typeof gastoGeneralSchema>
