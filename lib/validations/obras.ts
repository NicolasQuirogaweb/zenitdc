import { z } from 'zod'

export const obraSchema = z.object({
  cliente_id: z.string().uuid('Seleccioná un cliente'),
  nombre: z.string().min(1, 'El nombre es requerido').max(200),
  descripcion: z.string().nullable().optional(),
  fecha_inicio: z.string().nullable().optional(),
  fecha_estimada_fin: z.string().nullable().optional(),
  estado: z.enum(['presupuestada', 'en_ejecucion', 'terminada']),
  responsable: z.string().nullable().optional(),
})

export type ObraFormData = z.infer<typeof obraSchema>