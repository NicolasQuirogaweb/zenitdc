---
name: deploy-produccion
description: Deployar o actualizar producción en Vercel desde cero, usando un token (no el dashboard). Usar cuando el usuario pide llevar el proyecto a producción, crear el proyecto en Vercel, o diagnosticar por qué un deploy falló.
---

# Deploy a producción (Zenit DC / Vercel)

El acceso a Vercel desde Claude Code en una sesión no-interactiva se
resuelve con un **token personal**, no con el MCP de Vercel (requiere
login interactivo por navegador, no disponible acá).

## 1. Conseguir el token

Pedirle al usuario que genere uno en **vercel.com/account/tokens**
("Create Token", expiración corta tipo 7 días). Guardarlo en un archivo
**fuera del repo**, en el scratchpad — nunca en `.env*` ni en ningún
archivo que se commitee:

```bash
printf '%s' '<token pegado por el usuario>' > "<scratchpad>/.vercel_token"
```

Usarlo siempre como `--token="$(cat "<scratchpad>/.vercel_token")"` en
cada comando, nunca pegado literal en el comando (para no dejarlo en el
historial de la terminal más de lo necesario). Al terminar, recordarle
al usuario borrar el token desde el dashboard.

## 2. Instalar la CLI si no está

```bash
npm i -g vercel
vercel --token="$TOKEN" whoami   # confirma que el token funciona
```

(El CLI tira un error no-fatal de telemetría/"Failed to spawn get latest
worker" en Windows — ignorar, el resultado real sigue abajo con exit
code 0.)

## 3. Crear o linkear el proyecto

```bash
vercel --token="$TOKEN" link --yes --project <nombre>
```

Si el directorio tiene un remoto de git de GitHub, Vercel lo detecta y
conecta el repo solo. Esto crea `.vercel/` y agrega un
`VERCEL_OIDC_TOKEN` a `.env.local` — confirmar que ambos ya estén en
`.gitignore` (deberían, `.vercel` y `.env*` son ignorados por defecto en
este proyecto) y que `git status` quede limpio después.

## 4. La rama de producción — lo que NO se puede hacer por API

Vercel asume como "Production Branch" la rama default del repo de
GitHub (normalmente `main`). **El campo `productionBranch` no es
editable por la API pública** — solo aparece en respuestas de lectura
(`GET /v9/projects/:id`), nunca en el schema de `PATCH
/v9/projects/:id` (confirmado contra el OpenAPI spec de Vercel). Cambiar
esto a mano requiere entrar al dashboard (Settings → Git → Production
Branch).

**La solución sin dashboard**: si el trabajo real vive en otra rama
(ej. `develop`) y `main` quedó atrás, en vez de pelear con la API
simplemente mantener `main` al día con fast-forward antes de cada
deploy:

```bash
git fetch origin
git checkout main
git merge --ff-only develop   # falla si no es fast-forward -- revisar antes de forzar nada
git push origin main          # dispara el deploy automático si el repo está conectado
git checkout develop          # volver a la rama de trabajo de siempre
```

## 5. Variables de entorno (sin prompts interactivos)

```bash
vercel --token="$TOKEN" env add NOMBRE_VAR production --type config --value "<valor>" --yes
```

Usar `--type config` para las que son públicas (`NEXT_PUBLIC_*`, el
anon key de Supabase incluido — está diseñado para exponerse, protegido
por RLS) y pensar dos veces antes de subir algo que debería ser
`secret`. El warning de "esto se puede revelar después de guardarlo" es
esperado para `config`, no es un error.

**Importante**: si el primer deploy (disparado por el push del paso 4)
corrió ANTES de cargar las env vars, va a fallar en build
(`createClient()` tira porque faltan las vars). Hay que volver a
deployar después de cargarlas — ver paso 6.

## 6. Deploy manual / redeploy

```bash
vercel --token="$TOKEN" deploy --prod --yes
```

Devuelve JSON con `readyState` y la URL de producción
(`productionUrl`). Confirmar `"readyState": "READY"`.

## 7. Verificar sin el dashboard

```bash
curl -s -o /dev/null -w "HTTP %{http_code}\n" --max-time 10 <url>
curl -s -D - -o /dev/null --max-time 10 <url> | grep -i "location\|^HTTP"
curl -s -o /dev/null -w "HTTP %{http_code}\n" --max-time 10 <url>/manifest.json
curl -s -o /dev/null -w "HTTP %{http_code}\n" --max-time 10 <url>/sw.js
```

Si da un 307/redirect a `/login`, chequear el HTML de esa página (no
solo el código) para confirmar que es el login real de la app y no un
muro de autenticación de Vercel — el campo `deploymentProtection` que
devuelve el `deploy --prod` puede aparecer igual sin que bloquee de
verdad el acceso público (confirmar siempre con el contenido real, no
solo con ese campo).

También confirmar que Supabase no esté pausado (ver
`levantar-servidor-dev`): un `curl` a
`https://<proyecto>.supabase.co/auth/v1/health` que devuelve 401 rápido
está bien (responde, solo falta la API key); si tarda ~25s o falla por
DNS, está pausado.

## 8. A futuro: migrar a la cuenta del cliente

Las cuentas de infraestructura van a nombre del cliente, no del
desarrollador (ver "Despliegue y servicios necesarios" en `CLAUDE.md`).
Mientras el proyecto está en etapa de prueba/beta es razonable tenerlo
en la cuenta de Vercel del desarrollador; cuando pase a uso real, Vercel
permite "Transfer Project" a otra cuenta sin perder el historial de
deploys ni las env vars — el único paso manual extra es reconectar el
acceso al repo de GitHub del lado de la cuenta nueva.
