'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/dashboard',           label: 'Dashboard'     },
  { href: '/dashboard/clients',   label: 'Clientes'      },
  { href: '/dashboard/team',      label: 'Equipe'        },
  { href: '/dashboard/tasks',     label: 'Tarefas'       },
  { href: '/dashboard/invoices',  label: 'Faturas'       },
  { href: '/dashboard/settings',  label: 'Configurações' },
]

export default function NavLinks() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-1">
      {NAV_ITEMS.map(({ href, label }) => {
        const isActive =
          href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(href)

        return (
          <Link
            key={href}
            href={href}
            className="px-3 py-1.5 rounded-lg text-sm font-mono transition-colors"
            style={{
              color: isActive ? 'var(--accent)' : 'var(--muted)',
              backgroundColor: isActive ? 'rgba(200,240,110,0.08)' : 'transparent',
            }}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
