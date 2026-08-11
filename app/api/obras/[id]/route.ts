import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireUser, zodErrorResponse, catchApiError, supabaseErrorResponse } from '@/lib/api/helpers'
import { obraSchema } from '@/lib/validations/obras'

const BUCKET = 'fotos-obra'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, response } = await requireUser()
    if (!user) return response

    const { id } = await params
    const body = await request.json()
    const parsed = obraSchema.safeParse(body)

    if (!parsed.success) return zodErrorResponse(parsed.error)

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('obras')
      .update(parsed.data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return supabaseErrorResponse(error)
    }

    return NextResponse.json(data)
  } catch (err) {
    return catchApiError(err)
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, response } = await requireUser()
    if (!user) return response

    const { id } = await params

    const supabase = await createClient()

    const { data: fotos, error: fotosError } = await supabase
      .from('fotos_obra')
      .select('storage_path')
      .eq('obra_id', id)

    if (fotosError) {
      return supabaseErrorResponse(fotosError)
    }

    const paths = (fotos ?? []).map((foto) => foto.storage_path)
    if (paths.length > 0) {
      const { error: removeError } = await supabase.storage.from(BUCKET).remove(paths)
      if (removeError) {
        return supabaseErrorResponse(removeError)
      }
    }

    const { error } = await supabase.from('obras').delete().eq('id', id)

    if (error) {
      return supabaseErrorResponse(error)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return catchApiError(err)
  }
}