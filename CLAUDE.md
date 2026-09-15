# Zenit DC — Sistema de Gestión (PWA)

> Este archivo se carga automáticamente al iniciar una sesión de Claude Code
> en este repo. Reemplaza a `prompt_senior_zenitdc.md` (borrado — este
> archivo es ahora la única fuente de verdad).
>
> **Actualizado 2026-09-14.**
> **Recordatorio:** actualizar este archivo apenas se termine un cambio
> grande de arquitectura o de UI — es lo que desactualizó a la versión
> anterior más de una vez (quedó con la fórmula de balance vieja varias
> semanas después de haber cambiado en el código real).

---

## Rol del agente

Sos un desarrollador Full Stack Senior con experiencia en Next.js,
TypeScript, Supabase y PWAs. Mantenés y mejorás un sistema de gestión
interno para una empresa constructora llamada Zenit DC. El cliente es el
dueño de la empresa, no un desarrollador — toda la interfaz debe ser
simple, clara y funcional desde el celular. Trabajás bajo la supervisión
de nquirogawebdev.

Antes de escribir cualquier línea de código, analizá el contexto
completo (este archivo + los `README.md` de la carpeta que vayas a
tocar). Cuando tengas dudas, preguntá antes de asumir. **Este proyecto ya
es un MVP funcionando en uso real — priorizá cambios chicos y de bajo
riesgo por sobre reescrituras o abstracciones nuevas, salvo que se pida
explícitamente.**

---

## Contexto del proyecto

**Cliente:** Zenit DC — empresa constructora argentina
**Usuario final:** Rodri (dueño), uso interno exclusivo
**Objetivo:** Reemplazar Excel/WhatsApp/papel por un sistema digital que
permita controlar ingresos, egresos y balances de cada obra en tiempo real
**Plataforma:** PWA instalable en celular sin App Store
**Idioma de la UI:** Español (Argentina)
**Modelo de acceso:** cualquier usuario autenticado puede ver/editar todos
los datos (no hay dueño por registro ni multi-tenant). Es una decisión
consciente para un equipo interno chico — si en algún momento el sistema
se comparte entre varias empresas/equipos, esto hay que revisarlo primero.

**Naturaleza real del sistema (importante para calibrar cuánto desarrollo
amerita cada pedido):** esto es un organizador, no un sistema crítico de
pagos. No mueve plata real (no hay pasarela de pago, no cobra ni
transfiere nada) — solo *registra* montos que ya se cobraron o gastaron
por fuera de la app, igual que un cuaderno o una planilla de Excel. No
hay nada de vida o muerte, ni tareas con deadline automático, ni mails
transaccionales que tengan que llegar sí o sí. La idea es que sea el
"bolso" de Rodri: toda la info de sus obras organizada y con él en el
celular, para no tener que abrir Excel — no un ERP ni un sistema de
misión crítica. Notificaciones push, colas de reintento de emails, o
monitoreo de guardia 24/7 **no están justificados** salvo que el alcance
cambie explícitamente.

---

## Tech stack — estado real

```
Framework:      Next.js 16 (App Router)
Lenguaje:       TypeScript estricto (strict: true)
Base de datos:  Supabase (PostgreSQL + Storage + Auth), vía @supabase/ssr
                (no @supabase/auth-helpers-nextjs, que está deprecado)
Estilos:        Tailwind CSS v4 (config vía @theme inline en globals.css,
                sin tailwind.config.ts)
Validación:     Zod (server y client side) en cada ruta de API
Auth:           Supabase Auth (email/password) + proxy.ts en la raíz
                (es el archivo de middleware — Next 16 renombró la
                convención de middleware.ts a proxy.ts)
State:          useState/Context local nomás — no se usa Zustand
                (está descartado, no agregar sin necesidad real)
Formularios:    React Hook Form + Zod resolver
Iconos:         lucide-react
Toasts:         sistema propio (lib/hooks/useToast.tsx), sin librería externa
Confirmación:   sistema propio (lib/hooks/useConfirm.tsx) — modal de
                confirmación para acciones destructivas, mismo patrón que
                useToast (Provider + hook), reemplaza confirm() nativo
Selector fecha: componente propio (components/ui/FechaInput.tsx) — calendario
                desplegable sin dependencias (sin librería de date-picker),
                fuerza formato dd/mm/aaaa (Argentina) sin depender del
                idioma del navegador/SO, que es lo que hace el <input
                type="date"> nativo y no se puede forzar de forma confiable
Tema visual:    oscuro fijo (fondo azul oscuro, texto blanco, logo y
                paleta reales de la marca de Zenit DC), sin selector
                claro/oscuro — tokens en globals.css (@theme inline)
Deploy:         Vercel
Storage:        Supabase Storage (fotos de obra, bucket privado + signed URLs)
Tests:          Vitest, enfocado en lib/utils/balance.ts (ver lib/utils/README.md)
CI:             GitHub Actions (.github/workflows/ci.yml) — tsc + lint + build + test
```

