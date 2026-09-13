# components/layout

Navegación persistente de la app.

- **`AppShell.tsx`** — decide si mostrar la navegación según la ruta
  actual (no se muestra en `/login`, por ejemplo). Envuelve a
  `{children}` en `app/layout.tsx`.
- **`Sidebar.tsx`** — navegación en desktop (fija a la izquierda).
- **`BottomNav.tsx`** — navegación en mobile (fija abajo). Hoy tiene 4
  accesos: Dashboard, Clientes, Obras, Balance — si se agregan secciones
  nuevas de nivel superior (ver Fase 3: Proveedores, Personal, Gastos de
  empresa), hay que decidir si entran acá o quedan accesibles desde
  Dashboard/un submenú, porque 4-5 íconos es más o menos el límite
  cómodo para una bottom nav en mobile.
- **`nav-items.ts`** — la lista de accesos que consumen tanto `Sidebar`
  como `BottomNav`, para no duplicar la lista en los dos componentes.
