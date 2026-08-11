import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireUser, zodErrorResponse, catchApiError, supabaseErrorResponse } from '@/lib/api/helpers'
import { gastoMaterialSchema } from '@/lib/validations/gastosMaterial'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, response } = await requireUser()
    if (!user) return response

    const { id } = await params
    const body = await request.json()
    const parsed = gastoMaterialSchema.safeParse(body)

    if (!parsed.success) return zodErrorResponse(parsed.error)

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('gastos_materiales')
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
    const { error } = await supabase.from('gastos_materiales').delete().eq('id', id)

    if (error) {
      return supabaseErrorResponse(error)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return catchApiError(err)
  }
}
