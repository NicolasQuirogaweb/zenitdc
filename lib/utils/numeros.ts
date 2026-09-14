/**
 * Suma el campo `monto` de un array de filas (típicamente resultado de una
 * consulta a Supabase). Centraliza el patrón `reduce(...) ?? 0` que se
 * repetía en balance.ts y en cada sección con un total.
 */
export function sumMonto(rows: { monto: number | string }[] | null | undefined): number {
  return rows?.reduce((total, fila) => total + Number(fila.monto), 0) ?? 0
}

/**
 * Parsea un input de tipo texto/numérico a un monto válido, o `null` si no
 * lo es (vacío, no numérico, o menor al mínimo permitido). `minimo` es 0.01
 * por default (la mayoría de los "monto" del proyecto tienen que ser > 0),
 * pero un presupuesto puede ser 0 — pasar `minimo: 0` en esos casos.
 */
export function parsearMonto(valor: string, minimo = 0.01): number | null {
  if (valor.trim() === '') return null
  const numero = Number(valor)
  if (!Number.isFinite(numero) || numero < minimo) return null
  return numero
}
