import { z } from 'zod'
import { montoPositivo, fechaISO, observacionesOpcionales } from './comun'

export const gastoEmpresaSchema = z.object({
  concepto: z.string().min(1, 'El concepto es requerido').max(200),
  monto: montoPositivo,
  fecha: fechaISO,
  observaciones: observacionesOpcionales,
})

export type GastoEmpresaFormData = z.infer<typeof gastoEmpresaSchema>