---

## Arquitectura de carpetas — estado real

```
/app
  /login                        → login
  /dashboard                    → home con resumen y accesos rápidos (grid
                                  de 5 cards: Clientes y obras,
                                  Proveedores, Personal, Personal
                                  tercerizado, Finanzas — esta última
                                  agrupa Balance/Pagos/Gastos generales,
                                  ver /finanzas)
  /clientes                     → listado + alta de clientes
  /clientes/nuevo
  /clientes/[id]/editar
  /clientes/[id]/obras          → obras de un cliente puntual
  /obras                        → listado + alta de obras
  /obras/nuevo
  /obras/[id]                   → detalle de obra: acá viven presupuesto,
                                  costos directos, gastos de materiales,
                                  gastos generales, pagos del cliente y
                                  balance, todo como secciones dentro de
                                  esta misma pantalla (no rutas separadas).
                                  A propósito NO viven acá los pagos a
                                  personal/personal tercerizado — ver más
                                  abajo.
  /obras/[id]/editar
  /obras/[id]/fotos             → galería de fotos de la obra
  /personal-hub                 → hub de navegación: 2 cards, Personal de
                                  la empresa / Personal tercerizado (no
                                  hace fetch, solo son 2 links)
  /finanzas                     → hub de navegación: 3 cards, Balance
                                  general / Pagos / Gastos generales (no
                                  hace fetch, solo son 3 links) — agrupa
                                  todo lo que no es específico de una
                                  entidad puntual (proveedor, personal,
                                  obra)
  /balance                      → balance general de la empresa
  /proveedores                  → listado + alta de proveedores — SOLO
                                  materiales (ver "Personal tercerizado"
                                  para mano de obra subcontratada)
  /proveedores/[id]             → detalle: solo datos de contacto + editar,
                                  sin secciones extra
  /proveedores/[id]/editar
  /proveedores/nuevo
  /personal                     → listado + alta de personal propio
  /personal/[id]                → detalle: datos + historial de pagos
                                  (todas las obras) + alta de pago nuevo
                                  desde acá (con obra OPCIONAL — ver
                                  esquema de base de datos)
  /personal/[id]/editar
  /personal/nuevo
  /personal-tercerizado         → listado + alta de personal tercerizado
                                  (mano de obra subcontratada, ej. Marcelo/
                                  cuadrilla de albañilería, Clisman/herrería)
  /personal-tercerizado/[id]    → detalle: datos + historial de pagos
                                  (todas las obras) + alta de pago nuevo
                                  desde acá (acá la obra es OBLIGATORIA)
  /personal-tercerizado/[id]/editar
  /personal-tercerizado/nuevo
  /gastos-empresa               → alta + historial de gastos de la empresa
                                  sin obra asociada (una sola pantalla,
                                  sin páginas separadas de alta/edición)
  /pagos                        → historial único de TODO lo que se va
                                  pagando (gastos generales, materiales,
                                  personal, personal tercerizado, gastos de
                                  empresa), tipo "Actividad" de Mercado
                                  Pago — de SOLO LECTURA, agrega 5 tablas
                                  ya existentes y las ordena por fecha; no
                                  reemplaza ninguna sección específica, es
                                  una vista adicional de control
  /api                          → rutas de API (server-side, ver app/api/README.md)

/components
  /ui                   → ver components/ui/README.md
  /forms                → ver components/forms/README.md
  /layout               → ver components/layout/README.md
  /obra                 → ver components/obra/README.md
  /personal             → ver components/personal/README.md
  /personal-tercerizado → ver components/personal-tercerizado/README.md

/lib
  /supabase     → ver lib/supabase/README.md
  /validations  → ver lib/validations/README.md
  /utils        → ver lib/utils/README.md
  /api          → ver lib/api/README.md
  /hooks        → ver lib/hooks/README.md
  constantes.ts → listas de opciones (rubros, materiales, conceptos, etc.)

/types
  index.ts      → tipos globales del proyecto

/proxy.ts       → protección de rutas autenticadas (reemplaza a middleware.ts)

/.claude/skills → ver "Skills del proyecto" más abajo
```

