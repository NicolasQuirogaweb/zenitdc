# components/forms

Formularios completos de alta/edición, uno por entidad principal
(`ClienteForm.tsx`, `ObraForm.tsx`). Todos siguen el mismo patrón:

- `react-hook-form` para el estado del formulario.
- `zodResolver` con el schema correspondiente de `lib/validations/` — la
  misma validación (o una espejada) se vuelve a correr en el servidor,
  nunca se confía solo en la del cliente.
- Reciben `defaultValues` (para edición) y un `onSubmit` async por
  props — el formulario no sabe si está creando o editando, ni a qué
  ruta de API le va a pegar; eso lo decide la página que lo usa
  (`app/clientes/nuevo/page.tsx` vs `app/clientes/[id]/editar/page.tsx`,
  por ejemplo).
- Los campos de fecha usan `FechaInput` (ver `components/ui/README.md`),
  nunca `<input type="date">` nativo.

Al agregar un formulario nuevo (ver skill `scaffold-entidad`), seguir
este mismo patrón en vez de inventar uno distinto.
