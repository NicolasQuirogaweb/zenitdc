import { NextResponse } from 'next/server'
import type { ZodError } from 'zod'
import { getAuthenticatedUser, createClient } from '@/lib/supabase/server'

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

/**
 * Chequea si existe alguna fila relacionada antes de borrar un registro
 * "padre" — necesario para las tablas hijas con `on delete cascade`
 * (pagos_personal, pagos_personal_tercerizado, etc.): ahí Postgres nunca
 * tira un error de foreign key al borrar, borra en cascada en silencio,
 * así que hay que chequear a mano antes.
 */
export async function hasRelatedRows(
  supabase: Awaited<ReturnType<typeof createClient>>,
  checks: { tabla: string; columna: string; valor: string }[]
): Promise<boolean> {
  const resultados = await Promise.all(
    checks.map(({ tabla, columna, valor }) =>
      supabase.from(tabla).select('id', { count: 'exact', head: true }).eq(columna, valor)
    )
  )
  return resultados.some((r) => (r.count ?? 0) > 0)
}
