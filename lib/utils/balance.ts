import { createClient } from '@/lib/supabase/server'
import { CONCEPTOS_COSTOS_DIRECTOS } from '@/lib/constantes'
import type { BalanceGeneral, BalanceObra, BalancePorObra } from '@/types'

export async function getBalanceObra(obraId: string): Promise<BalanceObra> {
  const supabase = await createClient()

  const [presupuesto, ingresos, gastosGenerales, egresosMat, pagosManoObra, pagosPersonal] =
    await Promise.all([
      supabase.from('presupuesto_items').select('monto').eq('obra_id', obraId),
      supabase.from('pagos_clientes').select('monto').eq('obra_id', obraId),
      supabase.from('gastos_generales').select('concepto, monto').eq('obra_id', obraId),
      supabase.from('gastos_materiales').select('monto').eq('obra_id', obraId),
      supabase.from('pagos_mano_obra').select('monto').eq('obra_id', obraId),
      supabase.from('pagos_personal').select('monto').eq('obra_id', obraId),
    ])

  const totalPresupuestado = presupuesto.data?.reduce((s, i) => s + Number(i.monto), 0) ?? 0
  const totalIngresos = ingresos.data?.reduce((s, i) => s + Number(i.monto), 0) ?? 0

  const costosDirectos =
    gastosGenerales.data
      ?.filter((g) => CONCEPTOS_COSTOS_DIRECTOS.includes(g.concepto))
      .reduce((s, i) => s + Number(i.monto), 0) ?? 0
  const totalGastosGenerales =
    gastosGenerales.data
      ?.filter((g) => !CONCEPTOS_COSTOS_DIRECTOS.includes(g.concepto))
      .reduce((s, i) => s + Number(i.monto), 0) ?? 0

  const totalGastosMateriales = egresosMat.data?.reduce((s, i) => s + Number(i.monto), 0) ?? 0
  const totalManoObra = pagosManoObra.data?.reduce((s, i) => s + Number(i.monto), 0) ?? 0
  const totalPersonal = pagosPersonal.data?.reduce((s, i) => s + Number(i.monto), 0) ?? 0

  const totalEgresos =
    costosDirectos + totalGastosMateriales + totalGastosGenerales + totalManoObra + totalPersonal

  return {
    obra_id: obraId,
    total_presupuestado: totalPresupuestado,
    total_ingresos: totalIngresos,
    total_egresos: totalEgresos,
    total_gastos_generales: totalGastosGenerales,
    total_mano_obra: totalManoObra,
    total_personal: totalPersonal,
    resultado: totalIngresos - totalEgresos,
    diferencia_vs_presupuesto: totalIngresos - totalEgresos - totalPresupuestado,
  }
}

export async function getBalanceGeneral(): Promise<BalanceGeneral> {
  const supabase = await createClient()

  const [{ data: obras }, gastosEmpresa] = await Promise.all([
    supabase
      .from('obras')
      .select('id, nombre, clientes(nombre), created_at')
      .order('created_at', { ascending: false }),
    supabase.from('gastos_empresa').select('monto'),
  ])

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
    total_gastos_generales: balances[i].total_gastos_generales,
    total_mano_obra: balances[i].total_mano_obra,
    total_personal: balances[i].total_personal,
    resultado: balances[i].resultado,
  }))

  const totalIngresosEmpresa = balances.reduce((s, b) => s + b.total_ingresos, 0)
  const totalEgresosEmpresa = balances.reduce((s, b) => s + b.total_egresos, 0)
  const totalGastosGeneralesEmpresa = balances.reduce((s, b) => s + b.total_gastos_generales, 0)
  const totalGastosEmpresa = gastosEmpresa.data?.reduce((s, g) => s + Number(g.monto), 0) ?? 0

  return {
    total_ingresos: totalIngresosEmpresa,
    total_egresos: totalEgresosEmpresa,
    total_gastos_generales: totalGastosGeneralesEmpresa,
    total_gastos_empresa: totalGastosEmpresa,
    resultado: totalIngresosEmpresa - totalEgresosEmpresa - totalGastosEmpresa,
    por_obra: porObra,
  }
}
