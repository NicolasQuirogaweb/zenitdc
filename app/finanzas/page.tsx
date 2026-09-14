'use client'

import Link from 'next/link'
import { Wallet, History, Receipt } from 'lucide-react'

export default function FinanzasPage() {
  return (
    <div className="min-h-screen bg-[color:var(--color-bg-page)] p-4">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[color:var(--color-text-primary)]">Finanzas</h1>
          <Link href="/dashboard" className="text-sm text-blue-light hover:underline">
            Volver
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Link
            href="/balance"
            className="flex flex-col items-center rounded-xl bg-[color:var(--color-bg-surface)] p-6 text-center shadow-sm transition hover:shadow-md"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-accent/15 text-blue-light">
              <Wallet className="h-6 w-6" />
            </span>
            <h2 className="mt-3 font-semibold text-[color:var(--color-text-primary)]">Balance general</h2>
            <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">Ingresos, egresos y resultado</p>
          </Link>

          <Link
            href="/pagos"
            className="flex flex-col items-center rounded-xl bg-[color:var(--color-bg-surface)] p-6 text-center shadow-sm transition hover:shadow-md"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-accent/15 text-blue-light">
              <History className="h-6 w-6" />
            </span>
            <h2 className="mt-3 font-semibold text-[color:var(--color-text-primary)]">Pagos</h2>
            <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">Historial de todo lo que se va pagando</p>
          </Link>

          <Link
            href="/gastos-empresa"
            className="flex flex-col items-center rounded-xl bg-[color:var(--color-bg-surface)] p-6 text-center shadow-sm transition hover:shadow-md"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-accent/15 text-blue-light">
              <Receipt className="h-6 w-6" />
            </span>
            <h2 className="mt-3 font-semibold text-[color:var(--color-text-primary)]">Gastos generales</h2>
            <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">Sin obra asociada (alquiler, impuestos, contador, etc.)</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
