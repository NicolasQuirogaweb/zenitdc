# Zenit DC — Sistema de Gestión

Organizador digital para Zenit DC (empresa constructora): clientes,
obras, presupuestos, gastos, personal y pagos, todo en una PWA pensada
para usarse desde el celular.

**La fuente de verdad del proyecto es [`CLAUDE.md`](./CLAUDE.md)** —
ahí está el contexto completo (qué es, cómo está armado, el esquema de
base de datos, decisiones de producto y el historial de todo lo que se
hizo). Cada carpeta de `app/`, `components/` y `lib/` tiene además su
propio `README.md` explicando lo que vive ahí.

**Producción:** https://zenitdc.vercel.app

## Correrlo en local

1. Clonar el repo e instalar dependencias:
   ```bash
   npm install
   ```
2. Crear `.env.local` en la raíz con las credenciales de Supabase:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
3. Levantar el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   Abrir [http://localhost:3000](http://localhost:3000).

## Otros comandos útiles

```bash
npm run build      # build de producción
npm run lint       # ESLint
npm run test       # Vitest
npx tsc --noEmit   # chequeo de tipos
```

## Desarrollo con Claude Code

Este repo usa `CLAUDE.md` + los `README.md` de cada carpeta como
contexto para desarrollo agéntico, y tiene skills en `.claude/skills/`
para los flujos que se repiten (`verificar-y-mergear`, `scaffold-entidad`,
`levantar-servidor-dev`, `deploy-produccion`).
