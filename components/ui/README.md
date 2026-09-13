# components/ui

Piezas de interfaz genéricas, sin conocimiento de ninguna entidad de
negocio puntual (no saben qué es una "obra" o un "cliente") — se usan en
toda la app.

- **`FechaInput.tsx`** — selector de fecha propio (calendario
  desplegable, sin librería externa). Existe porque el `<input
  type="date">` nativo muestra el formato según el idioma del
  navegador/SO (a veces mm/dd/aaaa en vez de dd/mm/aaaa) y no hay forma
  confiable de forzarlo. Usa un portal a `document.body` + cálculo de
  posición (`getBoundingClientRect`) para nunca cortarse contra los
  bordes de la pantalla, sin importar dónde esté el campo.
- **`SelectConOpciones.tsx`** — un `<select>` con una lista de opciones
  sugeridas más una opción "Otro" que revela un input de texto libre.
  Se usa para campos como rubro, material o concepto de gasto, donde
  hay valores comunes pero el usuario puede necesitar escribir uno
  distinto.
- **`CollapsibleCard.tsx`** — tarjeta con contenido colapsable/expandible
  (acordeón). Todas las secciones del detalle de obra
  (presupuesto, gastos, pagos, balance) la usan para no mostrar todo
  abierto a la vez en una pantalla que ya tiene mucha información.
- **`EstadoObraBadge.tsx`** — chip de color según el estado de una obra.
- **`LoadingScreen.tsx` / `Skeleton.tsx`** — estados de carga. `Skeleton`
  se usa en listas (clientes, obras) para que la pantalla no salte
  vacía→llena; `LoadingScreen` es un estado de carga de pantalla
  completa para casos puntuales (ej. detalle de una obra que no existe).

Ninguno de estos componentes hace `fetch` ni conoce rutas de API — reciben
todo por props y delegan la lógica de datos a quien los usa.
