'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// ── Icons (same set as Sidebar) ───────────────────────────────

function IconGrid() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  )
}

function IconPeople() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function IconUsers() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function IconDocument() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  )
}

function IconGear() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

// ── Nav config ────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: '/dashboard',          label: 'Dashboard', Icon: IconGrid     },
  { href: '/dashboard/clients',  label: 'Clientes',  Icon: IconPeople   },
  { href: '/dashboard/team',     label: 'Equipe',    Icon: IconUsers    },
  { href: '/dashboard/invoices', label: 'Faturas',   Icon: IconDocument },
  { href: '/dashboard/settings', label: 'Config',    Icon: IconGear     },
]

// ── Component ─────────────────────────────────────────────────

interface MobileNavProps {
  alertCount: number
}

export default function MobileNav({ alertCount }: MobileNavProps) {
  const pathname = usePathname()

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch"
      style={{
        background:    'var(--surface)',
        borderTop:     '1px solid var(--border)',
        height:        64,
        paddingBottom: 'env(safe-area-inset-bottom, 0)',
      }}
    >
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const isActive =
          href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(href)

        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-colors relative"
            style={{ color: isActive ? 'var(--accent)' : 'var(--muted)' }}
          >
            {/* Alert badge on Dashboard */}
            {href === '/dashboard' && alertCount > 0 && (
              <span
                className="absolute top-1.5 right-[calc(50%-16px)] text-[9px] font-bold font-mono min-w-[16px] h-4 flex items-center justify-center px-0.5 rounded-full leading-none"
                style={{ background: 'var(--danger)', color: '#fff' }}
              >
                {alertCount > 99 ? '99+' : alertCount}
              </span>
            )}

            <Icon />
            <span className="text-[10px] font-mono leading-tight">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
