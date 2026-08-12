'use client'

import { usePathname } from 'next/navigation'
import BottomNav from './BottomNav'
import Sidebar from './Sidebar'

const RUTAS_SIN_NAV = ['/login']

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (RUTAS_SIN_NAV.includes(pathname)) {
    return <>{children}</>
  }

  return (
    <>
      <Sidebar />
      <div className="pb-16 md:pb-0 md:pl-56">{children}</div>
      <BottomNav />
    </>
  )
}