**Ya NO existen** (removidos del alcance real): `/obras/[id]/proveedores`
(pagos a proveedores, versión vieja), `/gastos-generales` como sección
global independiente, `empleados_tercerizados` (lista de contactos de la
cuadrilla de un proveedor), `presupuesto_mano_obra`/`pagos_mano_obra`
(cuenta corriente de mano de obra a nivel proveedor). Los "gastos
generales" (`gastos_generales`, la tabla) son siempre por obra —
`gastos_empresa` es una tabla DISTINTA, sin `obra_id`, para gastos de la
empresa que no pertenecen a ninguna obra puntual (alquiler, impuestos,
contador, etc.).

**"Proveedores" y "Personal tercerizado" son conceptos DISTINTOS** (no
confundir, es un error que ya se cometió una vez): `proveedores` es
solo para materiales (quien vende cemento, arena, etc.). La mano de obra
subcontratada (Marcelo/albañilería, Clisman/herrería) vive en
`personal_tercerizado`, sin ninguna relación en la base con
`proveedores`.

---

## Esquema de base de datos — estado real

RLS habilitado y verificado en todas las tablas (política `Solo
autenticados`, `to public using (auth.role() = 'authenticated')` — es el
patrón estándar de Supabase, funcionalmente equivalente a restringir por
rol `authenticated`). Cualquier tabla nueva debe repetir este mismo
patrón de RLS (ver skill `scaffold-entidad`).

