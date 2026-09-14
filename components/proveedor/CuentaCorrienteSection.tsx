'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatMoney } from '@/lib/utils/formato'
import { sumMonto } from '@/lib/utils/numeros'
import CollapsibleCard from '@/components/ui/CollapsibleCard'

interface Props {
  proveedorId: string
}

export default function CuentaCorrienteSection({ proveedorId }: Props) {
  const [presupuestado, setPresupuestado] = useState(0)
  const [pagado, setPagado] = useState(0)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('presupuesto_mano_obra').select('monto').eq('proveedor_id', proveedorId),
      supabase.from('pagos_mano_obra').select('monto').eq('proveedor_id', proveedorId),
    ]).then(([presupuestos, pagos]) => {
      setPresupuestado(sumMonto(presupuestos.data))
      setPagado(sumMonto(pagos.data))
      setCargando(false)
    })
  }, [proveedorId])

  const saldo = presupuestado - pagado

  return (
    <CollapsibleCard
      titulo="Cuenta corriente"
      subtitulo="Acumulado de mano de obra tercerizada en todas las obras"
    >
      {cargando ? (
        <p className="mt-3 text-sm text-[color:var(--color-text-secondary)]">Cargando...</p>
      ) : (
        <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
          <div>
            <p className="text-xs text-[color:var(--color-text-muted)]">Presupuestado</p>
            <p className="font-medium text-[color:var(--color-text-primary)]">{formatMoney(presupuestado)}</p>
          </div>
          <div>
            <p className="text-xs text-[color:var(--color-text-muted)]">Pagado</p>
            <p className="font-medium text-[color:var(--color-text-primary)]">{formatMoney(pagado)}</p>
          </div>
          <div>
            <p className="text-xs text-[color:var(--color-text-muted)]">Saldo total</p>
            <p className={`font-semibold ${saldo > 0 ? 'text-red-alert' : 'text-green-600'}`}>
              {formatMoney(saldo)}
            </p>
          </div>
        </div>
      )}
    </CollapsibleCard>
  )
}
