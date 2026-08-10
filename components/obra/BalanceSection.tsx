'use client'

import { useEffect, useState } from 'react'
import { formatMoney } from '@/lib/utils/formato'
import type { BalanceObra } from '@/types'

interface Props {
  obraId: string
  refreshKey?: number
}

export default function BalanceSection({ obraId, refreshKey }: Props) {
  const [balance, setBalance] = useState<BalanceObra | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/obras/${obraId}/balance`)
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.total_ingresos === 'number') {
          setBalance(data)
        } else if (typeof data?.error === 'string') {
          setError(data.error)
        }
        setLoading(false)
      })
      .catch(() => {
        setError('Error al cargar el balance')
        setLoading(false)
      })
  }, [obraId, refreshKey])

  if (loading) {
    return (
      <div className="rounded-lg bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">Balance de la obra</h2>
        <p className="mt-3 text-sm text-slate-500">Cargando...</p>
      </div>
    )
  }

  if (error || !balance) {
    return (
      <div className="rounded-lg bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">Balance de la obra</h2>
        <p className="mt-3 text-sm text-red-alert">{error || 'No disponible'}</p>
      </div>
    )
  }

  const resultado = balance.total_ingresos - balance.total_egresos
  const resultadoPositivo = resultado >= 0
  const saldoPendiente = balance.total_presupuestado - balance.total_ingresos
  const saldoPendientePositivo = saldoPendiente > 0

  return (
    <div className="rounded-lg bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800">Balance de la obra</h2>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Presupuesto aprobado</p>
            <p className="text-xs text-slate-400">Monto total aprobado por el cliente, por rubro</p>
          </div>
          <p className="font-semibold text-slate-800">
            {formatMoney(balance.total_presupuestado)}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Pagos del cliente</p>
            <p className="text-xs text-slate-400">Suma de todos los pagos registrados</p>
          </div>
          <p className="font-semibold text-green-600">{formatMoney(balance.total_ingresos)}</p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Saldo pendiente del cliente</p>
            <p className="text-xs text-slate-400">= Presupuesto aprobado − Pagos del cliente</p>
          </div>
          <p
            className={`font-bold ${
              saldoPendientePositivo ? 'text-red-alert' : 'text-green-600'
            }`}
          >
            {formatMoney(saldoPendiente)}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Egresos</p>
            <p className="text-xs text-slate-400">= Gastos generales + Gastos de materiales de la obra</p>
          </div>
          <p className="font-semibold text-slate-800">{formatMoney(balance.total_egresos)}</p>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 pt-3">
          <div>
            <p className="text-sm font-semibold text-slate-800">Resultado</p>
            <p className="text-xs text-slate-400">= Pagos del cliente − Egresos</p>
          </div>
          <p
            className={`font-bold ${
              resultadoPositivo ? 'text-green-600' : 'text-red-alert'
            }`}
          >
            {formatMoney(resultado)}
          </p>
        </div>
      </div>
    </div>
  )
}