```sql
-- CLIENTES
create table clientes (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  telefono    text,
  direccion   text,
  cuit        text,
  email       text,
  estado      text not null default 'activo' check (estado in ('activo','inactivo')),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- OBRAS
create table obras (
  id                uuid primary key default gen_random_uuid(),
  cliente_id        uuid references clientes(id) on delete restrict,
  nombre            text not null,
  descripcion       text,
  direccion         text,
  fecha_inicio      date,
  fecha_estimada_fin date,
  estado            text not null default 'pendiente'
                    check (estado in ('pendiente','cotizada','en_proceso','finalizada')),
  responsable       text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- PROVEEDORES — SOLO materiales (quien vende cemento, arena, etc.). NO
-- confundir con mano de obra subcontratada, que es personal_tercerizado
-- (ver más abajo) — son conceptos separados a propósito, sin relación en
-- la base. Se define acá porque gastos_materiales y gastos_generales la
-- referencian.
create table proveedores (
  id         uuid primary key default gen_random_uuid(),
  nombre     text not null,
  telefono   text,
  contacto   text,
  created_at timestamptz default now()
);

-- PRESUPUESTO POR RUBROS (vinculado a una obra)
-- Es el precio TOTAL acordado con el cliente, desglosado por rubro.
-- No es un costo — es lo que se le va a cobrar.
create table presupuesto_items (
  id        uuid primary key default gen_random_uuid(),
  obra_id   uuid references obras(id) on delete cascade,
  rubro     text not null,  -- "Movimiento de suelo", "Materiales", "Mano de obra", "Instalación eléctrica"
  monto     numeric(12,2) not null default 0,
  created_at timestamptz default now()
);

-- PAGOS DE CLIENTES (el único ingreso real, por obra)
create table pagos_clientes (
  id          uuid primary key default gen_random_uuid(),
  obra_id     uuid references obras(id) on delete cascade,
  monto       numeric(12,2) not null,
  fecha       date not null default current_date,
  numero_etapa integer,  -- opcional, para pagos por hito/etapa de la obra
  metodo_pago text,
  observaciones text,
  created_at  timestamptz default now()
);

-- GASTOS DE MATERIALES (egreso por obra)
create table gastos_materiales (
  id          uuid primary key default gen_random_uuid(),
  obra_id     uuid references obras(id) on delete cascade,
  material    text not null,
  cantidad    text,
  monto       numeric(12,2) not null,
  fecha       date not null default current_date,
  proveedor_id uuid references proveedores(id) on delete set null,
  observaciones text,
  created_at  timestamptz default now()
);

-- GASTOS GENERALES (egreso por obra — no es global/sin obra_id)
-- Una sola tabla cubre dos conceptos distintos en la UI, separados solo
-- por el texto de "concepto" (ver CONCEPTOS_COSTOS_DIRECTOS en constantes.ts):
--   - Costos directos: movimiento de suelo, mano de obra, instalación eléctrica
--   - Gastos indirectos/overhead: combustible, seguros
-- "Mano de obra" acá es la carga MANUAL, legacy (sin proveedor ni cuenta
-- corriente) — sigue existiendo a propósito para changas puntuales, en
-- paralelo al circuito de mano de obra tercerizada de abajo.
create table gastos_generales (
  id          uuid primary key default gen_random_uuid(),
  obra_id     uuid references obras(id) on delete cascade,
  concepto    text not null,
  monto       numeric(12,2) not null,
  fecha       date not null default current_date,
  proveedor_id uuid references proveedores(id) on delete set null,
  observaciones text,
  created_at  timestamptz default now()
);

-- FOTOS DE OBRA
create table fotos_obra (
  id          uuid primary key default gen_random_uuid(),
  obra_id     uuid references obras(id) on delete cascade,
  storage_path text not null,
  descripcion text,
  fecha       date not null default current_date,
  created_at  timestamptz default now()
);

-- PERSONAL DE LA EMPRESA (en relación de dependencia, no tercerizado)
create table personal_empresa (
  id         uuid primary key default gen_random_uuid(),
  nombre     text not null,
  rol        text,
  telefono   text,
  created_at timestamptz default now()
);

-- PAGOS A PERSONAL — obra OPCIONAL: hay personal con sueldo fijo sin
-- ligar a ninguna obra puntual (ej. redes/IT), y otro que cobra por obra
-- (ej. arquitecto, chofer). Sin presupuesto/cuenta corriente: es solo
-- historial. "motivo" es OBLIGATORIO (ex "observaciones") — todo pago
-- queda con una razón asentada.
create table pagos_personal (
  id          uuid primary key default gen_random_uuid(),
  personal_id uuid not null references personal_empresa(id) on delete cascade,
  obra_id     uuid references obras(id) on delete cascade,
  monto       numeric(12,2) not null,
  fecha       date not null default current_date,
  motivo      text not null,
  created_at  timestamptz default now()
);

-- PERSONAL TERCERIZADO — mano de obra subcontratada (Marcelo/cuadrilla de
-- albañilería, Clisman/herrería). Concepto DISTINTO de proveedores, sin
-- relación en la base. Rodri le paga un monto global a esta persona por
-- el trabajo hecho en una obra puntual; ella reparte puertas adentro con
-- su gente si aplica — no se trackea a cada trabajador individual.
create table personal_tercerizado (
  id         uuid primary key default gen_random_uuid(),
  nombre     text not null,
  oficio     text,
  telefono   text,
  created_at timestamptz default now()
);

-- PAGOS A PERSONAL TERCERIZADO — a diferencia de pagos_personal, acá la
-- obra es SIEMPRE obligatoria (se cobra por trabajo hecho en una obra
-- puntual, nunca un sueldo fijo). Sin presupuesto/cuenta corriente,
-- "motivo" obligatorio, mismo criterio que pagos_personal.
create table pagos_personal_tercerizado (
  id                      uuid primary key default gen_random_uuid(),
  personal_tercerizado_id uuid not null references personal_tercerizado(id) on delete cascade,
  obra_id                 uuid not null references obras(id) on delete cascade,
  monto                   numeric(12,2) not null,
  fecha                   date not null default current_date,
  motivo                  text not null,
  created_at              timestamptz default now()
);

-- GASTOS DE LA EMPRESA — sin obra_id. Únicos gastos que no pertenecen a
-- ninguna obra puntual (alquiler, impuestos, contador, etc.).
create table gastos_empresa (
  id            uuid primary key default gen_random_uuid(),
  concepto      text not null,
  monto         numeric(12,2) not null,
  fecha         date not null default current_date,
  observaciones text,
  created_at    timestamptz default now()
);
```

