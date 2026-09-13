# lib/utils

- **`balance.ts`** — el cálculo de balance, la lógica más importante del
  proyecto (ver la sección "Lógica de balance" en `CLAUDE.md` para la
  fórmula completa y por qué es así). Es la única lógica de negocio del
  proyecto que tiene tests automatizados (`balance.test.ts`, con
  Vitest) — cualquier cambio en el comportamiento de `getBalanceObra` o
  `getBalanceGeneral` debe venir acompañado de un test que lo cubra.
  Estas funciones son puras (reciben datos, devuelven números) y nunca
  se llaman desde el frontend directamente — solo desde las rutas de API
  de balance.
- **`formato.ts`** — `formatMoney` (formato de moneda ARS) y
  `formatFecha` (convierte una fecha ISO `yyyy-mm-dd` a `dd/mm/aaaa` para
  mostrar). Esta es la función que ya deja las fechas guardadas en
  formato argentino en las listas — el formato del *input* al cargar una
  fecha nueva lo resuelve `components/ui/FechaInput.tsx`, no esta
  función.
