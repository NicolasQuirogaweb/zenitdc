# components/layout

Navegación persistente de la app.

- **`AppShell.tsx`** — decide si mostrar la navegación según la ruta
  actual (no se muestra en `/login`, por ejemplo). Envuelve a
  `{children}` en `app/layout.tsx`.
- **`Sidebar.tsx`** — navegación en desktop (fija a la izquierda).
- **`BottomNav.tsx`** — navegación en mobile (fija abajo). Tiene 5
  accesos: Dashboard, Obras, Clientes, Personal, Finanzas — 5 es más o
  menos el límite cómodo para una bottom nav en mobile, así que
  "Personal" y "Finanzas" son accesos a páginas **hub**
  (`app/personal-hub/page.tsx`, `app/finanzas/page.tsx`): una pantalla
  chica con 2 cards cada una (mismo patrón visual que el dashboard) en
  vez de ir directo a una sola sección. Si en el futuro hace falta un
  acceso de nivel superior más, primero evaluar si entra dentro de un
  hub existente o si amerita agrandar el hub del dashboard en vez de
  sumar un sexto ícono acá.
- **`nav-items.ts`** — la lista de accesos que consumen tanto `Sidebar`
  como `BottomNav`, para no duplicar la lista en los dos componentes.
  Cada ítem puede tener `matchPrefixes` (además del `href` al que
  navega) para que se siga marcando "activo" al entrar a una de las
  páginas reales del hub (ej. `/personal/[id]` sigue resaltando
  "Personal"), no solo al estar parado en la pantalla hub. La función
  `esRutaActiva(pathname, item)` (mismo archivo) centraliza esa lógica —
  la usan tanto `Sidebar` como `BottomNav`.
