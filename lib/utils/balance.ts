import { createClient } from '@/lib/supabase/server'
import type { BalanceObra, BalanceGeneral } from '@/types'

export async function getBalanceObra(obraId: string): Promise<BalanceObra> {
  const supabase = await createClient()

  const [presupuesto, ingresos, egresosGen, egresosMat] = await Promise.all([
    supabase.from('presupuesto_items').select('monto').eq('obra_id', obraId),
    supabase.from('pagos_clientes').select('monto').eq('obra_id', obraId),
    supabase.from('gastos_generales').select('monto').eq('obra_id', obraId),
    supabase.from('gastos_materiales').select('monto').eq('obra_id', obraId),
  ])

  const totalPresupuestado = presupuesto.data?.reduce((s, i) => s + Number(i.monto), 0) ?? 0
  const totalIngresos = ingresos.data?.reduce((s, i) => s + Number(i.monto), 0) ?? 0
  const totalEgresos =
    (egresosGen.data?.reduce((s, i) => s + Number(i.monto), 0) ?? 0) +
    (egresosMat.data?.reduce((s, i) => s + Number(i.monto), 0) ?? 0)

  return {
    obra_id: obraId,
    total_presupuestado: totalPresupuestado,
    total_ingresos: totalIngresos,
    total_egresos: totalEgresos,
    resultado: totalIngresos - totalEgresos,
    diferencia_vs_presupuesto: totalIngresos - totalEgresos - totalPresupuestado,
  }
}

export async function getBalanceGeneral(): Promise<BalanceGeneral> {
  const supabase = await createClient()

  const { data: obras } = await supabase.from('obras').select('id')

  const obraIds = obras?.map((o) => o.id) ?? []

  const balances = await Promise.all(obraIds.map((id) => getBalanceObra(id)))

  const totalIngresosEmpresa = balances.reduce((s, b) => s + b.total_ingresos, 0)
  const totalEgresosEmpresa = balances.reduce((s, b) => s + b.total_egresos, 0)

  return {
    total_ingresos: totalIngresosEmpresa,
    total_egresos: totalEgresosEmpresa,
    resultado: totalIngresosEmpresa - totalEgresosEmpresa,
  }
}