# lib/utils

- **`formato.ts`** — `formatMoney` (formato de moneda ARS) y
  `formatFecha` (convierte una fecha ISO `yyyy-mm-dd` a `dd/mm/aaaa` para
  mostrar). Esta es la función que ya deja las fechas guardadas en
  formato argentino en las listas — el formato del *input* al cargar una
  fecha nueva lo resuelve `components/ui/FechaInput.tsx`, no esta
  función.
- **`numeros.ts`** — `sumMonto(rows)` (sumar el campo `monto` de un array
  de filas, usado en el "Total" de cada sección de lista) y
  `parsearMonto(valor, minimo)` (parsear el input de
  texto de un campo monto a un número válido o `null`, con el mismo
  criterio en todos los formularios — evita que cada sección reinvente su
  propia validación de "monto válido" con matices distintos).
- **`texto.ts`** — `normalizarTexto(valor)` (minúsculas + sin acentos, para
  comparar "García" con "garcia") y `coincideBusqueda(busqueda, ...campos)`
  (true si el término aparece en alguno de los campos ya normalizado;
  con `busqueda` vacía siempre da `true`). Usado para los buscadores de
  proveedores/clientes/obras/pagos/gastos-empresa — filtra en memoria
  sobre datos ya cargados, no vuelve a pedirle nada a Supabase.
- **`resumenObra.ts`** — `calcularResumenGastosObra(filas)` (cuánto se
  gastó en una obra, sumado por categoría — costos directos, materiales,
  gastos generales, y el total de los tres) y `agruparPorObra(filas)`
  (agrupa un array por `obra_id`, para pedirle a Supabase cada tabla UNA
  sola vez en vez de una consulta por obra). Compartido entre
  `components/obra/ResumenObraSection.tsx` (una obra) y `/pagos/obras`
  (todas las obras) — así las dos vistas nunca pueden mostrar números
  distintos para la misma obra. A propósito solo suma: no resta
  ingresos ni calcula ningún "resultado" (eso se sacó, ver "Naturaleza
  real del sistema" en CLAUDE.md).
