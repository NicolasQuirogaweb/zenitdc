'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_ITEMS } from './nav-items'

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-[color:var(--color-border)] bg-[color:var(--color-bg-surface)] md:hidden">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const activo = pathname === href || pathname.startsWith(`${href}/`)
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center gap-1 py-2 text-xs ${
              activo ? 'text-blue-light' : 'text-[color:var(--color-text-secondary)]'
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
