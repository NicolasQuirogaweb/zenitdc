import { createClient } from '@/lib/supabase/server'
import type { BalanceObra, BalanceGeneral } from '@/types'

export async function getBalanceObra(obraId: string): Promise<BalanceObra> {
  const supabase = await createClient()

  const [presupuesto, ingresos, egresosProv, egresosMat] = await Promise.all([
    supabase.from('presupuesto_items').select('monto').eq('obra_id', obraId),
    supabase.from('pagos_clientes').select('monto').eq('obra_id', obraId),
    supabase.from('pagos_proveedores').select('monto').eq('obra_id', obraId),
    supabase.from('gastos_materiales').select('monto').eq('obra_id', obraId),
  ])

  const totalPresupuestado = presupuesto.data?.reduce((s, i) => s + Number(i.monto), 0) ?? 0
  const totalIngresos = ingresos.data?.reduce((s, i) => s + Number(i.monto), 0) ?? 0
  const totalEgresos =
    (egresosProv.data?.reduce((s, i) => s + Number(i.monto), 0) ?? 0) +
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

  const [obras, gastosGenerales] = await Promise.all([
    supabase.from('obras').select('id'),
    supabase.from('gastos_generales').select('monto'),
  ])

  const obraIds = obras.data?.map((o) => o.id) ?? []

  let totalIngresosEmpresa = 0
  let totalEgresosEmpresa = 0

  for (const id of obraIds) {
    const balance = await getBalanceObra(id)
    totalIngresosEmpresa += balance.total_ingresos
    totalEgresosEmpresa += balance.total_egresos
  }

  const totalGastosGenerales =
    gastosGenerales.data?.reduce((s, i) => s + Number(i.monto), 0) ?? 0

  totalEgresosEmpresa += totalGastosGenerales

  return {
    total_ingresos: totalIngresosEmpresa,
    total_egresos: totalEgresosEmpresa,
    resultado: totalIngresosEmpresa - totalEgresosEmpresa,
  }
}