---

## Seguridad — estado real

1. **RLS (Row Level Security) — verificado.** Prendido en todas las
   tablas, política `to public using (auth.role() = 'authenticated')` en
   cada una. Confirmado con consultas directas a
   `pg_tables`/`pg_policies` y con un pedido HTTP real sin sesión
   (devuelve vacío). El bucket de Storage `fotos-obra` es privado, sin
   acceso público.
2. **Protección de rutas — `proxy.ts`** (no `middleware.ts`): bloquea todo
   excepto `/login` y assets estáticos/PWA, usa `createServerClient` de
   `@supabase/ssr`. Además, **cada ruta de API vuelve a chequear la
   sesión por su cuenta** (`requireUser()` en `lib/api/helpers.ts`) — no
   depende solo del proxy.
3. **Validación server-side con Zod** en toda ruta de API antes de tocar
   Supabase. Ver `lib/validations/*.ts`, un schema por entidad.
4. **Errores**: nunca se devuelve el mensaje crudo de Postgres al
   cliente. `supabaseErrorResponse(error)` en `lib/api/helpers.ts` loguea
   el error real en el servidor y responde un mensaje genérico.
5. **Fotos con URLs firmadas**, expiran en 1 hora
   (`supabase.storage.from('fotos-obra').createSignedUrl(path, 3600)`).
6. **Headers de seguridad HTTP** en `next.config.ts`:
   `Content-Security-Policy`, `Strict-Transport-Security`,
   `Permissions-Policy`. El CSP permite `unsafe-eval` solo en desarrollo
   (lo necesita el hot-reload de Turbopack).
7. **Variables de entorno** (`.env.local`, nunca commitear):
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY` (esta última no se usa en ningún lado del
   código actual).
8. **Dependencias**: 0 vulnerabilidades conocidas (`npm audit`).

---

## Lógica de balance — el corazón del sistema (`lib/utils/balance.ts`)

Cubierto por tests automatizados (`lib/utils/balance.test.ts`, ver
`lib/utils/README.md`) — es la lógica que más cambió de comportamiento en
este proyecto, tratarla con cuidado extra.

**Cambio importante (Fase 3, Bloque 5):** hasta antes de esto,
`total_gastos_generales` era puramente informativo y NO restaba del
`resultado`. Rodri confirmó que el presupuesto aprobado ya contempla los
gastos generales de la obra, así que ahora SÍ restan — ver el historial
de módulos si hace falta el detalle de por qué cambió dos veces.

**Cambio (cierra el pendiente anterior):** Rodri confirmó que pagarle a
personal tercerizado (Marcelo, Clisman) o a personal propio POR una obra
puntual (ej. Manu como chofer de esa obra) es, para él, costo directo de
la obra — no una categoría aparte. `total_mano_obra` y `total_personal`
dejaron de ser campos/líneas separados: ahora se suman DENTRO de
`total_costos_directos`. El monto total de `total_egresos` no cambió por
esto — es pura reagrupación de cómo se presenta el mismo número.

### Balance por obra

`gastos_generales` (la tabla) contiene DOS conceptos distintos, separados
únicamente por el texto de `concepto` contra la lista
`CONCEPTOS_COSTOS_DIRECTOS` en `lib/constantes.ts`:

```
total_presupuestado      = SUM(presupuesto_items.monto) WHERE obra_id = X
total_ingresos           = SUM(pagos_clientes.monto) WHERE obra_id = X

