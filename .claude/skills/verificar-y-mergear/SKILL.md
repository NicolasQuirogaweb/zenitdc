---
name: verificar-y-mergear
description: Flujo de verificación y git usado en todo el proyecto Zenit DC — úsalo para cualquier cambio, por chico que sea, antes de darlo por terminado.
---

# Verificar y mergear (Zenit DC)

Este es el ritual que se sigue para TODO cambio en este repo, sin
excepciones, desde el primer commit del proyecto.

## 1. Rama nueva desde `develop`

```bash
git status --porcelain   # confirmar árbol de trabajo limpio
git checkout develop
git pull origin develop
git checkout -b <tipo>/<nombre-descriptivo>
```

`<tipo>` es `feature/` para algo nuevo, `fix/` para una corrección,
`chore/` para infraestructura/tooling (docs, CI, skills). El nombre
describe el cambio en pocas palabras, en español, con guiones (ej.
`feature/proveedores`, `fix/balance-mano-de-obra`).

## 2. Implementar

Seguir las convenciones de `CLAUDE.md` y del `README.md` de la carpeta
que se está tocando. Priorizar cambios chicos y de bajo riesgo — este es
un MVP en uso real, no una reescritura.

## 3. Verificar (siempre, antes de commitear)

```bash
npx tsc --noEmit
npm run build
npm run lint
npm run test
```

Los cuatro tienen que pasar limpios. Si `lint` muestra problemas
preexistentes (hoy hay una lista conocida de warnings/errores menores sin
resolver), confirmar que el conteo no aumentó — no hace falta arreglar
lo que ya estaba, pero tampoco sumar nada nuevo.

## 4. Commit

En Windows, los heredoc de bash para mensajes multilínea son poco
confiables — escribir el mensaje a un archivo temporal (en el directorio
de scratchpad) y commitear con `-F`:

```bash
git add <archivos específicos, nunca -A a ciegas>
git commit -F <ruta al archivo del mensaje>
```

Terminar el mensaje con la línea de atribución que pida el sistema en
ese momento (hoy: `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`).

## 5. Push y merge

```bash
git push -u origin <nombre-de-la-rama>
git checkout develop
git pull origin develop
git merge --no-ff <nombre-de-la-rama> -F <archivo con el mensaje del merge>
```

Volver a correr los 4 comandos de verificación del paso 3 **sobre
`develop` después del merge** — un merge puede introducir conflictos o
romper algo que cada rama por separado no mostraba.

```bash
git push origin develop
```

No se borran las ramas viejas automáticamente — quedan como registro
hasta que se pida una limpieza explícita.

## Cuándo NO seguir este flujo al pie de la letra

Si el usuario pide explícitamente "commiteá directo a develop" para un
cambio mínimo y ya está parado ahí, no hace falta crear una rama — pero
la verificación (paso 3) sigue siendo obligatoria siempre.
