'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatMoney, formatFecha } from '@/lib/utils/formato'
import CollapsibleCard from '@/components/ui/CollapsibleCard'
import type { PagoPersonal } from '@/types'

interface Props {
  personalId: string
}

interface PagoConObra extends PagoPersonal {
  obras: { nombre: string } | null
}

export default function HistorialPagosSection({ personalId }: Props) {
  const [pagos, setPagos] = useState<PagoConObra[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('pagos_personal')
      .select('*, obras(nombre)')
      .eq('personal_id', personalId)
      .order('fecha', { ascending: false })
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setPagos(data as unknown as PagoConObra[])
        setCargando(false)
      })
  }, [personalId])

  const totalPagado = pagos.reduce((s, p) => s + Number(p.monto), 0)

  return (
    <CollapsibleCard
      titulo="Historial de pagos"
      subtitulo="Pagos registrados a este empleado en todas las obras"
    >
      {cargando ? (
        <p className="mt-3 text-sm text-[color:var(--color-text-secondary)]">Cargando...</p>
      ) : (
        <>
          <div className="mt-3">
            <p className="text-xs text-[color:var(--color-text-muted)]">Total pagado</p>
            <p className="font-semibold text-[color:var(--color-text-primary)]">{formatMoney(totalPagado)}</p>
          </div>

          <div className="mt-4 divide-y divide-[color:var(--color-border)]">
            {pagos.length === 0 ? (
              <p className="py-3 text-sm text-[color:var(--color-text-secondary)]">No hay pagos registrados aún</p>
            ) : (
              pagos.map((pago) => (
                <div key={pago.id} className="py-2">
                  <p className="font-medium text-[color:var(--color-text-primary)]">
                    {formatMoney(Number(pago.monto))}
                  </p>
                  <p className="text-sm text-[color:var(--color-text-secondary)]">
                    {formatFecha(pago.fecha)} · {pago.obras?.nombre ?? 'Obra'}
                  </p>
                  {pago.observaciones && (
                    <p className="text-xs text-[color:var(--color-text-muted)]">{pago.observaciones}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </CollapsibleCard>
  )
}
