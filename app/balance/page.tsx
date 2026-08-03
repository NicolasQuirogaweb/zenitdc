'use client'

import { useEffect, useState } from 'react'
import { formatMoney } from '@/lib/utils/formato'
import type { BalanceGeneral } from '@/types'

export default function BalancePage() {
  const [balance, setBalance] = useState<BalanceGeneral | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/balance')
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
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-slate-500">Cargando...</p>
      </div>
    )
  }

  if (error || !balance) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-800">Balance</h1>
            <a href="/dashboard" className="text-sm text-blue-accent hover:underline">
              Volver
            </a>
          </div>
          <div className="mt-6 rounded-lg bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800">Balance general</h2>
            <p className="mt-3 text-sm text-red-alert">{error || 'No disponible'}</p>
          </div>
        </div>
      </div>
    )
  }

  const resultado = balance.total_ingresos - balance.total_egresos
  const resultadoPositivo = resultado >= 0

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">Balance</h1>
          <a href="/dashboard" className="text-sm text-blue-accent hover:underline">
            Volver
          </a>
        </div>

        <p className="mt-1 text-sm text-slate-500">Resumen financiero de la empresa</p>

        <div className="mt-6 rounded-lg bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Balance general</h2>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Ingresos</p>
              <p className="font-semibold text-green-600">
                {formatMoney(balance.total_ingresos)}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Egresos</p>
              <p className="font-semibold text-slate-800">
                {formatMoney(balance.total_egresos)}
              </p>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-3">
              <p className="font-semibold text-slate-800">Resultado</p>
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

        <p className="mt-3 text-xs text-slate-400">
          El resultado incluye ingresos y egresos de todas las obras y los gastos generales.
        </p>
      </div>
    </div>
  )
}