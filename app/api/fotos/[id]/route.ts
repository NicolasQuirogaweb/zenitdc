import { NextResponse } from 'next/server'
import { createClient, getAuthenticatedUser } from '@/lib/supabase/server'

const BUCKET = 'fotos-obra'

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { id } = await params

    const supabase = await createClient()
    const { data: foto, error: fetchError } = await supabase
      .from('fotos_obra')
      .select('storage_path')
      .eq('id', id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (foto?.storage_path) {
      const { error: removeError } = await supabase.storage
        .from(BUCKET)
        .remove([foto.storage_path])

      if (removeError) {
        return NextResponse.json({ error: removeError.message }, { status: 500 })
      }
    }

    const { error } = await supabase.from('fotos_obra').delete().eq('id', id)

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