# components/proveedor

Secciones que aparecen dentro del detalle de un proveedor
(`app/proveedores/[id]/page.tsx`), mismo patrón que `components/obra/`
(cada una dentro de un `CollapsibleCard`, con su propio `useState` +
`fetch` a su ruta de API).

- **`EmpleadosSection.tsx`** — el personal de la cuadrilla de este
  proveedor (los albañiles de Marcelo, o Clisman mismo). Es un registro
  de referencia/contacto (nombre, oficio, DNI, teléfono) — la plata
  (presupuestado/pagado/saldo) se maneja a nivel del proveedor, no de
  cada empleado individual.
- **`CuentaCorrienteSection.tsx`** — el acumulado de mano de obra
  tercerizada de este proveedor sumando TODAS las obras (presupuestado,
  pagado, saldo total). El detalle por obra puntual vive en
  `components/obra/ManoDeObraSection.tsx`, dentro del detalle de cada
  obra — esta sección es la vista agregada.
