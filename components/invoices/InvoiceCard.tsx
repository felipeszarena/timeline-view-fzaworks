'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Invoice } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { updateInvoiceStatusAction, deleteInvoiceAction } from '@/lib/actions'

const STATUS_CONFIG: Record<Invoice['status'], { label: string; color: string }> = {
  pending:   { label: 'Pendente',  color: 'var(--warn)'    },
  paid:      { label: 'Pago',      color: 'var(--success)' },
  overdue:   { label: 'Vencido',   color: 'var(--danger)'  },
  cancelled: { label: 'Cancelado', color: 'var(--muted)'   },
}

function formatDate(dateStr: string): string {
  // date strings from Postgres come as "2026-03-15" — append time to avoid timezone shift
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

interface InvoiceCardProps {
  invoice: Invoice
  entityName?: string | null
  projectName?: string | null
  attachmentSignedUrl?: string | null
}

export default function InvoiceCard({
  invoice,
  entityName,
  projectName,
  attachmentSignedUrl,
}: InvoiceCardProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const status = STATUS_CONFIG[invoice.status]
  const isRevenue = invoice.type === 'client'

  async function handleMarkPaid() {
    setSaving(true)
    const res = await updateInvoiceStatusAction(invoice.id, 'paid')
    if (res?.error) setError(res.error)
    else router.refresh()
    setSaving(false)
  }

  async function handleDelete() {
    if (!confirm(`Deletar fatura "${invoice.title}"?`)) return
    setSaving(true)
    const res = await deleteInvoiceAction(invoice.id)
    if (res?.error) { setError(res.error); setSaving(false) }
    else router.refresh()
  }

  return (
    <div className="flex flex-col gap-3 p-5 rounded-xl bg-surface border border-border">
      {/* Top row */}
      <div className="flex items-start gap-3 justify-between">
        <div className="flex flex-col gap-0.5 min-w-0">
          {/* Type pill */}
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[10px] font-mono px-1.5 py-0.5 rounded uppercase tracking-wider"
              style={{
                color: isRevenue ? 'var(--success)' : 'var(--danger)',
                background: isRevenue ? 'rgba(110,212,160,0.10)' : 'rgba(255,107,107,0.10)',
              }}
            >
              {isRevenue ? '↑ Receita' : '↓ Despesa'}
            </span>
            {projectName && (
              <span className="text-[10px] font-mono text-muted truncate">{projectName}</span>
            )}
          </div>

          <p className="text-sm font-sans font-semibold text-text truncate">{invoice.title}</p>

          {entityName && (
            <p className="text-xs font-mono text-muted truncate">{entityName}</p>
          )}
        </div>

        {/* Amount + status */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-base font-bold font-mono tabular-nums" style={{ color: isRevenue ? 'var(--success)' : 'var(--danger)' }}>
            {formatCurrency(invoice.amount, invoice.currency)}
          </span>
          <span
            className="text-xs font-mono px-2 py-0.5 rounded"
            style={{
              color: status.color,
              background: `color-mix(in srgb, ${status.color} 12%, transparent)`,
            }}
          >
            {status.label}
          </span>
        </div>
      </div>

      {/* Dates */}
      {(invoice.due_date || invoice.paid_date) && (
        <div className="flex gap-4 text-xs font-mono text-muted">
          {invoice.due_date && (
            <span>Vence: {formatDate(invoice.due_date)}</span>
          )}
          {invoice.paid_date && (
            <span style={{ color: 'var(--success)' }}>
              Pago em: {formatDate(invoice.paid_date)}
            </span>
          )}
        </div>
      )}

      {/* Notes */}
      {invoice.notes && (
        <p className="text-xs font-mono text-muted leading-relaxed">{invoice.notes}</p>
      )}

      {/* Actions row */}
      <div className="flex items-center gap-2 pt-1 border-t border-border flex-wrap">
        {attachmentSignedUrl && (
          <a
            href={attachmentSignedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono px-3 py-1.5 rounded-lg border border-border text-muted hover:text-text hover:border-accent transition-colors"
          >
            ↓ PDF
          </a>
        )}

        {invoice.status === 'pending' && (
          <button
            onClick={handleMarkPaid}
            disabled={saving}
            className="text-xs font-mono px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            style={{
              color: 'var(--success)',
              borderColor: 'rgba(110,212,160,0.3)',
              background: 'rgba(110,212,160,0.06)',
            }}
          >
            {saving ? '…' : '✓ Marcar como pago'}
          </button>
        )}

        <button
          onClick={handleDelete}
          disabled={saving}
          className="ml-auto text-xs font-mono text-muted hover:text-danger transition-colors cursor-pointer disabled:opacity-50"
        >
          deletar
        </button>
      </div>

      {error && <p className="text-xs font-mono text-danger">{error}</p>}
    </div>
  )
}
