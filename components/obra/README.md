# components/obra

Las secciones que aparecen dentro del detalle de una obra
(`app/obras/[id]/page.tsx`). No son rutas separadas — todas viven en la
misma pantalla, cada una dentro de un `CollapsibleCard`.

- **`PresupuestoSection.tsx`** — presupuesto aprobado por rubro (lo que
  se le va a cobrar al cliente, no un costo).
- **`GastosRealesSection.tsx`** — **se reutiliza dos veces** en el
  detalle de obra, con props distintas (`titulo`, `conceptosSugeridos`,
  `filtro`): una vez para "costos directos" y otra para "gastos
  generales de la obra". Es la misma tabla de Supabase
  (`gastos_generales`) en los dos casos — lo que cambia es el filtro por
  `concepto` contra `CONCEPTOS_COSTOS_DIRECTOS` (ver
  `lib/utils/README.md`). Si hay que tocar el comportamiento de una sola
  de las dos, hay que hacerlo vía props, no bifurcando el componente en
  dos.
- **`GastosMaterialesSection.tsx`** — gastos de materiales (tabla
  separada, `gastos_materiales`).
- **`PagosClientesSection.tsx`** — pagos que el cliente le hizo a Zenit
  DC por esta obra.
- **`BalanceSection.tsx`** — muestra el resultado calculado por
  `lib/utils/balance.ts`, nunca recalcula nada localmente.

Todas siguen el mismo patrón interno: estado local con `useState` +
`fetch` a su ruta de API correspondiente + `useToast` para feedback +
`useConfirm` antes de eliminar un ítem.

**A propósito NO hay acá** una sección de mano de obra tercerizada ni de
personal de la empresa — Rodri pidió simplificar esta pantalla. El alta
de pagos a esas personas vive en su propia ficha
(`components/personal/HistorialPagosSection.tsx` y
`components/personal-tercerizado/HistorialPagosSection.tsx`), eligiendo
la obra desde ahí, no al revés.
