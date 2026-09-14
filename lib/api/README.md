# lib/api

**`helpers.ts`** — utilidades compartidas por todas las rutas de API
(`app/api/**/route.ts`), para no repetir el mismo boilerplate en cada una:

- **`requireUser()`** — chequea la sesión del lado del servidor y
  devuelve el usuario o una respuesta 401 lista para retornar. Se llama
  al principio de CADA ruta, incluso las que ya están detrás de
  `proxy.ts` — nunca se confía solo en el middleware.
- **`zodErrorResponse(error)`** — convierte un error de validación Zod en
  una respuesta 400 consistente.
- **`catchApiError(err)`** — el catch genérico de cada ruta; loguea el
  error real y devuelve una respuesta 500 genérica.
- **`supabaseErrorResponse(error)`** — igual que arriba pero para errores
  que vienen de una consulta a Supabase — nunca se devuelve el mensaje
  crudo de Postgres al cliente.
- **`hasRelatedRows(supabase, checks)`** — chequea si existe alguna fila
  relacionada antes de borrar un registro "padre". Necesario para
  cualquier tabla hija con `on delete cascade` (ej. `pagos_personal` →
  `personal_empresa`, `pagos_personal_tercerizado` →
  `personal_tercerizado`): con cascade, Postgres NUNCA tira un error de
  foreign key al borrar — borra en cascada en silencio — así que el
  chequeo hay que hacerlo a mano ANTES del delete, no capturando un error
  que nunca va a ocurrir (ver el `DELETE` de `personal`/
  `personal-tercerizado` para el patrón completo). `proveedores` no lo
  necesita: sus referencias (`gastos_materiales`/`gastos_generales`) son
  `on delete set null`, no cascade.

Cualquier ruta de API nueva (ver skill `scaffold-entidad`) debe usar
estos helpers en vez de reimplementar el manejo de errores.
