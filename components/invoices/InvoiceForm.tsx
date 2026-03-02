'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Client, TeamMember, Project, InvoiceFormValues } from '@/lib/types'
import { createInvoiceAction } from '@/lib/actions'

const INPUT =
  'w-full px-4 py-2.5 rounded-lg bg-bg border border-border text-text font-mono text-sm outline-none focus:border-accent transition-colors'

const SELECT = `${INPUT} cursor-pointer`

function Field({ label, required, children }: {
  label: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-muted font-mono">
        {label}
        {required && <span className="text-warn ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}

interface InvoiceFormProps {
  clients: Client[]
  teamMembers: TeamMember[]
  projects: Project[]
}

const CURRENCIES = ['BRL', 'USD', 'EUR']

export default function InvoiceForm({ clients, teamMembers, projects }: InvoiceFormProps) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [v, setV] = useState<InvoiceFormValues>({
    type:           'client',
    client_id:      '',
    team_member_id: '',
    project_id:     '',
    title:          '',
    amount:         '',
    currency:       'BRL',
    status:         'pending',
    due_date:       '',
    notes:          '',
  })

  function set<K extends keyof InvoiceFormValues>(key: K, val: InvoiceFormValues[K]) {
    setV(prev => ({ ...prev, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const fd = new FormData()
      fd.append('type',           v.type)
      fd.append('client_id',      v.client_id)
      fd.append('team_member_id', v.team_member_id)
      fd.append('project_id',     v.project_id)
      fd.append('title',          v.title)
      fd.append('amount',         v.amount)
      fd.append('currency',       v.currency)
      fd.append('status',         v.status)
      fd.append('due_date',       v.due_date)
      fd.append('notes',          v.notes)

      const file = fileRef.current?.files?.[0]
      if (file) fd.append('file', file)

      const res = await createInvoiceAction(fd)
      if (res?.error) {
        setError(res.error)
      } else {
        router.push('/dashboard/invoices?toast=created')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">

      {/* Type selector */}
      <div className="flex gap-2">
        {(['client', 'team'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => set('type', t)}
            className="flex-1 py-2.5 rounded-lg text-sm font-mono border transition-colors cursor-pointer"
            style={{
              borderColor: v.type === t ? (t === 'client' ? 'var(--success)' : 'var(--danger)') : 'var(--border)',
              color:       v.type === t ? (t === 'client' ? 'var(--success)' : 'var(--danger)') : 'var(--muted)',
              background:  v.type === t ? (t === 'client' ? 'rgba(110,212,160,0.08)' : 'rgba(255,107,107,0.08)') : 'transparent',
            }}
          >
            {t === 'client' ? '↑ Receita (Cliente)' : '↓ Despesa (Equipe)'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Dynamic entity selector */}
        {v.type === 'client' ? (
          <Field label="Cliente" required>
            <select className={SELECT} value={v.client_id} onChange={e => set('client_id', e.target.value)} required>
              <option value="">Selecionar cliente…</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}{c.company ? ` — ${c.company}` : ''}</option>
              ))}
            </select>
          </Field>
        ) : (
          <Field label="Membro da Equipe" required>
            <select className={SELECT} value={v.team_member_id} onChange={e => set('team_member_id', e.target.value)} required>
              <option value="">Selecionar membro…</option>
              {teamMembers.map(m => (
                <option key={m.id} value={m.id}>{m.name}{m.role ? ` — ${m.role}` : ''}</option>
              ))}
            </select>
          </Field>
        )}

        {/* Project (optional) */}
        <Field label="Projeto (opcional)">
          <select className={SELECT} value={v.project_id} onChange={e => set('project_id', e.target.value)}>
            <option value="">Nenhum</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </Field>

        {/* Title */}
        <Field label="Título" required>
          <input
            className={INPUT}
            value={v.title}
            onChange={e => set('title', e.target.value)}
            placeholder="Ex: Desenvolvimento — Março 2026"
            required
          />
        </Field>

        {/* Amount + currency */}
        <Field label="Valor" required>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              step="0.01"
              className={`${INPUT} flex-1`}
              value={v.amount}
              onChange={e => set('amount', e.target.value)}
              placeholder="0,00"
              required
            />
            <select
              className="px-3 py-2.5 rounded-lg bg-bg border border-border text-text font-mono text-sm outline-none focus:border-accent transition-colors cursor-pointer"
              value={v.currency}
              onChange={e => set('currency', e.target.value)}
            >
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </Field>

        {/* Status */}
        <Field label="Status">
          <select className={SELECT} value={v.status} onChange={e => set('status', e.target.value as InvoiceFormValues['status'])}>
            <option value="pending">Pendente</option>
            <option value="paid">Pago</option>
            <option value="overdue">Vencido</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </Field>

        {/* Due date */}
        <Field label="Data de Vencimento">
          <input
            type="date"
            className={INPUT}
            value={v.due_date}
            onChange={e => set('due_date', e.target.value)}
          />
        </Field>

      </div>

      {/* PDF upload */}
      <Field label="Anexar PDF (opcional)">
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          className="text-sm font-mono text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-border file:bg-surface file:text-text file:font-mono file:text-xs file:cursor-pointer cursor-pointer"
        />
      </Field>

      {/* Notes */}
      <Field label="Notas">
        <textarea
          className={`${INPUT} resize-y min-h-[80px]`}
          value={v.notes}
          onChange={e => set('notes', e.target.value)}
          placeholder="Observações sobre esta fatura…"
        />
      </Field>

      {error && <p className="text-sm font-mono text-warn">{error}</p>}

      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 pt-2 border-t border-border">
        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto px-8 py-2.5 rounded-lg text-sm font-bold font-sans bg-accent text-bg hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          {saving ? 'salvando…' : 'Criar Fatura'}
        </button>
        <a
          href="/dashboard/invoices"
          className="sm:ml-auto text-sm text-muted font-mono hover:text-text transition-colors text-center sm:text-left"
        >
          cancelar
        </a>
      </div>

    </form>
  )
}
