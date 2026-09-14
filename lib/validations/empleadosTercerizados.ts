import { z } from 'zod'

export const empleadoTercerizadoSchema = z.object({
  proveedor_id: z.string().uuid('Seleccioná un proveedor'),
  nombre: z.string().min(1, 'El nombre es requerido').max(200),
  oficio: z.string().max(100).nullable().optional(),
  dni: z.string().max(20).nullable().optional(),
  telefono: z.string().max(50).nullable().optional(),
})

export type EmpleadoTercerizadoFormData = z.infer<typeof empleadoTercerizadoSchema>
