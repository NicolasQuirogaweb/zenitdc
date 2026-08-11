import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireUser, catchApiError, supabaseErrorResponse } from '@/lib/api/helpers'

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, response } = await requireUser()
    if (!user) return response

    const { id } = await params

    const supabase = await createClient()
    const { error } = await supabase.from('gastos_generales').delete().eq('id', id)

    if (error) {
      return supabaseErrorResponse(error)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return catchApiError(err)
  }
}
