import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireUser, catchApiError } from '@/lib/api/helpers'
import { getBalanceObra } from '@/lib/utils/balance'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, response } = await requireUser()
    if (!user) return response

    const { id } = await params
    const supabase = await createClient()

    const { data: obra, error } = await supabase.from('obras').select('id').eq('id', id).single()

    if (error || !obra) {
      return NextResponse.json({ error: 'Obra no encontrada' }, { status: 404 })
    }

    const balance = await getBalanceObra(id)
    return NextResponse.json(balance)
  } catch (err) {
    return catchApiError(err)
  }
}