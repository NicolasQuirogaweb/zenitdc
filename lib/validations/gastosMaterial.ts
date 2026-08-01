import { z } from 'zod'

export const gastoMaterialSchema = z.object({
  material: z.string().min(1, 'El material es requerido').max(200),
  cantidad: z.string().max(50).nullable().optional(),
  monto: z.number().positive('El monto debe ser mayor a 0'),
  fecha: z.string().min(1, 'La fecha es requerida'),
  observaciones: z.string().max(500).nullable().optional(),
})

export type GastoMaterialFormData = z.infer<typeof gastoMaterialSchema>
