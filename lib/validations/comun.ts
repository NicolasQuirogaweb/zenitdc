import { z } from 'zod'

/**
 * Fragmentos de Zod repetidos en casi todos los schemas de "movimiento"
 * (pagos, gastos): un monto positivo, una fecha en formato ISO (yyyy-mm-dd,
 * el que usa <input type="date"> y FechaInput por debajo) y observaciones
 * libres opcionales. Componer con `.extend()` en vez de retipearlos.
 */
export const montoPositivo = z.number().positive('El monto debe ser mayor a 0')
export const fechaISO = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida')
export const observacionesOpcionales = z.string().max(500).nullable().optional()

/**
 * Motivo de un pago a una persona (personal de la empresa o tercerizado)
 * — a diferencia de `observacionesOpcionales`, este es OBLIGATORIO: todo
 * pago a una persona tiene que quedar con una razón asentada (ej. "sueldo
 * septiembre", "viáticos", "pago obra Casa Pérez").
 */
export const motivoPago = z.string().min(1, 'El motivo es obligatorio').max(500)
