import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireUser, zodErrorResponse, catchApiError, supabaseErrorResponse } from '@/lib/api/helpers'
import { presupuestoManoObraSchema } from '@/lib/validations/manoDeObra'

// Upsert: un solo presupuesto por combinación obra+proveedor. Si ya
// existe, se actualiza el monto en vez de crear un duplicado.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, response } = await requireUser()
    if (!user) return response

    const { id } = await params
    const body = await request.json()
    const parsed = presupuestoManoObraSchema.safeParse(body)

    if (!parsed.success) return zodErrorResponse(parsed.error)

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('presupuesto_mano_obra')
      .upsert(
        { ...parsed.data, obra_id: id },
        { onConflict: 'obra_id,proveedor_id' }
      )
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
