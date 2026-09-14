import { z } from 'zod'
import { montoPositivo, fechaISO, observacionesOpcionales } from './comun'

export const gastoMaterialSchema = z.object({
  material: z.string().min(1, 'El material es requerido').max(200),
  cantidad: z.string().max(50).nullable().optional(),
  monto: montoPositivo,
  fecha: fechaISO,
  proveedor_id: z.string().uuid().nullable().optional(),
  observaciones: observacionesOpcionales,
})

export type GastoMaterialFormData = z.infer<typeof gastoMaterialSchema>