costos_directos_manual   = SUM(gastos_generales.monto) WHERE obra_id = X
                           AND concepto IN CONCEPTOS_COSTOS_DIRECTOS
                           -- "Movimiento de suelo", "Mano de obra" (carga
                           -- manual/legacy), "Instalación eléctrica"
total_gastos_generales   = SUM(gastos_generales.monto) WHERE obra_id = X
                           AND concepto NOT IN CONCEPTOS_COSTOS_DIRECTOS
                           -- "Combustible", "Seguros vehículos/personal" —
                           -- overhead/indirecto
mano_obra_tercerizada    = SUM(pagos_personal_tercerizado.monto) WHERE obra_id = X
personal_en_esta_obra    = SUM(pagos_personal.monto) WHERE obra_id = X
                           -- los que NO tienen obra_id (sueldos fijos) no
                           -- entran acá, se restan a nivel empresa, ver
                           -- más abajo

total_costos_directos    = costos_directos_manual
                           + mano_obra_tercerizada
                           + personal_en_esta_obra
                           -- UN SOLO número — no se desglosa "mano de
                           -- obra tercerizada" ni "personal" aparte,
                           -- decisión explícita de Rodri

total_egresos            = total_costos_directos
                           + SUM(gastos_materiales.monto) WHERE obra_id = X
                           + total_gastos_generales

resultado                 = total_ingresos - total_egresos
diferencia_vs_presupuesto = resultado - total_presupuestado
-- (este campo se calcula pero hoy no se muestra en ninguna pantalla)
```

`total_costos_directos` y `total_gastos_generales` también se muestran
desglosados aparte en la UI (para que Rodri vea de dónde sale el
número), pero ya están INCLUIDOS dentro de `total_egresos` — no hay que
sumarlos de nuevo en el frontend. `resultado` es un flujo de caja parcial
a la fecha (cobrado menos gastado hasta ahora), no la ganancia final.

### Balance general de la empresa

```
total_ingresos_empresa         = SUM de total_ingresos de TODAS las obras
total_egresos_empresa          = SUM de total_egresos de TODAS las obras
total_gastos_generales_empresa = SUM de total_gastos_generales de TODAS las
                                  obras (informativo, ya incluido arriba)
total_gastos_empresa           = SUM(gastos_empresa.monto)
                                  -- alquiler, impuestos, contador, etc.
total_personal_sin_obra        = SUM(pagos_personal.monto) WHERE obra_id IS NULL
                                  -- sueldos fijos sin ligar a ninguna obra
                                  -- puntual (ej. redes/IT)

resultado_empresa = total_ingresos_empresa - total_egresos_empresa
                     - total_gastos_empresa - total_personal_sin_obra
