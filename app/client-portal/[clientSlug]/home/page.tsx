import { notFound, redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import type { Invoice, Project } from '@/lib/types'
import { getClientWithProjects, getInvoicesByClient } from '@/lib/db'
import { verifyClientPortalToken, PORTAL_COOKIE_PREFIX } from '@/lib/auth'
import { calcProgress, getProgressStatus, formatCurrency, monthName } from '@/lib/utils'
import { INVOICE_STATUS, PROJECT_STATUS } from '@/lib/constants'

export const dynamic = 'force-dynamic'

// ── Helpers ───────────────────────────────────────────────────

function fmtDate(d: string | null | undefined): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

const INVOICE_SORT_ORDER: Record<Invoice['status'], number> = {
  overdue: 0, pending: 1, paid: 2, cancelled: 3,
}

// ── Minimal markdown renderer ─────────────────────────────────

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i}>{part.slice(2, -2)}</strong>
    if (part.startsWith('*') && part.endsWith('*'))
      return <em key={i}>{part.slice(1, -1)}</em>
    return part
  })
}

function SimpleMarkdown({ text }: { text: string }) {
  const blocks = text.split(/\n\n+/)
  return (
    <div className="flex flex-col gap-3 text-sm font-mono leading-relaxed" style={{ color: 'var(--text)' }}>
      {blocks.map((block, i) => {
        const lines = block.split('\n').filter(Boolean)
        if (!lines.length) return null

        if (lines[0].startsWith('### '))
          return <h4 key={i} className="font-bold text-sm" style={{ color: 'var(--accent)' }}>{renderInline(lines[0].slice(4))}</h4>
        if (lines[0].startsWith('## '))
          return <h3 key={i} className="font-bold text-base">{renderInline(lines[0].slice(3))}</h3>
        if (lines[0].startsWith('# '))
          return <h2 key={i} className="font-bold text-lg">{renderInline(lines[0].slice(2))}</h2>

        if (lines.every(l => l.startsWith('- ') || l.startsWith('* ')))
          return (
            <ul key={i} className="list-disc list-inside flex flex-col gap-0.5 pl-2">
              {lines.map((l, j) => <li key={j}>{renderInline(l.slice(2))}</li>)}
            </ul>
          )

        return (
          <p key={i}>
            {lines.map((l, j) => (
              <span key={j}>{renderInline(l)}{j < lines.length - 1 && <br />}</span>
            ))}
          </p>
        )
      })}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="flex flex-col gap-1.5 p-4 rounded-xl border"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>{label}</span>
      <span className="text-xl font-bold font-mono" style={{ color }}>{value}</span>
    </div>
  )
}

