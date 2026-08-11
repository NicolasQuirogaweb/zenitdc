import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireUser, zodErrorResponse, catchApiError, supabaseErrorResponse } from '@/lib/api/helpers'
import { presupuestoItemSchema } from '@/lib/validations/presupuesto'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, response } = await requireUser()
    if (!user) return response

    const { id } = await params
    const body = await request.json()
    const parsed = presupuestoItemSchema.safeParse(body)

    if (!parsed.success) return zodErrorResponse(parsed.error)

    const supabase = await createClient()
    const { data: actual } = await supabase
      .from('presupuesto_items')
      .select('obra_id')
      .eq('id', id)
      .single()

    const rubroNormalizado = parsed.data.rubro.trim().toLowerCase()

    if (actual) {
      const { data: existentes } = await supabase
        .from('presupuesto_items')
        .select('id, rubro')
        .eq('obra_id', actual.obra_id)

      const yaExiste = existentes?.some(
        (item) => item.id !== id && item.rubro.trim().toLowerCase() === rubroNormalizado
      )

      if (yaExiste) {
        return NextResponse.json(
          { error: `El rubro "${parsed.data.rubro}" ya está cargado en esta obra. Podés editarlo.` },
          { status: 409 }
        )
      }
    }

    const { data, error } = await supabase
      .from('presupuesto_items')
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
    const { error } = await supabase.from('presupuesto_items').delete().eq('id', id)

    if (error) {
      return supabaseErrorResponse(error)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return catchApiError(err)
  }
}