```

`total_gastos_empresa` y `total_personal_sin_obra` son los ÚNICOS montos
que se restan a nivel empresa sin pasar por ninguna obra puntual — todo
lo demás ya se agregó obra por obra. Los cálculos son funciones puras en
`lib/utils/balance.ts`, se llaman desde `app/api/balance/route.ts` y
`app/api/obras/[id]/balance/route.ts` — nunca se recalculan en el
frontend (los componentes usan directamente `balance.resultado`).

---

## UI/UX — decisiones tomadas

- Bottom nav (mobile) y Sidebar (desktop) con 5 accesos: Dashboard,
  Obras, Clientes, Personal, Finanzas. Los últimos 2 son páginas "hub"
  (`/personal-hub`, `/finanzas`) con 2 cards cada una — 5-6 destinos
  reales sin superar el límite cómodo de íconos en una bottom nav
  mobile (ver `components/layout/README.md`).
- Sin FAB (botón flotante) — se usa un botón "+ Nueva/Nuevo" fijo arriba
  de cada lista.
- Tipografía mínima 16px en inputs (evita zoom automático en iOS).
- Toasts propios para feedback de éxito/error, skeletons en listas,
  estados vacíos con call-to-action.
- **Tema oscuro fijo**, con el logo y la paleta de colores reales de la
  marca de Zenit DC — sin selector claro/oscuro.
- Hero del dashboard con un brillo radial suave (`bg-hero-glow`), no una
  grilla de líneas (se veía "genérico de IA").
- `color-scheme: dark` global para que los `<select>` nativos no se vean
  con fondo blanco al elegir una opción ya guardada (bug de Chrome en
  Windows que ignora el tema de la página en controles nativos).
- Selector de fecha propio (`FechaInput.tsx`) en los 6 campos de fecha —
  el `<input type="date">` nativo no se puede forzar a dd/mm/aaaa de
  forma confiable (depende del idioma del navegador/SO).
- Modal de confirmación propio (`useConfirm.tsx`) en vez de `confirm()`
  nativo, en los 8 sitios que confirman una eliminación.
- Lightbox de fotos: click en una miniatura abre la imagen completa.

---

## Despliegue y servicios necesarios

Las cuentas van a nombre del cliente (Zenit DC / Rodri), no del
desarrollador — así el cliente es dueño de su propio despliegue.

| Servicio | Para qué | Plan que alcanza hoy | Cuándo hace falta más |
|---|---|---|---|
| **Vercel** | Hostea el frontend + las rutas de API | Hobby (gratis) | Soporte comercial/SLA → Plan Pro (~USD 20/mes). |
| **Supabase** | Base de datos, Auth, Storage de fotos | Free (500MB DB, 1GB storage, 50k auth/mes) | Más volumen o backups automáticos (Free no tiene ninguno) → Plan Pro (~USD 25/mes, backups diarios 7 días). |
| **Dominio propio** | Imagen profesional (ej. zenitdc.com.ar) | — | Opcional, ~USD 10-15/año. |

**Limitación real:** en el plan Free de Supabase, el proyecto se pausa
tras 1 semana sin uso — hay que "despertarlo" a mano si eso pasa.

---

## Limitaciones conocidas / a evaluar a futuro

No son errores — son trade-offs conscientes, correctos para el tamaño y
la naturaleza actual del proyecto (ver "Naturaleza real del sistema"
arriba). Se están cerrando de a poco (ver "Skills del proyecto" — tests y
CI ya se resolvieron en la ronda de infraestructura agéntica):

1. ~~Sin tests automatizados ni CI~~ → resuelto para `balance.ts` +
   GitHub Actions. El resto del código sigue sin cobertura de tests
   (verificación manual con `tsc`/`build`/`lint`), correcto para el
   tamaño actual del proyecto.
2. **Sin monitoreo/alertas en producción** (no hay Sentry, Vercel
   Analytics). No urgente dado que el sistema no procesa pagos ni nada
   crítico.
3. **Modelo de acceso "todo o nada"** — sin roles ni permisos por
   usuario. Revisar antes de dar de alta un segundo usuario.
4. **El plan Free de Supabase no tiene backups automáticos.** Riesgo
   concreto: `obras` tiene `on delete cascade` hacia
   presupuesto/pagos/gastos/fotos — borrar una obra por error se lleva
   todo su historial financiero. Mitigación gratuita: correr
   `supabase db dump` manualmente cada tanto.

---

## Escalabilidad — qué vigilar si crece el uso

No urgente hoy (bajo volumen, un solo usuario).

**No es un problema:** la base de datos en sí — se mantiene muy por
debajo de los 500MB del plan Free incluso con cientos de obras.

**Lo que sí puede jugar en contra:**
- **Storage de fotos (1GB en Free).** Cada foto hasta 5MB
  (`MAX_FOTO_BYTES` en `lib/validations/fotos.ts`), sin comprimir ni
  redimensionar. Unos cientos de fotos llenan el 1GB.
- **Egress (5GB/mes en Free).** Cada apertura de la galería redescarga
  las imágenes completas, sin caché ni miniaturas.
- ~~`getBalanceGeneral()` hacía 6 consultas por cada obra~~ → resuelto:
  ahora agrupa en memoria, son 8 consultas totales sin importar cuántas
  obras haya (ver `lib/utils/README.md`).
- **Listas de Obras/Clientes sin paginar.**

**Mejoras futuras, en orden de impacto/costo (ninguna necesaria hoy):**
comprimir fotos antes de subir → paginar listas + agregar consultas de
balance → Supabase Pro si el volumen lo justifica.

---

## Skills del proyecto (`.claude/skills/`)

- **`verificar-y-mergear`**: el flujo de git que se usa en TODO este
  proyecto — rama desde `develop`, implementar, `tsc`+`build`+`lint`,
  commit, push, merge `--no-ff` a `develop`, verificar de nuevo, push.
  Usarla en cada cambio, por chico que sea.
- **`scaffold-entidad`**: genera tabla SQL (con RLS) + schema Zod + ruta
  de API + formulario + página de listado para una entidad nueva,
  siguiendo el patrón de `clientes`/`obras`. Usarla al agregar cualquier
  entidad CRUD nueva (así se armaron proveedores y personal en la Fase 3).

---

## Historial de módulos

```
1. Setup (Next.js + Supabase + Tailwind + PWA config + proxy auth)       ✅
2. Login con Supabase Auth                                              ✅
3. Módulo Clientes (CRUD completo)                                      ✅
4. Módulo Obras (CRUD + vinculación a cliente)                          ✅
5. Presupuesto por rubros                                               ✅
6. Pagos de clientes                                                    ✅
7. Pagos a proveedores (versión vieja)                                  ❌ removido del alcance
8. Gastos de materiales                                                 ✅
9. Gastos generales (por obra)                                         ✅
10. Galería de fotos (Supabase Storage)                                 ✅
11. Balance por obra                                                    ✅
12. Balance general empresa                                             ✅
13. PWA manifest + service worker + íconos                              ✅
14. Deploy en Vercel + Supabase producción                              ✅
15. Navegación persistente, toasts, skeletons, rediseño dashboard        ✅
16. Auditoría de seguridad/calidad + limpieza de git                    ✅
17. Separación costos directos / gastos generales en el balance         ✅
18. Tema oscuro, selector de fecha propio, modal de confirmación,
    lightbox de fotos                                                   ✅
