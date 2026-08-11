import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireUser, zodErrorResponse, catchApiError, supabaseErrorResponse } from '@/lib/api/helpers'
import { gastoGeneralSchema } from '@/lib/validations/gastosGenerales'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, response } = await requireUser()
    if (!user) return response

    const { id } = await params
    const body = await request.json()
    const parsed = gastoGeneralSchema.safeParse(body)

    if (!parsed.success) return zodErrorResponse(parsed.error)

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('gastos_generales')
      .insert({ ...parsed.data, obra_id: id })
      .select()
      .single()

    if (error) {
      return supabaseErrorResponse(error)
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return catchApiError(err)
  }
}
