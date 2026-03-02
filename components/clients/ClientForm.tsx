'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Client, ClientFormValues } from '@/lib/types'
import { slugify } from '@/lib/utils'

const INPUT =
  'w-full px-4 py-2.5 rounded-lg bg-bg border border-border text-text font-mono text-sm outline-none focus:border-accent transition-colors'

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
  label, required, hint, children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-muted font-mono">
        {label}
        {required && <span className="text-warn ml-1">*</span>}
      </label>
      {children}
      {hint && <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>{hint}</span>}
    </div>
  )
}

interface ClientFormProps {
  defaultValues?: Partial<Client>
  isEditing?: boolean
  onSubmit: (data: ClientFormValues) => Promise<{ error?: string; generatedPassword?: string }>
  onDelete?: () => Promise<{ error?: string }>
  onResetPortalPassword?: () => Promise<{ error?: string; generatedPassword?: string }>
  redirectOnSave?: string
}

export default function ClientForm({
  defaultValues,
  isEditing = false,
  onSubmit,
  onDelete,
  onResetPortalPassword,
  redirectOnSave,
}: ClientFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [error, setError] = useState('')
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null)
  const [showResetForm, setShowResetForm] = useState(false)
  const [copied, setCopied] = useState(false)

  const [v, setV] = useState<ClientFormValues>({
    name:            defaultValues?.name      ?? '',
    company:         defaultValues?.company   ?? '',
    email:           defaultValues?.email     ?? '',
    phone:           defaultValues?.phone     ?? '',
    whatsapp:        defaultValues?.whatsapp  ?? '',
    instagram:       defaultValues?.instagram ?? '',
    website:         defaultValues?.website   ?? '',
    cnpj_cpf:        defaultValues?.cnpj_cpf  ?? '',
    address:         defaultValues?.address   ?? '',
    notes:           defaultValues?.notes     ?? '',
    slug:            defaultValues?.slug      ?? '',
    portal_password: '',
  })

  function set<K extends keyof ClientFormValues>(key: K, val: string) {
    setV((prev) => ({ ...prev, [key]: val }))
  }

  // Auto-gera slug quando o nome muda (só em criação e se slug ainda estiver vazio)
  function handleNameChange(name: string) {
    set('name', name)
    if (!isEditing && !v.slug) {
      set('slug', slugify(name))
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await onSubmit(v)
      if (res?.error) {
        setError(res.error)
      } else if (res?.generatedPassword) {
        // Senha gerada automaticamente — mostrar antes de redirecionar
        setGeneratedPassword(res.generatedPassword)
      } else {
        router.push(
          redirectOnSave ??
          (isEditing
            ? `/dashboard/clients/${defaultValues?.id}?toast=updated`
            : '/dashboard/clients?toast=created')
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResetPassword() {
    if (!onResetPortalPassword) return
    setResetting(true)
    setError('')
    try {
      const res = await onResetPortalPassword()
      if (res?.error) {
        setError(res.error)
      } else if (res?.generatedPassword) {
        setGeneratedPassword(res.generatedPassword)
        setShowResetForm(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao redefinir senha')
    } finally {
      setResetting(false)
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
        router.push('/dashboard/clients?toast=deleted')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar')
    } finally {
      setDeleting(false)
    }
  }

  // ── Modal: senha gerada automaticamente ─────────────────────
  if (generatedPassword) {
    const redirectTarget =
      redirectOnSave ??
      (isEditing
        ? `/dashboard/clients/${defaultValues?.id}?toast=updated`
        : '/dashboard/clients?toast=created')

    return (
      <div className="flex flex-col items-center gap-6 py-12 max-w-md mx-auto text-center">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
          style={{ background: 'rgba(110,212,160,0.15)', color: 'var(--success)' }}
        >
          🔑
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-display font-bold text-text">
            Portal configurado!
          </h2>
          <p className="text-sm font-mono text-muted">
            Anote a senha do portal — ela não será exibida novamente.
          </p>
        </div>

        <div
          className="w-full flex items-center justify-between gap-3 px-5 py-4 rounded-xl border"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <code className="text-xl font-mono tracking-widest text-text select-all">
            {generatedPassword}
          </code>
          <button
            type="button"
            onClick={() => copyToClipboard(generatedPassword)}
            className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors"
            style={{
              background: copied ? 'rgba(110,212,160,0.15)' : 'var(--border)',
              color: copied ? 'var(--success)' : 'var(--text)',
            }}
          >
            {copied ? '✓ copiado' : 'copiar'}
          </button>
        </div>

        <p className="text-xs font-mono text-muted">
          Portal: <span className="text-accent">/client-portal/{v.slug || slugify(v.name)}</span>
        </p>

        <button
          type="button"
          onClick={() => router.push(redirectTarget)}
          className="w-full py-3 rounded-xl text-sm font-bold font-sans"
          style={{ background: 'var(--accent)', color: 'var(--bg)' }}
        >
          Continuar →
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">

      {/* ── 2 colunas: Contato | Redes & Outros ─────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Coluna esquerda — dados de contato */}
        <Section title="Dados de Contato">
          <Field label="Nome" required>
            <input
              className={INPUT}
              value={v.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ex: João Silva"
              required
            />
          </Field>

          <Field label="Empresa">
            <input
              className={INPUT}
              value={v.company}
              onChange={(e) => set('company', e.target.value)}
              placeholder="Ex: Acme Ltda"
            />
          </Field>

          <Field label="E-mail">
            <input
              type="email"
              className={INPUT}
              value={v.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="contato@empresa.com"
            />
          </Field>

          <Field label="Telefone">
            <input
              type="tel"
              className={INPUT}
              value={v.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="+55 11 9 9999-9999"
            />
          </Field>

          <Field label="WhatsApp">
            <input
              type="tel"
              className={INPUT}
              value={v.whatsapp}
              onChange={(e) => set('whatsapp', e.target.value)}
              placeholder="+55 11 9 9999-9999"
            />
          </Field>
        </Section>

        {/* Coluna direita — redes sociais e outros */}
        <Section title="Redes Sociais & Outros">
          <Field label="Instagram" hint="Somente o @handle">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted font-mono text-sm">@</span>
              <input
                className={`${INPUT} pl-7`}
                value={v.instagram.replace(/^@/, '')}
                onChange={(e) => set('instagram', e.target.value.replace(/^@/, ''))}
                placeholder="handle"
              />
            </div>
          </Field>

          <Field label="Website">
            <input
              type="url"
              className={INPUT}
              value={v.website}
              onChange={(e) => set('website', e.target.value)}
              placeholder="https://empresa.com"
            />
          </Field>

          <Field label="CNPJ / CPF">
            <input
              className={INPUT}
              value={v.cnpj_cpf}
              onChange={(e) => set('cnpj_cpf', e.target.value)}
              placeholder="00.000.000/0001-00"
            />
          </Field>

          <Field label="Endereço">
            <textarea
              className={`${INPUT} resize-none h-[88px]`}
              value={v.address}
              onChange={(e) => set('address', e.target.value)}
              placeholder="Rua, número, cidade — UF"
            />
          </Field>
        </Section>
      </div>

      {/* ── Notas (largura total) ──────────────────────── */}
      <Section title="Notas">
        <textarea
          className={`${INPUT} resize-y min-h-[120px]`}
          value={v.notes}
          onChange={(e) => set('notes', e.target.value)}
          placeholder="Anotações gerais, briefing, histórico do cliente…"
        />
      </Section>

      {/* ── Portal do Cliente ─────────────────────────── */}
      <Section title="Portal do Cliente">
        <Field
          label="Slug do portal"
          hint={`URL: /client-portal/${v.slug || slugify(v.name) || 'slug'}`}
        >
          <input
            className={INPUT}
            value={v.slug}
            onChange={(e) => set('slug', slugify(e.target.value))}
            placeholder={v.name ? slugify(v.name) : 'ex: joice-pereira'}
          />
        </Field>

        {!isEditing ? (
          <Field
            label="Senha do portal"
            hint="Deixe em branco para gerar automaticamente (8 caracteres)."
          >
            <input
              type="password"
              className={INPUT}
              value={v.portal_password}
              onChange={(e) => set('portal_password', e.target.value)}
              placeholder="Deixe em branco para gerar"
              autoComplete="new-password"
            />
          </Field>
        ) : (
          <div className="flex flex-col gap-2">
            {!showResetForm ? (
              <button
                type="button"
                onClick={() => setShowResetForm(true)}
                className="text-sm font-mono text-muted hover:text-accent2 transition-colors w-fit"
              >
                🔑 Redefinir senha do portal
              </button>
            ) : (
              <div
                className="flex flex-col gap-3 p-4 rounded-lg border"
                style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
              >
                <p className="text-xs font-mono text-muted">
                  Uma nova senha aleatória será gerada e exibida uma única vez.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={resetting}
                    className="px-4 py-2 rounded-lg text-xs font-mono border transition-colors disabled:opacity-50"
                    style={{ borderColor: 'var(--accent2)', color: 'var(--accent2)' }}
                  >
                    {resetting ? 'gerando…' : 'Gerar nova senha'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResetForm(false)}
                    className="px-4 py-2 rounded-lg text-xs font-mono border border-border text-muted hover:text-text transition-colors"
                  >
                    cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Mostrar senha redefinida inline (na edição) */}
            {generatedPassword && (
              <div
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg border"
                style={{ borderColor: 'var(--success)', background: 'rgba(110,212,160,0.07)' }}
              >
                <span className="text-xs font-mono text-muted">Nova senha:</span>
                <code className="font-mono text-base tracking-widest text-text">
                  {generatedPassword}
                </code>
                <button
                  type="button"
                  onClick={() => copyToClipboard(generatedPassword)}
                  className="text-xs font-mono px-2 py-1 rounded transition-colors"
                  style={{
                    background: copied ? 'rgba(110,212,160,0.2)' : 'var(--border)',
                    color: copied ? 'var(--success)' : 'var(--text)',
                  }}
                >
                  {copied ? '✓' : 'copiar'}
                </button>
              </div>
            )}
          </div>
        )}
      </Section>

      {/* ── Ações ─────────────────────────────────────── */}
      {error && (
        <p className="text-sm text-warn font-mono -mb-4">{error}</p>
      )}

      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 pt-2 border-t border-border">
        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto px-8 py-2.5 rounded-lg text-sm font-bold font-sans bg-accent text-bg hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          {submitting ? 'salvando…' : isEditing ? 'Salvar Alterações' : 'Criar Cliente'}
        </button>

        {isEditing && onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-mono border border-border text-muted hover:text-danger hover:border-danger transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            style={{ '--tw-border-opacity': '1' } as React.CSSProperties}
          >
            {deleting ? 'deletando…' : 'Deletar Cliente'}
          </button>
        )}

        <a
          href={isEditing ? `/dashboard/clients/${defaultValues?.id}` : '/dashboard/clients'}
          className="sm:ml-auto text-sm text-muted font-mono hover:text-text transition-colors text-center sm:text-left"
        >
          cancelar
        </a>
      </div>

    </form>
  )
}