function InvoiceCard({ invoice }: { invoice: Invoice }) {
  const cfg = INVOICE_STATUS[invoice.status]
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 rounded-xl border"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-sans font-semibold text-text truncate">{invoice.title}</p>
        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          {invoice.due_date && (
            <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
              Venc.: {fmtDate(invoice.due_date)}
            </span>
          )}
          {invoice.paid_date && (
            <span className="text-xs font-mono" style={{ color: 'var(--success)' }}>
              Pago: {fmtDate(invoice.paid_date)}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className="text-base font-bold font-mono text-text">
          {formatCurrency(invoice.amount, invoice.currency)}
        </span>
        <span
          className="text-xs font-mono px-2.5 py-1 rounded-full"
          style={{
            color: cfg.color,
            background: `color-mix(in srgb, ${cfg.color} 12%, transparent)`,
            border: `1px solid color-mix(in srgb, ${cfg.color} 25%, transparent)`,
          }}
        >
          {cfg.label}
        </span>
        {invoice.attachment_url && (
          <a
            href={invoice.attachment_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono px-3 py-1.5 rounded-lg border transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            PDF ↗
          </a>
        )}
      </div>
    </div>
  )
}

function ProjectCard({ project }: { project: Project }) {
  const pct = calcProgress(project)
  const { label: statusLabel, color: statusColor } = getProgressStatus(project)
  const cfg = PROJECT_STATUS[project.status]
  const dateRange = `${monthName(project.start_month)}/${project.year} → ${monthName(project.end_month)}/${project.year}`

  return (
    <div
      className="flex flex-col gap-3 p-4 rounded-xl border"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-sm font-sans font-semibold text-text truncate">{project.name}</span>
          <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>{dateRange}</span>
        </div>
        <span
          className="text-xs font-mono px-2.5 py-1 rounded-full shrink-0"
          style={{
            color: cfg.color,
            background: cfg.bg,
            border: `1px solid color-mix(in srgb, ${cfg.color} 25%, transparent)`,
          }}
        >
          {cfg.label}
        </span>
      </div>

      {/* Progress bar */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono" style={{ color: statusColor }}>{statusLabel}</span>
          <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>{pct}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
          <div
            className="h-full rounded-full"
            style={{ width: `${pct}%`, background: statusColor }}
          />
        </div>
      </div>

      <a
        href={`/p/${project.slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs font-mono w-fit px-3 py-1.5 rounded-lg border transition-colors"
        style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
      >
        Ver cronograma ↗
      </a>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-mono uppercase tracking-widest pb-2 border-b" style={{ color: 'var(--muted)', borderColor: 'var(--border)' }}>
      {children}
    </h2>
  )
}

// ── Page ──────────────────────────────────────────────────────

interface Props {
  params: Promise<{ clientSlug: string }>
}

export default async function ClientPortalHomePage({ params }: Props) {
  const { clientSlug } = await params

  // Auth
  const clientId = await verifyClientPortalToken(clientSlug)
  if (!clientId) redirect(`/client-portal/${clientSlug}`)

  // Data
  const [client, allInvoices] = await Promise.all([
    getClientWithProjects(clientId),
    getInvoicesByClient(clientId),
  ])
  if (!client) notFound()

  // Filter: só faturas do tipo cliente
  const invoices = allInvoices
    .filter(i => i.type === 'client')
    .sort((a, b) => INVOICE_SORT_ORDER[a.status] - INVOICE_SORT_ORDER[b.status])

  const projects = (client.projects ?? []).filter(p => p.status !== 'done' || true) // mostrar todos

  // Totais financeiros
  const totalPago    = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
  const totalPendente = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0)
  const totalVencido = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0)
  const currency     = invoices[0]?.currency ?? 'BRL'

  // Logout server action
  async function logout() {
    'use server'
    const cookieStore = await cookies()
    cookieStore.delete(`${PORTAL_COOKIE_PREFIX}${clientSlug}`)
    redirect(`/client-portal/${clientSlug}`)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>

      {/* ── SEÇÃO 1 — Header ── */}
      <header
        className="sticky top-0 z-10 px-4 sm:px-6 py-4 flex items-center gap-4 border-b"
        style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
      >
        <span className="font-bold font-sans text-lg tracking-tight" style={{ color: 'var(--accent)' }}>
          F&amp;A
        </span>
        <span
          className="text-xs font-mono px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(123,110,246,0.12)', color: 'var(--accent2)', border: '1px solid rgba(123,110,246,0.2)' }}
        >
          Portal do Cliente
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-sans font-semibold text-text truncate">
            {client.company ?? client.name}
          </p>
          {client.company && (
            <p className="text-xs font-mono truncate" style={{ color: 'var(--muted)' }}>
              {client.name}
            </p>
          )}
        </div>

        <form action={logout}>
          <button
            type="submit"
            className="text-xs font-mono px-3 py-1.5 rounded-lg border transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
          >
            Sair
          </button>
        </form>
      </header>

      {/* ── Conteúdo principal ── */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-10">

        {/* ── SEÇÃO 2 — Resumo financeiro ── */}
        {invoices.length > 0 && (
          <section className="flex flex-col gap-4">
            <SectionTitle>Resumo Financeiro</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <StatCard label="Total pago"     value={formatCurrency(totalPago, currency)}     color="var(--success)" />
              <StatCard label="Pendente"        value={formatCurrency(totalPendente, currency)} color="var(--warn)"    />
              <StatCard label="Em atraso"       value={formatCurrency(totalVencido, currency)}  color="var(--danger)"  />
            </div>
          </section>
        )}

        {/* ── SEÇÃO 3 — Faturas ── */}
        <section className="flex flex-col gap-4">
          <SectionTitle>Faturas</SectionTitle>
          {invoices.length === 0 ? (
            <p className="text-sm font-mono py-4 text-center" style={{ color: 'var(--muted)' }}>
              Nenhuma fatura cadastrada.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {invoices.map(inv => (
                <InvoiceCard key={inv.id} invoice={inv} />
              ))}
            </div>
          )}
        </section>

        {/* ── SEÇÃO 4 — Projetos ── */}
        <section className="flex flex-col gap-4">
          <SectionTitle>Projetos</SectionTitle>
          {projects.length === 0 ? (
            <p className="text-sm font-mono py-4 text-center" style={{ color: 'var(--muted)' }}>
              Nenhum projeto vinculado.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {projects.map(p => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          )}
        </section>

        {/* ── SEÇÃO 5 — Anotações ── */}
        {client.notes && (
          <section className="flex flex-col gap-4">
            <SectionTitle>Informações do Projeto</SectionTitle>
            <div
              className="p-5 rounded-xl border"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <SimpleMarkdown text={client.notes} />
            </div>
          </section>
        )}

      </main>

      {/* ── SEÇÃO 6 — Footer ── */}
      <footer
        className="px-6 py-5 border-t flex items-center justify-center gap-2"
        style={{ borderColor: 'var(--border)' }}
      >
        <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
          FSZA WORKS
        </span>
        <span className="text-xs font-mono" style={{ color: 'var(--border)' }}>·</span>
        <a
          href="https://fsza.works"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono transition-colors"
          style={{ color: 'var(--muted)' }}
          onMouseOver={undefined}
        >
          fsza.works ↗
        </a>
      </footer>

    </div>
  )
}
