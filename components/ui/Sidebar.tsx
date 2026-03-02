'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// ── Icons ─────────────────────────────────────────────────────

function IconGrid() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  )
}

function IconPeople() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function IconUsers() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function IconDocument() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

// ── Nav config ────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: '/dashboard',          label: 'Dashboard',     Icon: IconGrid     },
  { href: '/dashboard/clients',  label: 'Clientes',      Icon: IconPeople   },
  { href: '/dashboard/team',     label: 'Equipe',        Icon: IconUsers    },
  { href: '/dashboard/invoices', label: 'Faturas',       Icon: IconDocument },
  { href: '/dashboard/settings', label: 'Configurações', Icon: IconGear     },
]

// ── Component ─────────────────────────────────────────────────

interface SidebarProps {
  alertCount: number
  onLogout: () => Promise<void>
}

export default function Sidebar({ alertCount, onLogout }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className="hidden md:flex flex-col sticky top-0 h-screen shrink-0 border-r border-border overflow-y-auto w-16 lg:w-[220px]"
      style={{ backgroundColor: 'var(--surface)' }}
    >
      {/* Logo */}
      <div className="px-3 py-5 border-b border-border flex items-center justify-center lg:justify-start lg:px-5">
        <span
          className="font-bold font-sans tracking-tight"
          style={{ color: 'var(--accent)', fontSize: '1.125rem' }}
        >
          {/* Shortened on md (icon-only), full on lg */}
          <span className="hidden lg:inline">F&amp;A WORKS</span>
          <span className="lg:hidden">F&amp;</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-0.5 px-2 py-4">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive =
            href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              title={label}
              data-active={isActive ? 'true' : undefined}
              className="sidebar-link relative flex items-center justify-center lg:justify-start gap-3 px-3 py-2.5 rounded-lg text-sm font-mono"
              style={{
                color:           isActive ? 'var(--accent)' : 'var(--muted)',
                backgroundColor: isActive ? 'var(--bg)'     : 'transparent',
              }}
            >
              {/* Active indicator bar */}
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                  style={{ backgroundColor: 'var(--accent)' }}
                />
              )}

              {/* Small alert dot — icon-only mode (md) */}
              {href === '/dashboard' && alertCount > 0 && (
                <span
                  className="absolute top-1.5 right-1.5 lg:hidden w-2 h-2 rounded-full"
                  style={{ backgroundColor: 'var(--danger)' }}
                />
              )}

              <Icon />

              {/* Label — hidden on md, visible on lg */}
              <span className="hidden lg:block flex-1 truncate">{label}</span>

              {/* Full count badge — desktop only */}
              {href === '/dashboard' && alertCount > 0 && (
                <span
                  className="hidden lg:flex text-[10px] font-bold font-mono min-w-[18px] h-[18px] items-center justify-center px-1 rounded-full leading-none"
                  style={{ backgroundColor: 'var(--danger)', color: '#fff' }}
                >
                  {alertCount > 99 ? '99+' : alertCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-2 py-4 border-t border-border">
        <form action={onLogout}>
          <button
            type="submit"
            title="Sair"
            className="sidebar-link w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-2.5 rounded-lg text-sm font-mono cursor-pointer"
            style={{ color: 'var(--muted)' }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="hidden lg:block">sair</span>
          </button>
        </form>
      </div>
    </aside>
  )
}
