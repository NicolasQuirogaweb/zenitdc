import { z } from 'zod'
import { montoPositivo, fechaISO, observacionesOpcionales } from './comun'

export const personalSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(200),
  rol: z.string().max(100).nullable().optional(),
  telefono: z.string().max(50).nullable().optional(),
})

export type PersonalFormData = z.infer<typeof personalSchema>

export const pagoPersonalSchema = z.object({
  personal_id: z.string().uuid('Seleccioná un empleado'),
  monto: montoPositivo,
  fecha: fechaISO,
  observaciones: observacionesOpcionales,
})

export type PagoPersonalFormData = z.infer<typeof pagoPersonalSchema>
