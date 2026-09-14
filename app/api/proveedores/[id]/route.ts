import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireUser, zodErrorResponse, catchApiError, supabaseErrorResponse } from '@/lib/api/helpers'
import { proveedorSchema } from '@/lib/validations/proveedores'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, response } = await requireUser()
    if (!user) return response

    const { id } = await params
    const body = await request.json()
    const parsed = proveedorSchema.safeParse(body)

    if (!parsed.success) return zodErrorResponse(parsed.error)

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('proveedores')
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

    // presupuesto_mano_obra, pagos_mano_obra y empleados_tercerizados son
    // "on delete cascade" desde proveedores: Postgres nunca tira un error
    // de foreign key al borrar, borra en cascada en silencio. Por eso hay
    // que chequear a mano si hay historial antes de dejar borrar.
    const [presupuesto, pagos, empleados] = await Promise.all([
      supabase.from('presupuesto_mano_obra').select('id', { count: 'exact', head: true }).eq('proveedor_id', id),
      supabase.from('pagos_mano_obra').select('id', { count: 'exact', head: true }).eq('proveedor_id', id),
      supabase.from('empleados_tercerizados').select('id', { count: 'exact', head: true }).eq('proveedor_id', id),
    ])

    if ((presupuesto.count ?? 0) > 0 || (pagos.count ?? 0) > 0 || (empleados.count ?? 0) > 0) {
      return NextResponse.json(
        {
          error:
            'No se puede eliminar: el proveedor tiene presupuesto, pagos de mano de obra o empleados cargados. Borralos primero.',
        },
        { status: 409 }
      )
    }

    const { error } = await supabase.from('proveedores').delete().eq('id', id)

    if (error) {
      return supabaseErrorResponse(error)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return catchApiError(err)
  }
}