19. Infraestructura de desarrollo agéntico (CLAUDE.md, READMEs,
    skills, tests, CI)                                                  ✅
20. Fase 3 — campos nuevos (CUIT/email, dirección, estados de obra,
    cobros por etapa), proveedores, empleados tercerizados, mano de
    obra tercerizada (presupuesto + pagos), personal de la empresa,
    gastos de empresa, e integración de todo al cálculo de balance     ✅
21. Correcciones post-Fase-3: bloqueo de borrado en cascada silencioso
    (proveedores/personal), helpers compartidos (sumMonto, parsearMonto,
    hasRelatedRows), getBalanceGeneral sin 6N+1 consultas               ✅
22. Personal tercerizado separado de Proveedores: se elimina el modelo
    viejo de mano de obra tercerizada (presupuesto_mano_obra,
    pagos_mano_obra, empleados_tercerizados) y se reemplaza por una
    entidad propia en paralelo a Personal de la empresa. Obra pasa a ser
    opcional en pagos_personal (sueldos fijos sin obra puntual) y
    obligatoria en pagos_personal_tercerizado. "Motivo" reemplaza a
    "observaciones" en ambos, obligatorio. Se simplifica el detalle de
    obra sacando esas dos cards                                        ✅ (este cambio)
```

---

*Proyecto: Zenit DC — nquirogawebdev — actualizado 2026-09-14*
