import { z } from 'zod'
import { montoPositivo, fechaISO, observacionesOpcionales } from './comun'

export const gastoGeneralSchema = z.object({
  concepto: z.string().min(1, 'El concepto es requerido').max(200),
  monto: montoPositivo,
  fecha: fechaISO,
  proveedor_id: z.string().uuid().nullable().optional(),
  observaciones: observacionesOpcionales,
})

export type GastoGeneralFormData = z.infer<typeof gastoGeneralSchema>
