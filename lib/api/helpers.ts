import { NextResponse } from 'next/server'
import type { ZodError } from 'zod'
import { getAuthenticatedUser } from '@/lib/supabase/server'

export async function requireUser() {
  const user = await getAuthenticatedUser()
  if (!user) {
    return { user: null, response: NextResponse.json({ error: 'No autorizado' }, { status: 401 }) }
  }
  return { user, response: null }
}

export function zodErrorResponse(error: ZodError) {
  const mensajes = Object.values(error.flatten().fieldErrors).flat().join(', ')
  return NextResponse.json({ error: mensajes || 'Datos inválidos' }, { status: 400 })
}

export function catchApiError(err: unknown) {
  return NextResponse.json(
    { error: err instanceof Error ? err.message : 'Error inesperado' },
    { status: 500 }
  )
}

export function supabaseErrorResponse(error: { message: string }, status = 500) {
  console.error(error.message)
  return NextResponse.json({ error: 'Error al procesar la solicitud' }, { status })
}
