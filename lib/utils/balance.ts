import { createClient } from '@/lib/supabase/server'
import type { BalanceGeneral, BalanceObra, BalancePorObra } from '@/types'

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

  const { data: obras } = await supabase
    .from('obras')
    .select('id, nombre, clientes(nombre), created_at')
    .order('created_at', { ascending: false })

  interface ObraConCliente {
    id: string
    nombre: string
    clientes: { nombre: string } | { nombre: string }[] | null
  }

  const obrasNormalizadas = ((obras ?? []) as ObraConCliente[]).map((o) => ({
    id: o.id,
    nombre: o.nombre,
    cliente_nombre: Array.isArray(o.clientes)
      ? (o.clientes[0]?.nombre ?? '')
      : (o.clientes?.nombre ?? ''),
  }))

  const balances = await Promise.all(
    obrasNormalizadas.map((o) => getBalanceObra(o.id))
  )

  const porObra: BalancePorObra[] = obrasNormalizadas.map((o, i) => ({
    obra_id: o.id,
    obra_nombre: o.nombre,
    cliente_nombre: o.cliente_nombre,
    total_ingresos: balances[i].total_ingresos,
    total_egresos: balances[i].total_egresos,
    resultado: balances[i].resultado,
  }))

  const totalIngresosEmpresa = balances.reduce((s, b) => s + b.total_ingresos, 0)
  const totalEgresosEmpresa = balances.reduce((s, b) => s + b.total_egresos, 0)

  return {
    total_ingresos: totalIngresosEmpresa,
    total_egresos: totalEgresosEmpresa,
    resultado: totalIngresosEmpresa - totalEgresosEmpresa,
    por_obra: porObra,
  }
}