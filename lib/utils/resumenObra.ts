import { CONCEPTOS_COSTOS_DIRECTOS } from '@/lib/constantes'
import { sumMonto } from '@/lib/utils/numeros'

interface FilaMonto {
  monto: number | string
}

interface FilaGastoGeneral extends FilaMonto {
  concepto: string
}

export interface FilasGastoObra {
  gastosGenerales: FilaGastoGeneral[]
  gastosMateriales: FilaMonto[]
  pagosPersonalTercerizado: FilaMonto[]
  pagosPersonal: FilaMonto[]
}

export interface ResumenGastosObra {
  costosDirectos: number
  materiales: number
  gastosGenerales: number
  totalGastado: number
}

/**
 * Cuánto se gastó en una obra, sumado por categoría — pura aritmética
 * (no toca Supabase), compartida entre `ResumenObraSection.tsx` (una
 * obra) y `/pagos/obras` (todas las obras), para que las dos vistas
 * nunca puedan mostrar números distintos para la misma obra.
 *
 * Mano de obra tercerizada y personal pagado EN esta obra se suman
 * dentro de costos directos — no como líneas propias — mismo criterio
 * que el balance viejo (ver "Lógica de balance" en CLAUDE.md). Esto es
 * pura suma informativa: no resta ingresos ni calcula ningún
 * "resultado".
 */
export function calcularResumenGastosObra(filas: FilasGastoObra): ResumenGastosObra {
  const costosDirectosManual = sumMonto(
    filas.gastosGenerales.filter((g) => CONCEPTOS_COSTOS_DIRECTOS.includes(g.concepto))
  )
  const gastosGeneralesIndirectos = sumMonto(
    filas.gastosGenerales.filter((g) => !CONCEPTOS_COSTOS_DIRECTOS.includes(g.concepto))
  )
  const manoObraTercerizada = sumMonto(filas.pagosPersonalTercerizado)
  const personalEnEstaObra = sumMonto(filas.pagosPersonal)
  const materiales = sumMonto(filas.gastosMateriales)

  const costosDirectos = costosDirectosManual + manoObraTercerizada + personalEnEstaObra

  return {
    costosDirectos,
    materiales,
    gastosGenerales: gastosGeneralesIndirectos,
    totalGastado: costosDirectos + materiales + gastosGeneralesIndirectos,
  }
}

/** Agrupa un array de filas por `obra_id`, para pedirle a Supabase cada
 * tabla UNA sola vez (todas las obras) en vez de una consulta por obra. */
export function agruparPorObra<T extends { obra_id: string }>(filas: T[] | null): Map<string, T[]> {
  const mapa = new Map<string, T[]>()
  for (const fila of filas ?? []) {
    const grupo = mapa.get(fila.obra_id)
    if (grupo) grupo.push(fila)
    else mapa.set(fila.obra_id, [fila])
  }
  return mapa
}
