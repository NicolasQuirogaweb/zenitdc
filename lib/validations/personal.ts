import { z } from 'zod'
import { montoPositivo, fechaISO, motivoPago } from './comun'

export const personalSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(200),
  rol: z.string().max(100).nullable().optional(),
  telefono: z.string().max(50).nullable().optional(),
})

export type PersonalFormData = z.infer<typeof personalSchema>

export const pagoPersonalSchema = z.object({
  personal_id: z.string().uuid('Seleccioná un empleado'),
  // Opcional: hay personal con sueldo fijo que no está ligado a ninguna
  // obra puntual (ej. redes/IT), y otro que sí cobra por obra.
  obra_id: z.string().uuid().nullable().optional(),
  monto: montoPositivo,
  fecha: fechaISO,
  motivo: motivoPago,
})

export type PagoPersonalFormData = z.infer<typeof pagoPersonalSchema>
