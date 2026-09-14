import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getBalanceObra, getBalanceGeneral } from './balance'

type FilaGenerica = { monto: number; concepto?: string }

interface Fixtures {
  obras?: Array<{ id: string; nombre: string; clientes: { nombre: string } | null }>
  gastosEmpresa?: FilaGenerica[]
  porObra: Record<
    string,
    {
      presupuesto_items?: FilaGenerica[]
      pagos_clientes?: FilaGenerica[]
      gastos_generales?: FilaGenerica[]
      gastos_materiales?: FilaGenerica[]
      pagos_mano_obra?: FilaGenerica[]
      pagos_personal?: FilaGenerica[]
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
          if (tabla === 'gastos_empresa') {
            resolve({ data: fixtures.gastosEmpresa ?? [], error: null })
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
  it('suma costos directos, gastos de materiales, gastos generales, mano de obra y personal en el total de egresos', async () => {
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
          pagos_mano_obra: [{ monto: 800 }],
          pagos_personal: [{ monto: 200 }],
        },
      },
    })

    const balance = await getBalanceObra('obra-1')

    expect(balance.total_presupuestado).toBe(10000)
    expect(balance.total_ingresos).toBe(7000)
    // costos directos (1000) + materiales (500) + gastos generales (300) + mano de obra (800) + personal (200)
    expect(balance.total_egresos).toBe(2800)
    expect(balance.total_gastos_generales).toBe(300)
    expect(balance.total_mano_obra).toBe(800)
    expect(balance.total_personal).toBe(200)
    expect(balance.resultado).toBe(7000 - 2800)
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
      total_mano_obra: 0,
      total_personal: 0,
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

    // 200 + 150 (costos directos) + 80 (gastos generales, ahora también resta)
    expect(balance.total_egresos).toBe(430)
    expect(balance.total_gastos_generales).toBe(80)
  })
})

describe('getBalanceGeneral', () => {
  it('agrega el balance de todas las obras y resta los gastos de empresa (sin obra) del resultado', async () => {
    mockearSupabase({
      obras: [
        { id: 'obra-1', nombre: 'Casa Pérez', clientes: { nombre: 'Pérez' } },
        { id: 'obra-2', nombre: 'Galpón Gómez', clientes: { nombre: 'Gómez' } },
      ],
      gastosEmpresa: [{ monto: 400 }],
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
    // gastos_materiales (1000) + gastos generales de ambas obras (100 + 50)
    expect(balance.total_egresos).toBe(1150)
    expect(balance.total_gastos_generales).toBe(150)
    expect(balance.total_gastos_empresa).toBe(400)
    expect(balance.resultado).toBe(8000 - 1150 - 400)
    expect(balance.por_obra).toHaveLength(2)
    expect(balance.por_obra[0]).toMatchObject({
      obra_id: 'obra-1',
      obra_nombre: 'Casa Pérez',
      cliente_nombre: 'Pérez',
    })
  })

  it('devuelve un balance vacío cuando no hay obras ni gastos de empresa cargados', async () => {
    mockearSupabase({ obras: [], gastosEmpresa: [], porObra: {} })

    const balance = await getBalanceGeneral()

    expect(balance.total_ingresos).toBe(0)
    expect(balance.total_egresos).toBe(0)
    expect(balance.total_gastos_generales).toBe(0)
    expect(balance.total_gastos_empresa).toBe(0)
    expect(balance.resultado).toBe(0)
    expect(balance.por_obra).toEqual([])
  })
})
