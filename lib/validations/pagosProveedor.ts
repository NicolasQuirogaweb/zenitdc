import { z } from 'zod'

export const pagoProveedorSchema = z.object({
  proveedor: z.string().min(1, 'El proveedor es requerido').max(200),
  concepto: z.string().max(200).nullable().optional(),
  monto: z.number().positive('El monto debe ser mayor a 0'),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
  observaciones: z.string().max(500).nullable().optional(),
})

export type PagoProveedorFormData = z.infer<typeof pagoProveedorSchema>
