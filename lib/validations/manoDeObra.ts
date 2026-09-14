import { z } from 'zod'

export const presupuestoManoObraSchema = z.object({
  proveedor_id: z.string().uuid('Seleccioná un proveedor'),
  monto: z.number().nonnegative('El monto no puede ser negativo'),
})

export type PresupuestoManoObraFormData = z.infer<typeof presupuestoManoObraSchema>

export const pagoManoObraSchema = z.object({
  proveedor_id: z.string().uuid('Seleccioná un proveedor'),
  monto: z.number().positive('El monto debe ser mayor a 0'),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
  observaciones: z.string().max(500).nullable().optional(),
})

export type PagoManoObraFormData = z.infer<typeof pagoManoObraSchema>
