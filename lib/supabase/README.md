# lib/supabase

Dos clientes distintos de Supabase, según dónde se ejecuta el código —
`@supabase/ssr`, nunca `@supabase/auth-helpers-nextjs` (deprecado):

- **`client.ts`** — `createBrowserClient`, para código que corre en el
  navegador (componentes con `'use client'`).
- **`server.ts`** — `createServerClient` basado en cookies, para código
  que corre en el servidor (rutas de API, Server Components). Es el que
  usa `requireUser()` en `lib/api/helpers.ts` para validar la sesión.

Ninguno de los dos usa `SUPABASE_SERVICE_ROLE_KEY` — todo el acceso a
datos pasa por RLS con la anon key, autenticado como el usuario real de
la sesión.
