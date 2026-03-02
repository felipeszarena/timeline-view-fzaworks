'use client'

import { useState, useMemo } from 'react'
import type { Invoice } from '@/lib/types'
import InvoiceCard from './InvoiceCard'

const STATUS_LABELS: Record<string, string> = {
  all:       'Todos os status',
  pending:   'Pendente',
  paid:      'Pago',
  overdue:   'Vencido',
  cancelled: 'Cancelado',
}

const TYPE_LABELS: Record<string, string> = {
  all:    'Receitas e despesas',
  client: 'Receitas (clientes)',
  team:   'Despesas (equipe)',
}

export interface InvoiceListItem extends Invoice {
  entityName?: string | null
  projectName?: string | null
  attachmentSignedUrl?: string | null
}

interface InvoiceListProps {
  invoices: InvoiceListItem[]
}

export default function InvoiceList({ invoices }: InvoiceListProps) {
  const [filterType,   setFilterType]   = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterMonth,  setFilterMonth]  = useState('all')

  // Available months derived from data
  const months = useMemo(() => {
    const seen = new Set<string>()
    invoices.forEach(inv => {
      const m = inv.created_at.slice(0, 7) // "2026-03"
      seen.add(m)
    })
    return Array.from(seen).sort().reverse()
  }, [invoices])

  const filtered = useMemo(() => {
    return invoices.filter(inv => {
      if (filterType   !== 'all' && inv.type   !== filterType)   return false
      if (filterStatus !== 'all' && inv.status !== filterStatus) return false
      if (filterMonth  !== 'all' && !inv.created_at.startsWith(filterMonth)) return false
      return true
    })
  }, [invoices, filterType, filterStatus, filterMonth])

  const SELECT = 'px-3 py-2 rounded-lg bg-surface border border-border text-text font-mono text-sm outline-none focus:border-accent transition-colors cursor-pointer'

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select className={SELECT} value={filterType} onChange={e => setFilterType(e.target.value)}>
          {Object.entries(TYPE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>

        <select className={SELECT} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          {Object.entries(STATUS_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>

        <select className={SELECT} value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
          <option value="all">Todos os meses</option>
          {months.map(m => (
            <option key={m} value={m}>
              {new Date(m + '-15').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </option>
          ))}
        </select>

        {(filterType !== 'all' || filterStatus !== 'all' || filterMonth !== 'all') && (
          <button
            onClick={() => { setFilterType('all'); setFilterStatus('all'); setFilterMonth('all') }}
            className="text-xs font-mono text-muted hover:text-text transition-colors cursor-pointer"
          >
            limpar filtros
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="text-xs font-mono text-muted">
        {filtered.length} {filtered.length === 1 ? 'fatura' : 'faturas'}
        {filtered.length !== invoices.length && ` de ${invoices.length}`}
      </p>

      {/* List */}
      {filtered.length === 0 ? (
        <p className="text-sm font-mono text-muted text-center py-10">
          Nenhuma fatura encontrada.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(inv => (
            <InvoiceCard
              key={inv.id}
              invoice={inv}
              entityName={inv.entityName}
              projectName={inv.projectName}
              attachmentSignedUrl={inv.attachmentSignedUrl}
            />
          ))}
        </div>
      )}
    </div>
  )
}
