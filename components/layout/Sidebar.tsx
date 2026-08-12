'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_ITEMS } from './nav-items'

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-56 flex-col border-r border-[color:var(--color-border)] bg-[color:var(--color-bg-surface)] p-4 md:flex">
      <p className="mb-6 px-2 text-lg font-bold text-[color:var(--color-text-primary)]">Zenit DC</p>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const activo = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                activo
                  ? 'bg-blue-accent/15 text-blue-light'
                  : 'text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-border)]'
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
