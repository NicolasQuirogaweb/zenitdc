import { z } from 'zod'
import { montoPositivo, fechaISO, observacionesOpcionales } from './comun'

export const pagoClienteSchema = z.object({
  monto: montoPositivo,
  fecha: fechaISO,
  numero_etapa: z.number().int().positive().nullable().optional(),
  metodo_pago: z.string().max(50).nullable().optional(),
  observaciones: observacionesOpcionales,
})

export type PagoClienteFormData = z.infer<typeof pagoClienteSchema>
