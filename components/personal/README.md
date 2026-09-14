# components/personal

Secciones que aparecen dentro del detalle de un empleado de personal
propio de la empresa (`app/personal/[id]/page.tsx`), mismo patrón que
`components/obra/` y `components/proveedor/` (cada una dentro de un
`CollapsibleCard`, con su propio `useState` + `fetch` a su ruta de API).

- **`HistorialPagosSection.tsx`** — de solo lectura: pagos a este
  empleado sumando TODAS las obras (`pagos_personal`), con el nombre de
  la obra en cada línea. No hay presupuesto ni cuenta corriente (el
  personal en relación de dependencia no se presupuesta por obra) — es
  distinto a `components/proveedor/CuentaCorrienteSection.tsx`, que sí
  tiene saldo. Cargar un pago nuevo se hace desde el detalle de la obra
  (`components/obra/PersonalSection.tsx`), no desde acá.
