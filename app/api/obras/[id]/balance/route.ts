import { NextResponse } from 'next/server'
import { createClient, getAuthenticatedUser } from '@/lib/supabase/server'
import { getBalanceObra } from '@/lib/utils/balance'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { id } = await params
    const supabase = await createClient()

    const { data: obra, error } = await supabase.from('obras').select('id').eq('id', id).single()

    if (error || !obra) {
      return NextResponse.json({ error: 'Obra no encontrada' }, { status: 404 })
    }

    const balance = await getBalanceObra(id)
    return NextResponse.json(balance)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error inesperado' },
      { status: 500 }
    )
  }
}