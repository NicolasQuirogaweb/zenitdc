import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireUser, zodErrorResponse, catchApiError, supabaseErrorResponse } from '@/lib/api/helpers'
import { presupuestoItemSchema } from '@/lib/validations/presupuesto'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, response } = await requireUser()
    if (!user) return response

    const { id } = await params
    const body = await request.json()
    const parsed = presupuestoItemSchema.safeParse(body)

    if (!parsed.success) return zodErrorResponse(parsed.error)

    const supabase = await createClient()
    const { data: existentes } = await supabase
      .from('presupuesto_items')
      .select('rubro')
      .eq('obra_id', id)

    const rubroNormalizado = parsed.data.rubro.trim().toLowerCase()
    const yaExiste = existentes?.some(
      (item) => item.rubro.trim().toLowerCase() === rubroNormalizado
    )

    if (yaExiste) {
      return NextResponse.json(
        { error: `El rubro "${parsed.data.rubro}" ya está cargado en esta obra. Podés editarlo.` },
        { status: 409 }
      )
    }

    const { data, error } = await supabase
      .from('presupuesto_items')
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
