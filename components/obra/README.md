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
- **`ManoDeObraSection.tsx`** — cuenta corriente con cada proveedor de
  mano de obra tercerizada en esta obra puntual (`presupuesto_mano_obra`
  + `pagos_mano_obra`, separadas por conveniencia — presupuestado vs.
  efectivamente pagado). El acumulado de un proveedor sumando todas sus
  obras vive en `components/proveedor/CuentaCorrienteSection.tsx`, no acá.
- **`PersonalSection.tsx`** — pagos a personal propio de la empresa (en
  relación de dependencia, no tercerizado) por esta obra puntual
  (`pagos_personal`). A diferencia de `ManoDeObraSection.tsx`, no hay
  presupuesto ni cuenta corriente — es solo un historial de pagos, porque
  el personal en relación de dependencia no se presupuesta por obra. El
  historial agregado de un empleado sumando todas sus obras vive en
  `components/personal/HistorialPagosSection.tsx`, no acá.
- **`PagosClientesSection.tsx`** — pagos que el cliente le hizo a Zenit
  DC por esta obra.
- **`BalanceSection.tsx`** — muestra el resultado calculado por
  `lib/utils/balance.ts`, nunca recalcula nada localmente.

Todas siguen el mismo patrón interno: estado local con `useState` +
`fetch` a su ruta de API correspondiente + `useToast` para feedback +
`useConfirm` antes de eliminar un ítem.
