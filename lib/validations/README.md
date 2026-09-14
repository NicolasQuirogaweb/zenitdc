# lib/validations

Un schema de Zod por entidad (`clientes.ts`, `obras.ts`, `pagos.ts`,
`gastosMaterial.ts`, `gastosGenerales.ts`, `presupuesto.ts`, `fotos.ts`).
Cada ruta de API en `app/api/` importa el schema correspondiente y valida
el body antes de tocar Supabase — es la misma validación (o una versión
espejada) que usa el formulario del lado del cliente vía
`zodResolver`, pero la del servidor es la que realmente protege los
datos: la del cliente solo mejora la experiencia de uso.

Al agregar una entidad nueva, el schema va acá, con el mismo nombre de
archivo que la entidad en plural/camelCase (ver skill
`scaffold-entidad`).

- **`comun.ts`** — fragmentos de Zod que se repiten en casi todos los
  schemas de "movimiento" (pago o gasto): `montoPositivo`, `fechaISO`,
  `observacionesOpcionales`. Componer con `.extend()`/reuso directo en
  vez de retipear `z.number().positive(...)` y la regex de fecha en cada
  archivo nuevo — eso es justo lo que pasó en la Fase 3 (6 archivos con
  la misma forma) antes de extraer esto.
