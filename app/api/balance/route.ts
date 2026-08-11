import { NextResponse } from 'next/server'
import { requireUser, catchApiError } from '@/lib/api/helpers'
import { getBalanceGeneral } from '@/lib/utils/balance'

export async function GET() {
  try {
    const { user, response } = await requireUser()
    if (!user) return response

    const balance = await getBalanceGeneral()
    return NextResponse.json(balance)
  } catch (err) {
    return catchApiError(err)
  }
}