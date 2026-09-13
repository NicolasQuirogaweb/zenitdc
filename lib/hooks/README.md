# lib/hooks

Dos sistemas de overlay propios, sin librerías externas, con el mismo
patrón (Provider de React Context + hook para consumirlo):

- **`useToast.tsx`** — `ToastProvider` + `useToast()`, para feedback de
  éxito/error después de una acción (`showToast('success', '...')`).
  Montado una sola vez en `app/layout.tsx`.
- **`useConfirm.tsx`** — `ConfirmProvider` + `useConfirm()`, un modal de
  confirmación (`await confirm('¿Eliminar...?')`) que reemplaza al
  `confirm()` nativo del navegador en los 8 sitios donde se elimina algo.
  También montado una sola vez en `app/layout.tsx`.

Cualquier overlay global nuevo (no un modal específico de una sola
pantalla) debería seguir este mismo patrón — Provider + hook — en vez de
manejar estado de visibilidad a mano en cada componente que lo necesite.
