import { NextResponse } from 'next/server'
import { createClient, getAuthenticatedUser } from '@/lib/supabase/server'
import { pagoClienteSchema } from '@/lib/validations/pagos'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const parsed = pagoClienteSchema.safeParse(body)

    if (!parsed.success) {
      const mensajes = Object.values(parsed.error.flatten().fieldErrors).flat().join(', ')
      return NextResponse.json({ error: mensajes || 'Datos inválidos' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('pagos_clientes')
      .insert({ ...parsed.data, obra_id: id })
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
