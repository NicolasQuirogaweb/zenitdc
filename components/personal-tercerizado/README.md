# components/personal-tercerizado

Secciones que aparecen dentro del detalle de un registro de personal
tercerizado (`app/personal-tercerizado/[id]/page.tsx`) — mano de obra
subcontratada (ej. Marcelo/cuadrilla de albañilería, Clisman/herrería).
Mismo patrón que `components/personal/`.

- **`HistorialPagosSection.tsx`** — igual que el de `components/personal/`
  (registro de pagos + alta desde acá mismo, con motivo obligatorio),
  con una diferencia clave: **la obra es siempre obligatoria**. A Marcelo
  o Clisman se les paga un monto global por el trabajo hecho en una obra
  puntual (ellos reparten puertas adentro con su gente) — nunca un
  sueldo fijo sin ligar a ninguna obra, a diferencia de personal de la
  empresa.

**Importante:** esto es un concepto DISTINTO a `proveedores` (que quedó
exclusivamente para proveedores de materiales). No hay ninguna relación
entre `personal_tercerizado` y `proveedores` en la base.
