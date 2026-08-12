'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Wallet } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import LoadingScreen from '@/components/ui/LoadingScreen'
import type { User } from '@supabase/supabase-js'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/login')
      } else {
        setUser(data.user)
      }
      setLoading(false)
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-[color:var(--color-bg-page)]">
      <div className="bg-hero-glow relative overflow-hidden bg-blue-accent/10 px-4 pt-10 pb-8 sm:pt-14 sm:pb-10">
        <button
          onClick={handleLogout}
          className="absolute top-4 right-4 text-xs text-[color:var(--color-text-secondary)] underline hover:text-[color:var(--color-text-primary)]"
        >
          Cerrar sesión
        </button>
        <div className="relative mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[color:var(--color-text-primary)] sm:text-4xl">
            Zenit DC
          </h1>
          <p className="mt-2 text-sm text-[color:var(--color-text-secondary)]">Bienvenido, {user?.email}</p>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-2xl px-4 pb-8">
        <div className="grid gap-3 sm:grid-cols-2">
          <a
            href="/clientes"
            className="flex flex-col items-center rounded-xl bg-[color:var(--color-bg-surface)] p-6 text-center shadow-sm transition hover:shadow-md"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-accent/15 text-blue-light">
              <Users className="h-6 w-6" />
            </span>
            <h2 className="mt-3 font-semibold text-[color:var(--color-text-primary)]">Clientes y obras</h2>
            <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">
              Administrá clientes, proyectos y presupuestos
            </p>
          </a>

          <a
            href="/balance"
            className="flex flex-col items-center rounded-xl bg-[color:var(--color-bg-surface)] p-6 text-center shadow-sm transition hover:shadow-md"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-accent/15 text-blue-light">
              <Wallet className="h-6 w-6" />
            </span>
            <h2 className="mt-3 font-semibold text-[color:var(--color-text-primary)]">Balance general</h2>
            <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">Ingresos, egresos y resultado</p>
          </a>
        </div>
      </div>
    </div>
  )
}