---
name: levantar-servidor-dev
description: Levanta (o reinicia) el servidor de desarrollo de Zenit DC en background. Usar cuando el usuario pide "levantame los servidores", al empezar a probar algo en el navegador, o antes de correr `npm run build`/`npm run test` si el dev server ya estaba corriendo.
---

# Levantar el servidor de dev (Zenit DC)

Este proyecto corre en Windows con Git Bash. El dev server (`next dev`
con Turbopack) y `npm run build` **no pueden correr al mismo tiempo**:
ambos escriben a `.next` y se pisan — ya pasó un build real que falló
con un error de tipos corrupto (`.next/dev/types/validator.ts`) solo
por tener el dev server corriendo en paralelo.

## 1. Chequear si ya hay algo en el puerto 3000

```bash
netstat -ano | grep ":3000" | head -3
```

- Si no aparece nada → saltar al paso 3.
- Si aparece un PID pero no responde (`curl` se cuelga o da timeout) →
  es una sesión vieja colgada, matarlo:
  ```bash
  curl -s -o /dev/null -w "HTTP %{http_code}\n" --max-time 5 http://localhost:3000/login
  taskkill //PID <PID> //F
  ```

## 2. Si vas a correr `npm run build` o `npm run test` ahora mismo

Primero matar el proceso del dev server (aunque esté sano) — ver paso 1
— porque si no el build puede fallar con errores de tipos que no son
reales (son del dev server reescribiendo `.next` al mismo tiempo). Después
de verificar, se puede volver a levantar con el paso 3.

## 3. Levantarlo limpio, en background

```bash
cd "<ruta del repo>"
rm -rf .next
nohup npm run dev > "<scratchpad>/dev-server.log" 2>&1 &
disown
sleep 6
cat "<scratchpad>/dev-server.log"
```

Confirmar que el log diga `✓ Ready in ...` (si no, esperar unos segundos
más y volver a leer el log — no hace falta sondear en loop, una sola
relectura alcanza).

## 4. Limpiar el ruido que deja `next dev` en `CLAUDE.md`

`next dev` le vuelve a agregar solo un bloque
`<!-- BEGIN:nextjs-agent-rules -->...<!-- END -->` al final de
`CLAUDE.md` cada vez que arranca. No es un cambio real — limpiarlo
siempre después de levantar el server:

```bash
git status --porcelain      # confirmar que CLAUDE.md es lo único que cambió
git diff --stat CLAUDE.md   # confirmar que es pura adición (+N, -0), no un revert real
git checkout -- CLAUDE.md
```

Si `git diff --stat` muestra algo más que inserciones puras en
`CLAUDE.md`, parar y revisar — podría ser un cambio real que no hay que
descartar.

## Nota sobre Supabase

Si al entrar a la app da "Failed to fetch" o tarda ~25s por request, es
casi siempre que el proyecto de Supabase (plan Free) se pausó por
inactividad — no es un bug del código. Hay que entrar a
supabase.com/dashboard y hacer "Resume project".
