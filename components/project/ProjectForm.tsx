'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { slugify, monthName, currentYear } from '@/lib/utils'
import type { Project, ProjectFormValues } from '@/lib/types'

// ── Shared input styles ──────────────────────────────────────
const INPUT =
  'w-full px-4 py-2.5 min-h-[44px] rounded-lg bg-bg border border-border text-text font-mono text-sm outline-none focus:border-accent transition-colors'

const PRESET_COLORS = [
  '#6ed4a0', '#c8f06e', '#7b6ef6', '#f0c14b',
  '#f06e6e', '#6eb4f0', '#f0a06e', '#f06ec8',
]

const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: monthName(i + 1),
}))

// ── Small layout helpers ─────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xs font-mono text-muted uppercase tracking-widest border-b border-border pb-2">
        {title}
      </h3>
      {children}
    </div>
  )
}

function Field({
  label, required, children,
}: { label: string; required?: boolean; children: React.ReactNode }) {
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

// ── Props ────────────────────────────────────────────────────
interface ProjectFormProps {
  defaultValues?: Partial<Project>
  isEditing?: boolean
  onSubmit: (data: ProjectFormValues) => Promise<{ error?: string }>
  onDelete?: () => Promise<{ error?: string }>
}

// ── Component ────────────────────────────────────────────────
export default function ProjectForm({
  defaultValues,
  isEditing = false,
  onSubmit,
  onDelete,
}: ProjectFormProps) {
  const router = useRouter()
  const [slugEdited, setSlugEdited] = useState(!!defaultValues?.slug)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const [v, setV] = useState<ProjectFormValues>({
    name:             defaultValues?.name         ?? '',
    client:           defaultValues?.client       ?? '',
    slug:             defaultValues?.slug         ?? '',
    status:           defaultValues?.status       ?? 'planned',
    color:            defaultValues?.color        ?? '#6ed4a0',
    year:             defaultValues?.year         ?? currentYear(),
    start_month:      defaultValues?.start_month  ?? 1,
    end_month:        defaultValues?.end_month    ?? 12,
    milestone_month:  defaultValues?.milestone_month ?? null,
    password:         '',
    drive_url:        defaultValues?.drive_url    ?? '',
    figma_url:        defaultValues?.figma_url    ?? '',
    description:      defaultValues?.description  ?? '',
    client_email:     defaultValues?.client_email ?? '',
  })

  function set<K extends keyof ProjectFormValues>(key: K, val: ProjectFormValues[K]) {
    setV((prev) => ({ ...prev, [key]: val }))
  }

  // Auto-generate slug from name until user edits it manually
  useEffect(() => {
    if (!slugEdited && v.name) {
      setV((prev) => ({ ...prev, slug: slugify(v.name) }))
    }
  }, [v.name, slugEdited])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await onSubmit(v)
      if (res?.error) {
        setError(res.error)
      } else {
        router.push(isEditing ? '/dashboard?toast=updated' : '/dashboard?toast=created')
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
        router.push('/dashboard?toast=deleted')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">

      {/* ── Informações ──────────────────────────────── */}
      <Section title="Informações do Projeto">
        <Field label="Nome do projeto" required>
          <input
            className={INPUT}
            value={v.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Ex: Yankee App"
            required
          />
        </Field>

        <Field label="Cliente" required>
          <input
            className={INPUT}
            value={v.client}
            onChange={(e) => set('client', e.target.value)}
            placeholder="Ex: Acme Corp"
            required
          />
        </Field>

        <Field label="Slug (URL)" required>
          <input
            className={INPUT}
            value={v.slug}
            onChange={(e) => { setSlugEdited(true); set('slug', e.target.value) }}
            placeholder="ex: yankee-app"
            pattern="[a-z0-9-]+"
            title="Apenas letras minúsculas, números e hífens"
            required
          />
          <span className="text-xs text-muted font-mono">
            Acesso em: /p/{v.slug || '…'}
          </span>
        </Field>
      </Section>

      {/* ── Status e Visual ───────────────────────────── */}
      <Section title="Status e Visual">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Status" required>
            <select
              className={INPUT}
              value={v.status}
              onChange={(e) => set('status', e.target.value as ProjectFormValues['status'])}
            >
              <option value="planned">Planejado</option>
              <option value="active">Ativo</option>
              <option value="review">Revisão</option>
              <option value="done">Concluído</option>
            </select>
          </Field>

          <Field label="Ano" required>
            <input
              type="number"
              className={INPUT}
              value={v.year}
              onChange={(e) => set('year', Number(e.target.value))}
              min={2020}
              max={2099}
              required
            />
          </Field>
        </div>

        <Field label="Cor no Gantt" required>
          <div className="flex items-center gap-2 flex-wrap">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => set('color', c)}
                className="w-7 h-7 rounded-full transition-all"
                style={{
                  backgroundColor: c,
                  outline: v.color === c ? `3px solid ${c}` : 'none',
                  outlineOffset: '2px',
                  opacity: v.color === c ? 1 : 0.6,
                }}
                title={c}
              />
            ))}
            <input
              type="color"
              value={v.color}
              onChange={(e) => set('color', e.target.value)}
              className="w-7 h-7 rounded cursor-pointer border border-border bg-bg"
              title="Cor personalizada"
            />
            <span
              className="text-xs font-mono ml-1"
              style={{ color: v.color }}
            >
              {v.color}
            </span>
          </div>
        </Field>
      </Section>

      {/* ── Cronograma ────────────────────────────────── */}
      <Section title="Cronograma">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Início" required>
            <select
              className={INPUT}
              value={v.start_month}
              onChange={(e) => set('start_month', Number(e.target.value))}
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Término" required>
            <select
              className={INPUT}
              value={v.end_month}
              onChange={(e) => set('end_month', Number(e.target.value))}
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Marco (opcional)">
            <select
              className={INPUT}
              value={v.milestone_month ?? ''}
              onChange={(e) =>
                set('milestone_month', e.target.value ? Number(e.target.value) : null)
              }
            >
              <option value="">—</option>
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      {/* ── Acesso e Notificações ─────────────────────── */}
      <Section title={isEditing ? 'Senha do Cliente' : 'Acesso do Cliente'}>
        <Field
          label={isEditing ? 'Nova senha (deixe em branco para manter)' : 'Senha'}
          required={!isEditing}
        >
          <input
            type="password"
            className={INPUT}
            value={v.password}
            onChange={(e) => set('password', e.target.value)}
            placeholder={isEditing ? '••••••••' : 'Senha de acesso do cliente'}
            required={!isEditing}
          />
        </Field>

        <Field label="E-mail do cliente (notificações)">
          <input
            type="email"
            className={INPUT}
            value={v.client_email}
            onChange={(e) => set('client_email', e.target.value)}
            placeholder="cliente@empresa.com"
          />
          <span className="text-xs text-muted font-mono">
            Usado para notificar ao publicar entregáveis. Tem prioridade sobre o e-mail do cadastro de cliente.
          </span>
        </Field>
      </Section>

      {/* ── Links ─────────────────────────────────────── */}
      <Section title="Links (opcional)">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Google Drive">
            <input
              type="url"
              className={INPUT}
              value={v.drive_url}
              onChange={(e) => set('drive_url', e.target.value)}
              placeholder="https://drive.google.com/…"
            />
          </Field>
          <Field label="Figma">
            <input
              type="url"
              className={INPUT}
              value={v.figma_url}
              onChange={(e) => set('figma_url', e.target.value)}
              placeholder="https://figma.com/…"
            />
          </Field>
        </div>
      </Section>

      {/* ── Descrição ─────────────────────────────────── */}
      <Section title="Descrição (opcional)">
        <textarea
          className={`${INPUT} resize-y min-h-[100px]`}
          value={v.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Briefing, observações e notas sobre o projeto…"
        />
      </Section>

      {/* ── Actions ───────────────────────────────────── */}
      {error && (
        <p className="text-sm text-warn font-mono -mb-4">{error}</p>
      )}

      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 pt-2 border-t border-border">
        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto px-8 py-2.5 rounded-lg text-sm font-bold font-sans bg-accent text-bg hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          {submitting ? 'salvando…' : isEditing ? 'Salvar Alterações' : 'Criar Projeto'}
        </button>

        {isEditing && onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-mono border border-border text-muted hover:text-warn hover:border-warn transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {deleting ? 'deletando…' : 'Deletar Projeto'}
          </button>
        )}

        <a
          href="/dashboard"
          className="sm:ml-auto text-sm text-muted font-mono hover:text-text transition-colors text-center sm:text-left"
        >
          cancelar
        </a>
      </div>

    </form>
  )
}
