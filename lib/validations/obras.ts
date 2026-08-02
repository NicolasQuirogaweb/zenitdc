import { z } from 'zod'

const textoOpcional = () =>
  z
    .string()
    .nullable()
    .optional()
    .transform((v) => (v === '' ? null : v))

export const obraSchema = z.object({
  cliente_id: z.string().uuid('Seleccioná un cliente'),
  nombre: z.string().min(1, 'El nombre es requerido').max(200),
  descripcion: textoOpcional(),
  fecha_inicio: textoOpcional(),
  fecha_estimada_fin: textoOpcional(),
  estado: z.enum(['presupuestada', 'en_ejecucion', 'terminada']),
  responsable: textoOpcional(),
})

export type ObraFormData = z.infer<typeof obraSchema>