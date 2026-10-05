# lib/utils

- **`formato.ts`** — `formatMoney` (formato de moneda ARS) y
  `formatFecha` (convierte una fecha ISO `yyyy-mm-dd` a `dd/mm/aaaa` para
  mostrar). Esta es la función que ya deja las fechas guardadas en
  formato argentino en las listas — el formato del *input* al cargar una
  fecha nueva lo resuelve `components/ui/FechaInput.tsx`, no esta
  función.
- **`numeros.ts`** — `sumMonto(rows)` (sumar el campo `monto` de un array
  de filas, usado en el "Total" de cada sección de lista) y
  `parsearMonto(valor, minimo)` (parsear el input de
  texto de un campo monto a un número válido o `null`, con el mismo
  criterio en todos los formularios — evita que cada sección reinvente su
  propia validación de "monto válido" con matices distintos).
