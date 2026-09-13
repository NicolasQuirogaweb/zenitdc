# app/api

Todas las escrituras (y algunas lecturas server-side, como el cálculo de
balance) pasan por acá — el navegador nunca escribe directo a Supabase
para nada que necesite validación. Cada `route.ts` sigue el mismo
esqueleto:

1. `requireUser()` (ver `lib/api/README.md`) — corta temprano si no hay
   sesión.
2. Parsear y validar el body con el schema de Zod correspondiente
   (`lib/validations/`) — corta con `zodErrorResponse` si no es válido.
3. La consulta/mutación a Supabase — si falla, `supabaseErrorResponse`.
4. Devolver el resultado con `NextResponse.json(...)`.

Rutas anidadas bajo `/obras/[id]/...` (presupuesto, pagos, gastos, fotos,
balance) siempre validan que la obra exista y pertenezca al flujo antes
de tocar la sub-entidad.

Al agregar una entidad nueva (ver skill `scaffold-entidad`), la ruta
nueva va acá siguiendo este mismo esqueleto — no hay excepciones al
patrón hoy.
