import { NextResponse } from 'next/server'
import { createClient, getAuthenticatedUser } from '@/lib/supabase/server'

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { id } = await params

    const supabase = await createClient()
    const { error } = await supabase.from('gastos_generales').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error inesperado' },
      { status: 500 }
    )
  }
}
