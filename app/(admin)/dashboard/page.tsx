import Link from 'next/link'
import { getAllProjects, getAllInvoices } from '@/lib/db'
import { isOverdue, isEndingThisMonth, formatCurrency } from '@/lib/utils'
import GanttChart from '@/components/gantt/GanttChart'
import Toast from '@/components/ui/Toast'
import type { Project, Invoice } from '@/lib/types'

interface StatCardProps {
  label: string
  value: number
  color: string
}

function StatCard({ label, value, color }: StatCardProps) {
  return (
    <div className="bg-surface border border-border rounded-xl px-6 py-5 flex flex-col gap-1.5">
      <span className="text-3xl font-bold font-mono tabular-nums" style={{ color }}>
        {value}
      </span>
      <span className="text-xs text-muted font-mono uppercase tracking-widest">
        {label}
      </span>
    </div>
  )
}

interface AlertBannerProps {
  level: 'warn' | 'danger'
  message: string
  names?: string[]
  detail?: string
  href: string
  linkLabel?: string
}

function AlertBanner({ level, message, names, detail, href, linkLabel = 'Ver detalhes' }: AlertBannerProps) {
  const color  = level === 'warn' ? 'var(--warn)'   : 'var(--danger)'
  const bg     = level === 'warn' ? 'rgba(240,193,75,0.06)' : 'rgba(255,107,107,0.06)'
  const border = level === 'warn' ? 'rgba(240,193,75,0.25)' : 'rgba(255,107,107,0.25)'

  return (
    <div
      className="flex items-start justify-between gap-4 px-4 py-3 rounded-xl border"
      style={{ background: bg, borderColor: border }}
    >
      <div className="flex flex-col gap-1 min-w-0">
        <p className="text-sm font-mono font-bold" style={{ color }}>
          {level === 'warn' ? '⚠' : '🔴'} {message}
        </p>
        {names && names.length > 0 && (
          <p className="text-xs font-mono text-muted truncate">
            {names.join(' · ')}
          </p>
        )}
        {detail && (
          <p className="text-xs font-mono" style={{ color }}>
            {detail}
          </p>
        )}
      </div>
      <Link
        href={href}
        className="shrink-0 text-xs font-mono px-3 py-1.5 rounded-lg border transition-colors hover:opacity-80"
        style={{ color, borderColor: color, background: `color-mix(in srgb, ${color} 10%, transparent)` }}
      >
        {linkLabel}
      </Link>
    </div>
  )
}

interface PageProps {
  searchParams: Promise<{ toast?: string }>
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const { toast } = await searchParams

  let projects: Project[] = []
  let invoices: Invoice[] = []

  try {
    ;[projects, invoices] = await Promise.all([
      getAllProjects(),
      getAllInvoices(),
    ])
  } catch {
    // Supabase not yet configured — render empty state
  }

  // ── Alert calculations ─────────────────────────────────────
  const endingThisMonth = projects.filter(isEndingThisMonth)
  const overdueProjects = projects.filter(isOverdue)

  const today = new Date().toISOString().split('T')[0]
  const overdueInvoices = invoices.filter(
    i => i.status === 'pending' && i.due_date && i.due_date < today
  )
  const overdueInvoiceTotal = overdueInvoices.reduce((sum, i) => sum + i.amount, 0)

  // ── Project stats ──────────────────────────────────────────
  const stats = {
    total:  projects.length,
    active: projects.filter(p => p.status === 'active').length,
    review: projects.filter(p => p.status === 'review').length,
    done:   projects.filter(p => p.status === 'done').length,
  }

  const year = new Date().getFullYear()

  return (
    <div className="px-6 py-8 max-w-[1400px] mx-auto flex flex-col gap-8">

      {/* ── Alert banners ───────────────────────────────── */}
      {(endingThisMonth.length > 0 || overdueProjects.length > 0 || overdueInvoices.length > 0) && (
        <div className="flex flex-col gap-3">
          {endingThisMonth.length > 0 && (
            <AlertBanner
              level="warn"
              message={`${endingThisMonth.length} projeto${endingThisMonth.length > 1 ? 's' : ''} encerrando este mês`}
              names={endingThisMonth.map(p => p.name)}
              href="#gantt"
            />
          )}

          {overdueProjects.length > 0 && (
            <AlertBanner
              level="danger"
              message={`${overdueProjects.length} projeto${overdueProjects.length > 1 ? 's' : ''} vencido${overdueProjects.length > 1 ? 's' : ''}`}
              names={overdueProjects.map(p => p.name)}
              href="#gantt"
            />
          )}

          {overdueInvoices.length > 0 && (
            <AlertBanner
              level="danger"
              message={`${overdueInvoices.length} fatura${overdueInvoices.length > 1 ? 's' : ''} vencida${overdueInvoices.length > 1 ? 's' : ''}`}
              detail={`${formatCurrency(overdueInvoiceTotal)} em aberto`}
              href="/dashboard/invoices"
              linkLabel="Ver faturas"
            />
          )}
        </div>
      )}

      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-text">Projetos</h1>
          <p className="text-sm text-muted font-mono mt-0.5">{year}</p>
        </div>

        <Link
          href="/dashboard/projects/new"
          className="shrink-0 px-4 py-2.5 rounded-lg text-sm font-bold font-sans bg-accent text-bg hover:opacity-90 transition-opacity"
        >
          <span className="hidden sm:inline">+ Novo Projeto</span>
          <span className="sm:hidden">+ Novo</span>
        </Link>
      </div>

      {/* ── Stats ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total"      value={stats.total}  color="var(--text)"    />
        <StatCard label="Ativos"     value={stats.active} color="var(--success)" />
        <StatCard label="Revisão"    value={stats.review} color="var(--warn)"    />
        <StatCard label="Concluídos" value={stats.done}   color="var(--muted)"   />
      </div>

      {/* ── Gantt ──────────────────────────────────────── */}
      <div id="gantt" className="flex flex-col gap-3">
        <h2 className="text-xs font-mono text-muted uppercase tracking-widest">
          Cronograma
        </h2>
        <GanttChart projects={projects} showEditLinks={true} />
      </div>

      {/* ── Toast ──────────────────────────────────────── */}
      <Toast message={toast} />

    </div>
  )
}
