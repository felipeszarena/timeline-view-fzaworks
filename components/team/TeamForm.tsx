'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { TeamMember, TeamMemberFormValues } from '@/lib/types'

const INPUT =
  'w-full px-4 py-2.5 rounded-lg bg-bg border border-border text-text font-mono text-sm outline-none focus:border-accent transition-colors'

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
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

interface TeamFormProps {
  defaultValues?: Partial<TeamMember>
  isEditing?: boolean
  onSubmit: (data: TeamMemberFormValues) => Promise<{ error?: string }>
  onDelete?: () => Promise<{ error?: string }>
}

export default function TeamForm({
  defaultValues,
  isEditing = false,
  onSubmit,
  onDelete,
}: TeamFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const [v, setV] = useState<TeamMemberFormValues>({
    name:        defaultValues?.name        ?? '',
    role:        defaultValues?.role        ?? '',
    email:       defaultValues?.email       ?? '',
    hourly_rate: defaultValues?.hourly_rate != null ? String(defaultValues.hourly_rate) : '',
    notes:       defaultValues?.notes       ?? '',
    active:      defaultValues?.active      ?? true,
  })

  function set<K extends keyof TeamMemberFormValues>(key: K, val: TeamMemberFormValues[K]) {
    setV(prev => ({ ...prev, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await onSubmit(v)
      if (res?.error) {
        setError(res.error)
      } else {
        router.push(
          isEditing
            ? `/dashboard/team/${defaultValues?.id}?toast=updated`
            : '/dashboard/team?toast=created'
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!onDelete) return
    if (!confirm(`Deletar "${v.name}"? Esta ação não pode ser desfeita.`)) return
    setDeleting(true)
    setError('')
    try {
      const res = await onDelete()
      if (res?.error) {
        setError(res.error)
      } else {
        router.push('/dashboard/team?toast=deleted')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Nome" required>
          <input
            className={INPUT}
            value={v.name}
            onChange={e => set('name', e.target.value)}
            placeholder="Ex: Ana Lima"
            required
          />
        </Field>

        <Field label="Cargo / Função">
          <input
            className={INPUT}
            value={v.role}
            onChange={e => set('role', e.target.value)}
            placeholder="Ex: Designer, Desenvolvedor"
          />
        </Field>

        <Field label="E-mail">
          <input
            type="email"
            className={INPUT}
            value={v.email}
            onChange={e => set('email', e.target.value)}
            placeholder="membro@empresa.com"
          />
        </Field>

        <Field label="Taxa Horária (R$)">
          <input
            type="number"
            min="0"
            step="0.01"
            className={INPUT}
            value={v.hourly_rate}
            onChange={e => set('hourly_rate', e.target.value)}
            placeholder="0.00"
          />
        </Field>
      </div>

      <Field label="Notas internas">
        <textarea
          className={`${INPUT} resize-y min-h-[100px]`}
          value={v.notes}
          onChange={e => set('notes', e.target.value)}
          placeholder="Anotações sobre o membro…"
        />
      </Field>

      {/* Active toggle */}
      <label className="flex items-center gap-3 cursor-pointer w-fit">
        <div
          onClick={() => set('active', !v.active)}
          className="relative w-10 h-5 rounded-full transition-colors cursor-pointer"
          style={{ background: v.active ? 'var(--success)' : 'var(--border)' }}
        >
          <div
            className="absolute top-0.5 w-4 h-4 rounded-full bg-bg transition-all"
            style={{ left: v.active ? '1.25rem' : '0.125rem' }}
          />
        </div>
        <span className="text-sm font-mono text-text">
          {v.active ? 'Ativo' : 'Inativo'}
        </span>
      </label>

      {error && <p className="text-sm text-warn font-mono">{error}</p>}

      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 pt-2 border-t border-border">
        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto px-8 py-2.5 rounded-lg text-sm font-bold font-sans bg-accent text-bg hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          {submitting ? 'salvando…' : isEditing ? 'Salvar Alterações' : 'Criar Membro'}
        </button>

        {isEditing && onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-mono border border-border text-muted hover:text-danger hover:border-danger transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {deleting ? 'deletando…' : 'Deletar Membro'}
          </button>
        )}

        <a
          href={isEditing ? `/dashboard/team/${defaultValues?.id}` : '/dashboard/team'}
          className="sm:ml-auto text-sm text-muted font-mono hover:text-text transition-colors text-center sm:text-left"
        >
          cancelar
        </a>
      </div>
    </form>
  )
}
