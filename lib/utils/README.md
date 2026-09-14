# lib/utils

- **`balance.ts`** — el cálculo de balance, la lógica más importante del
  proyecto (ver la sección "Lógica de balance" en `CLAUDE.md` para la
  fórmula completa y por qué es así). Es la única lógica de negocio del
  proyecto que tiene tests automatizados (`balance.test.ts`, con
  Vitest) — cualquier cambio en el comportamiento de `getBalanceObra` o
  `getBalanceGeneral` debe venir acompañado de un test que lo cubra.
  Estas funciones son puras (reciben datos, devuelven números) y nunca
  se llaman desde el frontend directamente — solo desde las rutas de API
  de balance. `getBalanceObra` agrega 6 tablas en paralelo (presupuesto,
  pagos de cliente, gastos generales, gastos de materiales, pagos de
  personal tercerizado — `pagos_personal_tercerizado` — y pagos de
  personal de la empresa) — al agregar una tabla nueva que sea un egreso
  de obra, sumarla ahí, no en un lugar aparte. `getBalanceGeneral`
  además resta de `resultado`: `gastos_empresa` (sin `obra_id`) y los
  `pagos_personal` que tampoco tienen `obra_id` (sueldos fijos, ej.
  redes/IT) — son los dos únicos gastos que no pertenecen a ninguna obra
  puntual.

  **Pendiente:** confirmar con Rodri que esta fórmula (qué resta del
  resultado y qué no) coincide con cómo arma el balance en la
  práctica — no se revisó a fondo en el cambio que separó personal
  tercerizado de proveedores, solo se repuntaron las tablas para que
  siguiera siendo consistente con el esquema nuevo.

  **Importante para escalabilidad:** `getBalanceGeneral` NO llama a
  `getBalanceObra` en un loop por cada obra (eso sería 6N+1 consultas con
  N obras). En cambio, pide cada una de las 6 tablas UNA sola vez (sin
  filtrar por obra), las agrupa por `obra_id` en memoria
  (`agruparPorObra`) y recién ahí aplica la misma aritmética
  (`calcularBalanceDesdeFilas`, compartida con `getBalanceObra`) por
  grupo. Son 8 consultas totales sin importar si hay 5 obras o 500. Si se
  agrega una tabla nueva de egreso, hay que sumarla en los TRES lugares:
  el `Promise.all` de `getBalanceObra`, el `Promise.all` de
  `getBalanceGeneral`, y `calcularBalanceDesdeFilas` — el test
  `hace una sola tanda de consultas...` en `balance.test.ts` no deja que
  esto se vuelva a romper en un loop por accidente.
- **`formato.ts`** — `formatMoney` (formato de moneda ARS) y
  `formatFecha` (convierte una fecha ISO `yyyy-mm-dd` a `dd/mm/aaaa` para
  mostrar). Esta es la función que ya deja las fechas guardadas en
  formato argentino en las listas — el formato del *input* al cargar una
  fecha nueva lo resuelve `components/ui/FechaInput.tsx`, no esta
  función.
- **`numeros.ts`** — `sumMonto(rows)` (sumar el campo `monto` de un array
  de filas, usado tanto en `balance.ts` como en el "Total" de cada
  sección de lista) y `parsearMonto(valor, minimo)` (parsear el input de
  texto de un campo monto a un número válido o `null`, con el mismo
  criterio en todos los formularios — evita que cada sección reinvente su
  propia validación de "monto válido" con matices distintos).
