'use client'

import Link from 'next/link'
import { HardHat, Wrench } from 'lucide-react'

export default function PersonalHubPage() {
  return (
    <div className="min-h-screen bg-[color:var(--color-bg-page)] p-4">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[color:var(--color-text-primary)]">Personal</h1>
          <Link href="/dashboard" className="text-sm text-blue-light hover:underline">
            Volver
          </Link>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/personal"
            className="flex flex-col items-center rounded-xl bg-[color:var(--color-bg-surface)] p-6 text-center shadow-sm transition hover:shadow-md"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-accent/15 text-blue-light">
              <HardHat className="h-6 w-6" />
            </span>
            <h2 className="mt-3 font-semibold text-[color:var(--color-text-primary)]">Personal de la empresa</h2>
            <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">Personal propio de la empresa</p>
          </Link>

          <Link
            href="/personal-tercerizado"
            className="flex flex-col items-center rounded-xl bg-[color:var(--color-bg-surface)] p-6 text-center shadow-sm transition hover:shadow-md"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-accent/15 text-blue-light">
              <Wrench className="h-6 w-6" />
            </span>
            <h2 className="mt-3 font-semibold text-[color:var(--color-text-primary)]">Personal tercerizado</h2>
            <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">Mano de obra subcontratada</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
