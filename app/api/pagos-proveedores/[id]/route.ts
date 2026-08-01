import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { pagoProveedorSchema } from '@/lib/validations/pagosProveedor'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const parsed = pagoProveedorSchema.safeParse(body)

    if (!parsed.success) {
      const mensajes = Object.values(parsed.error.flatten().fieldErrors).flat().join(', ')
      return NextResponse.json({ error: mensajes || 'Datos inválidos' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('pagos_proveedores')
      .update(parsed.data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error inesperado' },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const supabase = await createClient()
    const { error } = await supabase.from('pagos_proveedores').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error inesperado' },
      { status: 500 }
    )
  }
}
