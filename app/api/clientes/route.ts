import { NextResponse } from 'next/server'
import { createClient, getAuthenticatedUser } from '@/lib/supabase/server'
import { clienteSchema } from '@/lib/validations/clientes'

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await request.json()
    const parsed = clienteSchema.safeParse(body)

    if (!parsed.success) {
      const mensajes = Object.values(parsed.error.flatten().fieldErrors).flat().join(', ')
      return NextResponse.json({ error: mensajes || 'Datos inválidos' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('clientes')
      .insert(parsed.data)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error inesperado' },
      { status: 500 }
    )
  }
}