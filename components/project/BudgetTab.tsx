'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Project } from '@/lib/types'
import { updateProjectBudgetAction } from '@/lib/actions'

const CURRENCIES = ['BRL', 'USD', 'EUR', 'GBP']

const INPUT =
  'w-full px-4 py-2.5 rounded-lg bg-bg border border-border text-text font-mono text-sm outline-none focus:border-accent transition-colors'

export default function BudgetTab({ project }: { project: Project }) {
  const router = useRouter()
  const [budget, setBudget] = useState(project.budget?.toString() ?? '')
  const [currency, setCurrency] = useState(project.budget_currency ?? 'BRL')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const parsedBudget = budget ? parseFloat(budget) : null
      const res = await updateProjectBudgetAction(project.id, parsedBudget, currency)
      if (res?.error) {
        setError(res.error)
      } else {
        setSaved(true)
        router.refresh()
        setTimeout(() => setSaved(false), 3000)
      }
    } finally {
      setSaving(false)
    }
  }

  const formatted = project.budget
    ? new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: project.budget_currency ?? 'BRL',
      }).format(project.budget)
    : null

  return (
    <div className="flex flex-col gap-6 max-w-sm">

      {formatted && (
        <div className="px-4 py-4 rounded-xl bg-surface border border-border">
          <p className="text-xs font-mono text-muted uppercase tracking-widest mb-1">
            Budget do Projeto
          </p>
          <p className="text-2xl font-bold font-sans text-accent">{formatted}</p>
        </div>
      )}

      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono text-muted">Valor</label>
          <input
            type="number"
            step="0.01"
            min="0"
            className={INPUT}
            value={budget}
            onChange={e => { setBudget(e.target.value); setSaved(false) }}
            placeholder="0.00"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono text-muted">Moeda</label>
          <select
            className={INPUT}
            value={currency}
            onChange={e => { setCurrency(e.target.value); setSaved(false) }}
          >
            {CURRENCIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-lg bg-accent text-bg text-sm font-bold font-sans hover:opacity-90 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {saving ? 'salvando…' : 'Salvar Budget'}
          </button>
          {saved && (
            <span className="text-xs font-mono" style={{ color: 'var(--success)' }}>
              Salvo!
            </span>
          )}
          {error && <span className="text-xs font-mono text-warn">{error}</span>}
        </div>
      </form>

      <div className="border-t border-border pt-4">
        <p className="text-xs font-mono text-muted uppercase tracking-widest mb-2">
          Faturas Vinculadas
        </p>
        <p className="text-sm font-mono text-muted">
          Disponível na Fase 9 — Módulo Faturas
        </p>
      </div>
    </div>
  )
}
