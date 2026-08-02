import { z } from 'zod'

export const fotoSchema = z.object({
  descripcion: z.string().max(500).nullable().optional(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
})

export type FotoFormData = z.infer<typeof fotoSchema>

export const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
export const MAX_FOTO_BYTES = 5 * 1024 * 1024

export const EXTENSIONES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}