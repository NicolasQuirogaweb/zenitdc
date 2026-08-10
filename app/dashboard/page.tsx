'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
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
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-slate-500">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">Zenit DC</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-slate-500 underline hover:text-slate-700"
          >
            Cerrar sesión
          </button>
        </div>

        <p className="mt-1 text-sm text-slate-500">
          Bienvenido, {user?.email}
        </p>

        <div className="mt-8 space-y-3">
          <a
            href="/clientes"
            className="block rounded-lg bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <h2 className="font-semibold text-slate-800">Administrar clientes y sus obras</h2>
            <p className="mt-1 text-sm text-slate-500">Clientes, proyectos y presupuestos</p>
          </a>

          <a
            href="/balance"
            className="block rounded-lg bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <h2 className="font-semibold text-slate-800">Resumen financiero general</h2>
            <p className="mt-1 text-sm text-slate-500">Ingresos, egresos y resultado</p>
          </a>
        </div>
      </div>
    </div>
  )
}