import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireUser, catchApiError, supabaseErrorResponse } from '@/lib/api/helpers'

const BUCKET = 'fotos-obra'

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, response } = await requireUser()
    if (!user) return response

    const { id } = await params

    const supabase = await createClient()
    const { data: foto, error: fetchError } = await supabase
      .from('fotos_obra')
      .select('storage_path')
      .eq('id', id)
      .single()

    if (fetchError) {
      return supabaseErrorResponse(fetchError)
    }

    if (foto?.storage_path) {
      const { error: removeError } = await supabase.storage
        .from(BUCKET)
        .remove([foto.storage_path])

      if (removeError) {
        return supabaseErrorResponse(removeError)
      }
    }

    const { error } = await supabase.from('fotos_obra').delete().eq('id', id)

    if (error) {
      return supabaseErrorResponse(error)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return catchApiError(err)
  }
}