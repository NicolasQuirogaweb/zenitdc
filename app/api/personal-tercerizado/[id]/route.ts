import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireUser, zodErrorResponse, catchApiError, supabaseErrorResponse, hasRelatedRows } from '@/lib/api/helpers'
import { personalTercerizadoSchema } from '@/lib/validations/personalTercerizado'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, response } = await requireUser()
    if (!user) return response

    const { id } = await params
    const body = await request.json()
    const parsed = personalTercerizadoSchema.safeParse(body)

    if (!parsed.success) return zodErrorResponse(parsed.error)

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('personal_tercerizado')
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

    // pagos_personal_tercerizado es "on delete cascade" desde
    // personal_tercerizado: Postgres nunca tira un error de foreign key
    // al borrar, borra en cascada en silencio. Por eso hay que chequear
    // a mano si hay pagos antes de dejar borrar.
    const tienePagos = await hasRelatedRows(supabase, [
      { tabla: 'pagos_personal_tercerizado', columna: 'personal_tercerizado_id', valor: id },
    ])

    if (tienePagos) {
      return NextResponse.json(
        { error: 'No se puede eliminar: tiene pagos registrados. Borralos primero.' },
        { status: 409 }
      )
    }

    const { error } = await supabase.from('personal_tercerizado').delete().eq('id', id)

    if (error) {
      return supabaseErrorResponse(error)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return catchApiError(err)
  }
}
