import { z } from 'zod'
import { montoPositivo, fechaISO, motivoPago } from './comun'

export const personalTercerizadoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(200),
  oficio: z.string().max(100).nullable().optional(),
  telefono: z.string().max(50).nullable().optional(),
})

export type PersonalTercerizadoFormData = z.infer<typeof personalTercerizadoSchema>

export const pagoPersonalTercerizadoSchema = z.object({
  personal_tercerizado_id: z.string().uuid('Seleccioná a quién le pagaste'),
  // A diferencia de personal de la empresa, acá la obra es siempre
  // obligatoria: se le paga a Marcelo/Clisman por el trabajo hecho en
  // una obra puntual, nunca un sueldo fijo sin ligar a ninguna.
  obra_id: z.string().uuid('Seleccioná una obra'),
  monto: montoPositivo,
  fecha: fechaISO,
  motivo: motivoPago,
})

export type PagoPersonalTercerizadoFormData = z.infer<typeof pagoPersonalTercerizadoSchema>
