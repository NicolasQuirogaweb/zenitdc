# components/personal

Secciones que aparecen dentro del detalle de un empleado de personal
propio de la empresa (`app/personal/[id]/page.tsx`), mismo patrón que
`components/obra/` (cada una dentro de un `CollapsibleCard`, con su
propio `useState` + `fetch` a su ruta de API).

- **`HistorialPagosSection.tsx`** — el registro completo de pagos a este
  empleado: trae `pagos_personal` de TODAS las obras (con el nombre de
  la obra en cada línea), muestra el total pagado, y desde acá mismo se
  registra un pago nuevo — eligiendo a qué obra corresponde. La **obra es
  opcional**: hay personal con sueldo fijo sin ligar a ninguna obra
  puntual (ej. redes/IT), y otro que cobra por obra (ej. arquitecto,
  chofer). Todo pago requiere un **motivo obligatorio** (campo `motivo`
  en `pagos_personal`, ex "observaciones") — no hay presupuesto ni
  cuenta corriente, es solo historial.

Ver `components/personal-tercerizado/README.md` para el mismo patrón
aplicado a mano de obra subcontratada (ahí la obra sí es obligatoria).
