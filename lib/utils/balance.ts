import { createClient } from '@/lib/supabase/server'
import { CONCEPTOS_COSTOS_DIRECTOS } from '@/lib/constantes'
import { sumMonto } from '@/lib/utils/numeros'
import type { BalanceGeneral, BalanceObra, BalancePorObra } from '@/types'

interface FilaMonto {
  monto: number | string
}

interface FilaGastoGeneral extends FilaMonto {
  concepto: string
}

interface FilasBalanceObra {
  presupuesto: FilaMonto[]
  ingresos: FilaMonto[]
  gastosGenerales: FilaGastoGeneral[]
  gastosMateriales: FilaMonto[]
  pagosPersonalTercerizado: FilaMonto[]
  pagosPersonal: FilaMonto[]
}

/**
 * La aritmética del balance de una obra, pura (no toca Supabase) — la
 * usan tanto `getBalanceObra` (una obra, filtrando en la consulta) como
 * `getBalanceGeneral` (todas las obras, agrupando en memoria) para no
 * mantener la fórmula duplicada en dos lugares.
 */
function calcularBalanceDesdeFilas(obraId: string, filas: FilasBalanceObra): BalanceObra {
  const totalPresupuestado = sumMonto(filas.presupuesto)
  const totalIngresos = sumMonto(filas.ingresos)

  const costosDirectos = sumMonto(
    filas.gastosGenerales.filter((g) => CONCEPTOS_COSTOS_DIRECTOS.includes(g.concepto))
  )
  const totalGastosGenerales = sumMonto(
    filas.gastosGenerales.filter((g) => !CONCEPTOS_COSTOS_DIRECTOS.includes(g.concepto))
  )
  const totalGastosMateriales = sumMonto(filas.gastosMateriales)
  const totalManoObra = sumMonto(filas.pagosPersonalTercerizado)
  const totalPersonal = sumMonto(filas.pagosPersonal)

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

export async function getBalanceObra(obraId: string): Promise<BalanceObra> {
  const supabase = await createClient()

  const [presupuesto, ingresos, gastosGenerales, gastosMateriales, pagosPersonalTercerizado, pagosPersonal] =
    await Promise.all([
      supabase.from('presupuesto_items').select('monto').eq('obra_id', obraId),
      supabase.from('pagos_clientes').select('monto').eq('obra_id', obraId),
      supabase.from('gastos_generales').select('concepto, monto').eq('obra_id', obraId),
      supabase.from('gastos_materiales').select('monto').eq('obra_id', obraId),
      supabase.from('pagos_personal_tercerizado').select('monto').eq('obra_id', obraId),
      // los pagos a personal SIN obra_id (sueldos fijos) quedan afuera acá
      // a propósito: no son un egreso de esta obra puntual.
      supabase.from('pagos_personal').select('monto').eq('obra_id', obraId),
    ])

  return calcularBalanceDesdeFilas(obraId, {
    presupuesto: presupuesto.data ?? [],
    ingresos: ingresos.data ?? [],
    gastosGenerales: gastosGenerales.data ?? [],
    gastosMateriales: gastosMateriales.data ?? [],
    pagosPersonalTercerizado: pagosPersonalTercerizado.data ?? [],
    pagosPersonal: pagosPersonal.data ?? [],
  })
}

/** Agrupa un array de filas por `obra_id`, para no pedirle a la base una
 * consulta separada por cada obra (ver `getBalanceGeneral`). */
function agruparPorObra<T extends { obra_id: string }>(filas: T[] | null): Map<string, T[]> {
  const mapa = new Map<string, T[]>()
  for (const fila of filas ?? []) {
    const grupo = mapa.get(fila.obra_id)
    if (grupo) grupo.push(fila)
    else mapa.set(fila.obra_id, [fila])
  }
  return mapa
}

export async function getBalanceGeneral(): Promise<BalanceGeneral> {
  const supabase = await createClient()

  // Una sola consulta por tabla para TODAS las obras (no una por obra):
  // con cientos de obras, evita que esto sea 6N+1 consultas en vez de 8.
  const [
    { data: obras },
    presupuesto,
    ingresos,
    gastosGenerales,
    gastosMateriales,
    pagosPersonalTercerizado,
    pagosPersonal,
    gastosEmpresa,
  ] = await Promise.all([
    supabase
      .from('obras')
      .select('id, nombre, clientes(nombre), created_at')
      .order('created_at', { ascending: false }),
    supabase.from('presupuesto_items').select('obra_id, monto'),
    supabase.from('pagos_clientes').select('obra_id, monto'),
    supabase.from('gastos_generales').select('obra_id, concepto, monto'),
    supabase.from('gastos_materiales').select('obra_id, monto'),
    supabase.from('pagos_personal_tercerizado').select('obra_id, monto'),
    // sin filtrar: trae tanto los pagos con obra como los que no tienen
    // (sueldos fijos, ej. redes/IT) — se separan en memoria más abajo, no
    // hace falta una segunda consulta a la misma tabla.
    supabase.from('pagos_personal').select('obra_id, monto'),
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

  const presupuestoPorObra = agruparPorObra(presupuesto.data)
  const ingresosPorObra = agruparPorObra(ingresos.data)
  const gastosGeneralesPorObra = agruparPorObra(gastosGenerales.data)
  const gastosMaterialesPorObra = agruparPorObra(gastosMateriales.data)
  const pagosPersonalTercerizadoPorObra = agruparPorObra(pagosPersonalTercerizado.data)
  const pagosPersonalPorObra = agruparPorObra(pagosPersonal.data)

  const balances = obrasNormalizadas.map((o) =>
    calcularBalanceDesdeFilas(o.id, {
      presupuesto: presupuestoPorObra.get(o.id) ?? [],
      ingresos: ingresosPorObra.get(o.id) ?? [],
      gastosGenerales: gastosGeneralesPorObra.get(o.id) ?? [],
      gastosMateriales: gastosMaterialesPorObra.get(o.id) ?? [],
      pagosPersonalTercerizado: pagosPersonalTercerizadoPorObra.get(o.id) ?? [],
      pagosPersonal: pagosPersonalPorObra.get(o.id) ?? [],
    })
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
  const totalGastosEmpresa = sumMonto(gastosEmpresa.data)
  const totalPersonalSinObra = sumMonto(
    (pagosPersonal.data ?? []).filter((p: { obra_id: string | null }) => p.obra_id === null)
  )

  return {
    total_ingresos: totalIngresosEmpresa,
    total_egresos: totalEgresosEmpresa,
    total_gastos_generales: totalGastosGeneralesEmpresa,
    total_gastos_empresa: totalGastosEmpresa,
    total_personal_sin_obra: totalPersonalSinObra,
    resultado: totalIngresosEmpresa - totalEgresosEmpresa - totalGastosEmpresa - totalPersonalSinObra,
    por_obra: porObra,
  }
}
