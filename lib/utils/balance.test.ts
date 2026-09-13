import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getBalanceObra, getBalanceGeneral } from './balance'

type FilaGenerica = { monto: number; concepto?: string }

interface Fixtures {
  obras?: Array<{ id: string; nombre: string; clientes: { nombre: string } | null }>
  porObra: Record<
    string,
    {
      presupuesto_items?: FilaGenerica[]
      pagos_clientes?: FilaGenerica[]
      gastos_generales?: FilaGenerica[]
      gastos_materiales?: FilaGenerica[]
    }
  >
}

function crearSupabaseMock(fixtures: Fixtures) {
  return {
    from(tabla: string) {
      let obraId: string | undefined
      const chain: {
        select: () => typeof chain
        eq: (columna: string, valor: string) => typeof chain
        order: () => typeof chain
        then: (resolve: (r: { data: unknown[]; error: null }) => void) => void
      } = {
        select: () => chain,
        eq: (columna: string, valor: string) => {
          if (columna === 'obra_id') obraId = valor
          return chain
        },
        order: () => chain,
        then: (resolve) => {
          if (tabla === 'obras') {
            resolve({ data: fixtures.obras ?? [], error: null })
            return
          }
          const datosObra = obraId ? fixtures.porObra[obraId] : undefined
          const filas = datosObra ? (datosObra as Record<string, unknown[]>)[tabla] : undefined
          resolve({ data: filas ?? [], error: null })
        },
      }
      return chain
    },
  }
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@/lib/supabase/server'

function mockearSupabase(fixtures: Fixtures) {
  vi.mocked(createClient).mockResolvedValue(
    crearSupabaseMock(fixtures) as unknown as Awaited<ReturnType<typeof createClient>>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getBalanceObra', () => {
  it('separa costos directos de gastos generales, y estos últimos no restan del resultado', async () => {
    mockearSupabase({
      porObra: {
        'obra-1': {
          presupuesto_items: [{ monto: 10000 }],
          pagos_clientes: [{ monto: 5000 }, { monto: 2000 }],
          gastos_generales: [
            { concepto: 'Mano de obra', monto: 1000 },
            { concepto: 'Combustible', monto: 300 },
          ],
          gastos_materiales: [{ monto: 500 }],
        },
      },
    })

    const balance = await getBalanceObra('obra-1')

    expect(balance.total_presupuestado).toBe(10000)
    expect(balance.total_ingresos).toBe(7000)
    // costos directos (Mano de obra, 1000) + gastos_materiales (500) = 1500
    expect(balance.total_egresos).toBe(1500)
    // Combustible es indirecto: se informa aparte, no entra en total_egresos
    expect(balance.total_gastos_generales).toBe(300)
    expect(balance.resultado).toBe(7000 - 1500)
    expect(balance.diferencia_vs_presupuesto).toBe(balance.resultado - 10000)
  })

  it('devuelve todo en cero cuando la obra no tiene ningún movimiento cargado', async () => {
    mockearSupabase({ porObra: { 'obra-vacia': {} } })

    const balance = await getBalanceObra('obra-vacia')

    expect(balance).toEqual({
      obra_id: 'obra-vacia',
      total_presupuestado: 0,
      total_ingresos: 0,
      total_egresos: 0,
      total_gastos_generales: 0,
      resultado: 0,
      diferencia_vs_presupuesto: 0,
    })
  })

  it('cuenta como costo directo cualquier concepto de CONCEPTOS_COSTOS_DIRECTOS, no solo "Mano de obra"', async () => {
    mockearSupabase({
      porObra: {
        'obra-2': {
          gastos_generales: [
            { concepto: 'Movimiento de suelo', monto: 200 },
            { concepto: 'Instalación eléctrica', monto: 150 },
            { concepto: 'Seguros vehículos', monto: 80 },
          ],
        },
      },
    })

    const balance = await getBalanceObra('obra-2')

    expect(balance.total_egresos).toBe(350) // 200 + 150, indirectos
    expect(balance.total_gastos_generales).toBe(80)
  })
})

describe('getBalanceGeneral', () => {
  it('agrega el balance de todas las obras y suma los gastos generales aparte, sin restarlos del resultado', async () => {
    mockearSupabase({
      obras: [
        { id: 'obra-1', nombre: 'Casa Pérez', clientes: { nombre: 'Pérez' } },
        { id: 'obra-2', nombre: 'Galpón Gómez', clientes: { nombre: 'Gómez' } },
      ],
      porObra: {
        'obra-1': {
          pagos_clientes: [{ monto: 5000 }],
          gastos_generales: [{ concepto: 'Combustible', monto: 100 }],
        },
        'obra-2': {
          pagos_clientes: [{ monto: 3000 }],
          gastos_materiales: [{ monto: 1000 }],
          gastos_generales: [{ concepto: 'Seguros vehículos', monto: 50 }],
        },
      },
    })

    const balance = await getBalanceGeneral()

    expect(balance.total_ingresos).toBe(8000)
    expect(balance.total_egresos).toBe(1000) // solo gastos_materiales de obra-2, nada es costo directo acá
    expect(balance.total_gastos_generales).toBe(150) // 100 + 50, informativo
    expect(balance.resultado).toBe(8000 - 1000) // gastos generales NO se restan
    expect(balance.por_obra).toHaveLength(2)
    expect(balance.por_obra[0]).toMatchObject({
      obra_id: 'obra-1',
      obra_nombre: 'Casa Pérez',
      cliente_nombre: 'Pérez',
    })
  })

  it('devuelve un balance vacío cuando no hay obras cargadas', async () => {
    mockearSupabase({ obras: [], porObra: {} })

    const balance = await getBalanceGeneral()

    expect(balance.total_ingresos).toBe(0)
    expect(balance.total_egresos).toBe(0)
    expect(balance.total_gastos_generales).toBe(0)
    expect(balance.resultado).toBe(0)
    expect(balance.por_obra).toEqual([])
  })
})
