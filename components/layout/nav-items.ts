import { LayoutDashboard, Building2, Users, HardHat, Wallet } from 'lucide-react'

export interface NavItem {
  href: string
  label: string
  icon: typeof LayoutDashboard
  /** Rutas adicionales que también marcan este ítem como "activo" — para
   * los accesos "hub" (Personal, Finanzas), que llevan a una pantalla
   * intermedia con 2 cards pero deben seguir resaltados al entrar a
   * cualquiera de las páginas reales a las que esas cards apuntan. */
  matchPrefixes?: string[]
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/obras', label: 'Obras', icon: Building2 },
  { href: '/clientes', label: 'Clientes', icon: Users },
  {
    href: '/personal-hub',
    label: 'Personal',
    icon: HardHat,
    matchPrefixes: ['/personal-hub', '/personal', '/personal-tercerizado'],
  },
  {
    href: '/finanzas',
    label: 'Finanzas',
    icon: Wallet,
    matchPrefixes: ['/finanzas', '/balance', '/pagos'],
  },
]

/** Si el ítem tiene `matchPrefixes`, se considera activo cuando el pathname
 * actual coincide con cualquiera de ellos (o es una subruta) — si no, cae
 * al comportamiento de siempre (comparar contra `href`). */
export function esRutaActiva(pathname: string, item: NavItem): boolean {
  const prefijos = item.matchPrefixes ?? [item.href]
  return prefijos.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}
