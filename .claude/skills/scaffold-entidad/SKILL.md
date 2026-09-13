---
name: scaffold-entidad
description: Genera una entidad CRUD nueva completa (tabla SQL con RLS, schema Zod, ruta de API, formulario, página de listado) siguiendo el patrón exacto de clientes/obras en Zenit DC. Usar al agregar cualquier entidad nueva al proyecto (ej. proveedores, personal de empresa, gastos de empresa).
---

# Scaffold de entidad (Zenit DC)

Este proyecto tiene un patrón único y consistente para toda entidad CRUD
(ver `clientes` y `obras` como referencia canónica). Al agregar una
entidad nueva, seguir estos 5 pasos en orden — no improvisar una
estructura distinta.

## 1. Tabla SQL (el usuario la corre en el SQL Editor de Supabase)

```sql
create table <entidad> (
  id          uuid primary key default gen_random_uuid(),
  -- columnas específicas de la entidad
  created_at  timestamptz default now()
);

alter table <entidad> enable row level security;

create policy "Solo autenticados"
  on <entidad>
  for all
  to public
  using (auth.role() = 'authenticated');
```

Si la entidad pertenece a una obra (como casi todo en este proyecto),
agregar `obra_id uuid references obras(id) on delete cascade`. Si es una
relación tipo "cuenta corriente" (presupuestado + pagos), separar en DOS
tablas — una de presupuesto y otra de pagos — en vez de una sola tabla
con columnas mezcladas (ver el patrón `presupuesto_items` /
`pagos_clientes`, que son conceptualmente equivalentes a "lo
presupuestado" y "lo efectivamente pagado").

## 2. Schema Zod — `lib/validations/<entidad>.ts`

```typescript
import { z } from 'zod'

export const <entidad>Schema = z.object({
  // un campo por columna, con los mensajes de error en español
})

export type <Entidad>FormData = z.infer<typeof <entidad>Schema>
```

Ver `lib/validations/README.md` y cualquier archivo existente ahí como
plantilla exacta.

## 3. Ruta de API — `app/api/<entidad>/route.ts` (+ `[id]/route.ts`)

Usar SIEMPRE los 4 helpers de `lib/api/helpers.ts`
(`requireUser`, `zodErrorResponse`, `catchApiError`,
`supabaseErrorResponse`) — ver `lib/api/README.md`. Estructura de cada
handler: `requireUser()` → parsear body → validar con el schema Zod →
consulta a Supabase → responder. Copiar el esqueleto de
`app/api/clientes/route.ts` y `app/api/clientes/[id]/route.ts`.

## 4. Formulario — `components/forms/<Entidad>Form.tsx`

`react-hook-form` + `zodResolver(<entidad>Schema)`, recibe
`defaultValues` y `onSubmit` por props (no sabe si crea o edita, ni a
qué ruta le pega — eso lo decide la página). Cualquier campo de fecha
usa `FechaInput`, nunca `<input type="date">`. Ver
`components/forms/README.md`.

## 5. Página de listado — `app/<entidad>/page.tsx` (+ `nuevo/page.tsx`,
`[id]/editar/page.tsx` si aplica)

Sigue el patrón de `app/clientes/page.tsx`: `useState` + `fetch` a la
ruta de API + `Skeleton` mientras carga + `useToast` para feedback +
`useConfirm` antes de eliminar (nunca `confirm()` nativo).

## Al terminar

Correr la skill `verificar-y-mergear` — la entidad nueva no está
completa hasta que pase `tsc`/`build`/`lint`/`test` y esté mergeada a
`develop`. Si la entidad nueva se conecta con `lib/utils/balance.ts`
(cualquier cosa que sea un ingreso o egreso), actualizar los tests de
`balance.test.ts` para cubrir el caso nuevo.
