import { z } from 'zod'
import { montoPositivo, fechaISO, observacionesOpcionales } from './comun'

export const presupuestoManoObraSchema = z.object({
  proveedor_id: z.string().uuid('Seleccioná un proveedor'),
  monto: z.number().nonnegative('El monto no puede ser negativo'),
})

export type PresupuestoManoObraFormData = z.infer<typeof presupuestoManoObraSchema>

export const pagoManoObraSchema = z.object({
  proveedor_id: z.string().uuid('Seleccioná un proveedor'),
  monto: montoPositivo,
  fecha: fechaISO,
  observaciones: observacionesOpcionales,
})

export type PagoManoObraFormData = z.infer<typeof pagoManoObraSchema>
