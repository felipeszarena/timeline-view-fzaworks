'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Milestone } from '@/lib/types'
import {
  createMilestoneAction, toggleMilestoneAction, deleteMilestoneAction,
} from '@/lib/actions'
import { monthName } from '@/lib/utils'

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

export default function MilestonesTab({
  projectId,
  initialMilestones,
  defaultYear,
}: {
  projectId: string
  initialMilestones: Milestone[]
  defaultYear: number
}) {
  const router = useRouter()
  const [milestones, setMilestones] = useState(initialMilestones)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [month, setMonth] = useState(1)
  const [year, setYear] = useState(defaultYear)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')

  const INPUT =
    'px-4 py-2.5 rounded-lg bg-bg border border-border text-text font-mono text-sm outline-none focus:border-accent transition-colors'

  async function handleToggle(m: Milestone) {
    const next = !m.done
    setMilestones(prev => prev.map(x => x.id === m.id ? { ...x, done: next } : x))
    await toggleMilestoneAction(m.id, next, projectId)
  }

  async function handleDelete(m: Milestone) {
    if (!confirm(`Deletar "${m.title}"?`)) return
    setMilestones(prev => prev.filter(x => x.id !== m.id))
    await deleteMilestoneAction(m.id, projectId)
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setAdding(true)
    setError('')
    try {
      const res = await createMilestoneAction(projectId, { title, month, year })
      if (res?.error) {
        setError(res.error)
      } else {
        setTitle('')
        setShowForm(false)
        router.refresh()
      }
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {milestones.length === 0 && !showForm && (
        <p className="text-sm font-mono text-muted text-center py-8">
          Nenhum marco cadastrado.
        </p>
      )}

      {milestones.length > 0 && (
        <div className="flex flex-col gap-2">
          {milestones.map(m => (
            <div
              key={m.id}
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-surface border border-border"
            >
              <input
                type="checkbox"
                checked={m.done}
                onChange={() => handleToggle(m)}
                className="accent-accent shrink-0 w-4 h-4 cursor-pointer"
              />
              <span
                className={`flex-1 text-sm font-mono min-w-0 ${
                  m.done ? 'line-through text-muted' : 'text-text'
                }`}
              >
                {m.title}
              </span>
              <span className="text-xs font-mono text-muted shrink-0">
                {monthName(m.month)}/{m.year}
              </span>
              <button
                onClick={() => handleDelete(m)}
                type="button"
                className="text-xs font-mono text-muted hover:text-danger transition-colors shrink-0"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm ? (
        <form
          onSubmit={handleAdd}
          className="flex flex-wrap gap-2 items-center border-t border-border pt-4"
        >
          <input
            autoFocus
            className={`flex-1 min-w-[160px] ${INPUT}`}
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Título do marco…"
            required
          />
          <select
            className={INPUT}
            value={month}
            onChange={e => setMonth(Number(e.target.value))}
          >
            {MONTHS.map(m => (
              <option key={m} value={m}>{monthName(m)}</option>
            ))}
          </select>
          <input
            type="number"
            className={`w-24 ${INPUT}`}
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            min={2020}
            max={2099}
          />
          <button
            type="submit"
            disabled={adding}
            className="px-5 py-2.5 rounded-lg bg-accent text-bg text-sm font-bold font-sans hover:opacity-90 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {adding ? 'salvando…' : 'Adicionar'}
          </button>
          <button
            type="button"
            onClick={() => { setShowForm(false); setTitle('') }}
            className="px-4 py-2.5 rounded-lg border border-border text-sm font-mono text-muted hover:text-text transition-colors"
          >
            cancelar
          </button>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          type="button"
          className="text-sm font-mono text-muted hover:text-accent transition-colors text-left w-fit"
        >
          + Novo Marco
        </button>
      )}

      {error && <p className="text-sm text-warn font-mono">{error}</p>}
    </div>
  )
}
