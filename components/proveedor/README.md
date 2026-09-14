# components/proveedor

Secciones que aparecen dentro del detalle de un proveedor
(`app/proveedores/[id]/page.tsx`), mismo patrón que `components/obra/`
(cada una dentro de un `CollapsibleCard`, con su propio `useState` +
`fetch` a su ruta de API).

- **`EmpleadosSection.tsx`** — el personal de la cuadrilla de este
  proveedor (los albañiles de Marcelo, o Clisman mismo). Es un registro
  de referencia/contacto (nombre, oficio, DNI, teléfono) — la plata
  (presupuestado/pagado/saldo) se maneja a nivel del proveedor, no de
  cada empleado individual (ver la cuenta corriente de mano de obra en
  el detalle de obra).
