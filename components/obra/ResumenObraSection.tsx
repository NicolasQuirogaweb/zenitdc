'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatMoney } from '@/lib/utils/formato'
import { sumMonto } from '@/lib/utils/numeros'
import { CONCEPTOS_COSTOS_DIRECTOS } from '@/lib/constantes'
import CollapsibleCard from '@/components/ui/CollapsibleCard'

interface Props {
  obraId: string
}

interface FilaMonto {
  monto: number | string
}

interface FilaGastoGeneral extends FilaMonto {
  concepto: string
}

interface Resumen {
  presupuesto: number
  costosDirectos: number
  materiales: number
  gastosGenerales: number
  pagosCliente: number
}

const RESUMEN_VACIO: Resumen = {
  presupuesto: 0,
  costosDirectos: 0,
  materiales: 0,
  gastosGenerales: 0,
  pagosCliente: 0,
}

export default function ResumenObraSection({ obraId }: Props) {
  const [resumen, setResumen] = useState<Resumen>(RESUMEN_VACIO)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('presupuesto_items').select('monto').eq('obra_id', obraId),
      supabase.from('pagos_clientes').select('monto').eq('obra_id', obraId),
      supabase.from('gastos_generales').select('concepto, monto').eq('obra_id', obraId),
      supabase.from('gastos_materiales').select('monto').eq('obra_id', obraId),
      supabase.from('pagos_personal_tercerizado').select('monto').eq('obra_id', obraId),
      supabase.from('pagos_personal').select('monto').eq('obra_id', obraId),
    ]).then(
      ([
        presupuesto,
        pagosCliente,
        gastosGenerales,
        gastosMateriales,
        pagosPersonalTercerizado,
        pagosPersonal,
      ]) => {
        const filasGastos = (gastosGenerales.data ?? []) as FilaGastoGeneral[]
        const costosDirectosManual = sumMonto(
          filasGastos.filter((g) => CONCEPTOS_COSTOS_DIRECTOS.includes(g.concepto))
        )
        const gastosGeneralesIndirectos = sumMonto(
          filasGastos.filter((g) => !CONCEPTOS_COSTOS_DIRECTOS.includes(g.concepto))
        )
        // Mano de obra tercerizada y personal pagado EN esta obra se suman
        // dentro de costos directos, mismo criterio que usaba el balance
        // viejo (ver CLAUDE.md) — acá es solo una suma, no hay resta de
        // ingresos ni "resultado".
        const manoObraTercerizada = sumMonto(pagosPersonalTercerizado.data ?? [])
        const personalEnEstaObra = sumMonto(pagosPersonal.data ?? [])

        setResumen({
          presupuesto: sumMonto(presupuesto.data ?? []),
          costosDirectos: costosDirectosManual + manoObraTercerizada + personalEnEstaObra,
          materiales: sumMonto(gastosMateriales.data ?? []),
          gastosGenerales: gastosGeneralesIndirectos,
          pagosCliente: sumMonto(pagosCliente.data ?? []),
        })
        setCargando(false)
      }
    )
  }, [obraId])

  const totalGastado = resumen.costosDirectos + resumen.materiales + resumen.gastosGenerales

  return (
    <CollapsibleCard
      titulo="Resumen de la obra"
      subtitulo="Lo registrado hasta ahora, sumado por categoría"
      abiertoInicial
    >
      {cargando ? (
        <p className="text-sm text-[color:var(--color-text-secondary)]">Cargando...</p>
      ) : (
        <>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <p className="text-[color:var(--color-text-secondary)]">Presupuesto aprobado</p>
              <p className="font-medium text-[color:var(--color-text-primary)]">
                {formatMoney(resumen.presupuesto)}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[color:var(--color-text-secondary)]">Costos directos</p>
              <p className="font-medium text-[color:var(--color-text-primary)]">
                {formatMoney(resumen.costosDirectos)}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[color:var(--color-text-secondary)]">Gastos de materiales</p>
              <p className="font-medium text-[color:var(--color-text-primary)]">
                {formatMoney(resumen.materiales)}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[color:var(--color-text-secondary)]">Gastos generales</p>
              <p className="font-medium text-[color:var(--color-text-primary)]">
                {formatMoney(resumen.gastosGenerales)}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[color:var(--color-text-secondary)]">Pagos del cliente recibidos</p>
              <p className="font-medium text-[color:var(--color-text-primary)]">
                {formatMoney(resumen.pagosCliente)}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-[color:var(--color-border)] pt-3">
            <p className="font-semibold text-[color:var(--color-text-primary)]">Total gastado</p>
            <p className="font-semibold text-[color:var(--color-text-primary)]">
              {formatMoney(totalGastado)}
            </p>
          </div>
        </>
      )}
    </CollapsibleCard>
  )
}
