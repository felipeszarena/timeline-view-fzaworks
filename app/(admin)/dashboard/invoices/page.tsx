import Link from 'next/link'
import { getAllInvoices, getAllClients, getAllTeamMembers, getAllProjects } from '@/lib/db'
import { createAdminClient } from '@/lib/supabase'
import { calcInvoiceTotals, formatCurrency } from '@/lib/utils'
import InvoiceList from '@/components/invoices/InvoiceList'
import type { InvoiceListItem } from '@/components/invoices/InvoiceList'
import Toast from '@/components/ui/Toast'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ toast?: string }>
}

function FinanceCard({
  label, value, currency = 'BRL', color,
}: {
  label: string; value: number; currency?: string; color: string
}) {
  return (
    <div className="bg-surface border border-border rounded-xl px-6 py-5 flex flex-col gap-1.5">
      <span className="text-2xl font-bold font-mono tabular-nums" style={{ color }}>
        {formatCurrency(value, currency)}
      </span>
      <span className="text-xs text-muted font-mono uppercase tracking-widest">{label}</span>
    </div>
  )
}

export default async function InvoicesPage({ searchParams }: Props) {
  const { toast } = await searchParams

  const [invoices, clients, teamMembers, projects] = await Promise.all([
    getAllInvoices().catch(() => []),
    getAllClients().catch(() => []),
    getAllTeamMembers().catch(() => []),
    getAllProjects().catch(() => []),
  ])

  // Build lookup maps
  const clientMap   = Object.fromEntries(clients.map(c => [c.id, c]))
  const memberMap   = Object.fromEntries(teamMembers.map(m => [m.id, m]))
  const projectMap  = Object.fromEntries(projects.map(p => [p.id, p]))

  // Generate signed URLs for invoices with attachments
  const supabase = createAdminClient()
  const invoiceItems: InvoiceListItem[] = await Promise.all(
    invoices.map(async inv => {
      let attachmentSignedUrl: string | null = null

      if (inv.attachment_url) {
        const { data } = await supabase.storage
          .from('invoice-attachments')
          .createSignedUrl(inv.attachment_url, 3600)
        attachmentSignedUrl = data?.signedUrl ?? null
      }

      const entityName = inv.type === 'client'
        ? (inv.client_id ? clientMap[inv.client_id]?.name ?? null : null)
        : (inv.team_member_id ? memberMap[inv.team_member_id]?.name ?? null : null)

      const projectName = inv.project_id ? projectMap[inv.project_id]?.name ?? null : null

      return { ...inv, entityName, projectName, attachmentSignedUrl }
    })
  )

  const totals = calcInvoiceTotals(invoices)

  return (
    <div className="px-6 py-8 max-w-[1400px] mx-auto flex flex-col gap-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-text">Faturas</h1>
          <p className="text-sm text-muted font-mono mt-0.5">
            {invoices.length} {invoices.length === 1 ? 'fatura' : 'faturas'}
          </p>
        </div>
        <Link
          href="/dashboard/invoices/new"
          className="shrink-0 px-4 py-2.5 rounded-lg text-sm font-bold font-sans bg-accent text-bg hover:opacity-90 transition-opacity"
        >
          <span className="hidden sm:inline">+ Nova Fatura</span>
          <span className="sm:hidden">+ Novo</span>
        </Link>
      </div>

      {/* Financial summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <FinanceCard label="Recebido"  value={totals.received} color="var(--success)" />
        <FinanceCard label="A Receber" value={totals.pending}  color="var(--warn)"    />
        <FinanceCard label="Pago Out"  value={totals.paid_out} color="var(--danger)"  />
        <FinanceCard
          label="Saldo"
          value={totals.balance}
          color={totals.balance >= 0 ? 'var(--success)' : 'var(--danger)'}
        />
      </div>

      {/* Overdue alert */}
      {totals.overdue > 0 && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-mono"
          style={{ borderColor: 'rgba(255,107,107,0.3)', background: 'rgba(255,107,107,0.06)', color: 'var(--danger)' }}
        >
          ⚠ {formatCurrency(totals.overdue)} em faturas vencidas
        </div>
      )}

      {/* Filtered list */}
      <InvoiceList invoices={invoiceItems} />

      <Toast message={toast} />
    </div>
  )
}
