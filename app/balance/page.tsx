'use client'

import { useEffect, useState } from 'react'
import { formatMoney } from '@/lib/utils/formato'
import CollapsibleCard from '@/components/ui/CollapsibleCard'
import LoadingScreen from '@/components/ui/LoadingScreen'
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
    return <LoadingScreen />
  }

  if (error || !balance) {
    return (
      <div className="min-h-screen bg-[color:var(--color-bg-page)] p-4">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-[color:var(--color-text-primary)]">Balance</h1>
            <a href="/dashboard" className="text-sm text-blue-light hover:underline">
              Volver
            </a>
          </div>
          <div className="mt-6 rounded-lg bg-[color:var(--color-bg-surface)] p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-[color:var(--color-text-primary)]">Balance general</h2>
            <p className="mt-3 text-sm text-red-alert">{error || 'No disponible'}</p>
          </div>
        </div>
      </div>
    )
  }

  const resultadoPositivo = balance.resultado >= 0

  return (
    <div className="min-h-screen bg-[color:var(--color-bg-page)] p-4">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[color:var(--color-text-primary)]">Balance</h1>
          <a href="/dashboard" className="text-sm text-blue-light hover:underline">
            Volver
          </a>
        </div>

        <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">Resumen financiero de la empresa</p>

        <div className="mt-6 rounded-lg bg-[color:var(--color-bg-surface)] p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-[color:var(--color-text-primary)]">Balance general</h2>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[color:var(--color-text-secondary)]">Ingresos</p>
              <p className="font-semibold text-green-600">
                {formatMoney(balance.total_ingresos)}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-[color:var(--color-text-secondary)]">Egresos</p>
              <p className="font-semibold text-[color:var(--color-text-primary)]">
                {formatMoney(balance.total_egresos)}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-[color:var(--color-text-secondary)]">Gastos generales</p>
              <p className="font-semibold text-[color:var(--color-text-primary)]">
                {formatMoney(balance.total_gastos_generales)}
              </p>
            </div>
            <div className="flex items-center justify-between border-t border-[color:var(--color-border)] pt-3">
              <p className="font-semibold text-[color:var(--color-text-primary)]">Resultado</p>
              <p
                className={`font-bold ${
                  resultadoPositivo ? 'text-green-600' : 'text-red-alert'
                }`}
              >
                {formatMoney(balance.resultado)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-[color:var(--color-bg-surface)] p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-[color:var(--color-text-primary)]">Desglose por obra</h2>
          <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">Lo que aporta cada obra al balance</p>

          {balance.por_obra.length === 0 ? (
            <p className="mt-4 text-sm text-[color:var(--color-text-muted)]">No hay obras cargadas</p>
          ) : (
            <div className="mt-4 space-y-3">
              {balance.por_obra.map((o) => {
                const obraPositiva = o.resultado >= 0
                return (
                  <CollapsibleCard
                    key={o.obra_id}
                    titulo={o.obra_nombre}
                    subtitulo={o.cliente_nombre || undefined}
                    headerRight={
                      <a
                        href={`/obras/${o.obra_id}`}
                        className="shrink-0 text-sm text-blue-light hover:underline"
                      >
                        Ver
                      </a>
                    }
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-[color:var(--color-text-secondary)]">Ingresos</p>
                        <p className="text-sm font-medium text-green-600">
                          {formatMoney(o.total_ingresos)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-[color:var(--color-text-secondary)]">Egresos</p>
                        <p className="text-sm font-medium text-[color:var(--color-text-secondary)]">
                          {formatMoney(o.total_egresos)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-[color:var(--color-text-secondary)]">Gastos generales</p>
                        <p className="text-sm font-medium text-[color:var(--color-text-secondary)]">
                          {formatMoney(o.total_gastos_generales)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between border-t border-[color:var(--color-border)] pt-2">
                        <p className="text-xs text-[color:var(--color-text-secondary)]">Resultado</p>
                        <p
                          className={`text-sm font-semibold ${
                            obraPositiva ? 'text-green-600' : 'text-red-alert'
                          }`}
                        >
                          {formatMoney(o.resultado)}
                        </p>
                      </div>
                    </div>
                  </CollapsibleCard>
                )
              })}
            </div>
          )}
        </div>

        <p className="mt-3 text-xs text-[color:var(--color-text-muted)]">
          Ingresos = pagos de clientes · Egresos = costos directos + gastos de materiales de
          cada obra. Gastos generales (seguros, combustible, etc.) se muestran aparte y no
          descuentan del resultado.
        </p>
      </div>
    </div>
  )
}