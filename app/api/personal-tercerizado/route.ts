import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireUser, zodErrorResponse, catchApiError, supabaseErrorResponse } from '@/lib/api/helpers'
import { personalTercerizadoSchema } from '@/lib/validations/personalTercerizado'

export async function POST(request: Request) {
  try {
    const { user, response } = await requireUser()
    if (!user) return response

    const body = await request.json()
    const parsed = personalTercerizadoSchema.safeParse(body)

    if (!parsed.success) return zodErrorResponse(parsed.error)

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('personal_tercerizado')
      .insert(parsed.data)
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
