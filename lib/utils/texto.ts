/** Normaliza texto para comparar sin importar mayúsculas/minúsculas ni
 * acentos ("García" === "garcia" === "GARCIA") — clave para que la
 * búsqueda ande bien con nombres propios en español. */
export function normalizarTexto(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

/** true si `busqueda` aparece en alguno de los `campos` (ya normalizado).
 * `busqueda` vacía siempre matchea — así la lista se ve completa antes
 * de escribir nada. */
export function coincideBusqueda(busqueda: string, ...campos: (string | null | undefined)[]): boolean {
  const termino = normalizarTexto(busqueda)
  if (!termino) return true
  return campos.some((campo) => campo && normalizarTexto(campo).includes(termino))
}
