'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import type { EmailDispatch, Project } from '@/lib/types'
import { dispatchProjectEmails, previewProjectAccessEmail } from '@/app/(admin)/dashboard/projects/[id]/actions'

// ── Helpers ───────────────────────────────────────────────────

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// ── Props ─────────────────────────────────────────────────────

interface DispatchTabProps {
  projectId:       string
  projectName:     string
  projectSlug:     string
  projectStatus:   Project['status']
  progressPercent: number
  linkedClientEmail?: string | null
  dispatches:      EmailDispatch[]
}

// ── Component ─────────────────────────────────────────────────

export default function DispatchTab({
  projectId,
  projectName,
  projectSlug,
  projectStatus,
  progressPercent,
  linkedClientEmail,
  dispatches,
}: DispatchTabProps) {
  const router = useRouter()

  // Form state
  const [recipients,     setRecipients]     = useState<string[]>([])
  const [inputVal,       setInputVal]       = useState('')
  const [inputError,     setInputError]     = useState('')
  const [password,       setPassword]       = useState('')
  const [showPassword,   setShowPassword]   = useState(false)
  const [customMessage,  setCustomMessage]  = useState('')
  const [sentBy,         setSentBy]         = useState('FSZA WORKS')
  const [sending,        setSending]        = useState(false)
  const [result,         setResult]         = useState<{
    successCount: number
    errorCount:   number
    errors:       { email: string; error: string }[]
  } | null>(null)

  // Preview state
  const [previewHtml,    setPreviewHtml]    = useState('')
  const [previewOpen,    setPreviewOpen]    = useState(false)
  const [loadingPreview, setLoadingPreview] = useState(false)

  // History expand
  const [expandedId,     setExpandedId]     = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)

  // ── Tag input ───────────────────────────────────────────────

  function tryAddEmail(raw: string) {
    const email = raw.trim().replace(/,+$/, '')
    if (!email) return
    if (!isValidEmail(email)) {
      setInputError(`"${email}" não é um e-mail válido`)
      return
    }
    if (recipients.includes(email)) {
      setInputError('E-mail já adicionado')
      setInputVal('')
      return
    }
    if (recipients.length >= 20) {
      setInputError('Máximo de 20 destinatários por disparo')
      return
    }
    setRecipients(prev => [...prev, email])
    setInputVal('')
    setInputError('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      tryAddEmail(inputVal)
    }
    if (e.key === 'Backspace' && inputVal === '' && recipients.length > 0) {
      setRecipients(prev => prev.slice(0, -1))
    }
  }

  function removeTag(email: string) {
    setRecipients(prev => prev.filter(r => r !== email))
  }

  function addLinkedClient() {
    if (!linkedClientEmail) return
    if (recipients.includes(linkedClientEmail)) return
    setRecipients(prev => [...prev, linkedClientEmail])
    setInputError('')
  }

  // ── Preview ─────────────────────────────────────────────────

  async function handlePreview() {
    setLoadingPreview(true)
    try {
      const html = await previewProjectAccessEmail({
        projectName,
        projectSlug,
        projectStatus,
        projectPassword: password || '••••••••',
        progressPercent,
        customMessage:   customMessage || undefined,
        sentBy,
      })
      setPreviewHtml(html)
      setPreviewOpen(true)
    } finally {
      setLoadingPreview(false)
    }
  }

  // ── Dispatch ────────────────────────────────────────────────

  async function handleDispatch() {
    if (recipients.length === 0) return
    if (!password.trim()) {
      setInputError('Informe a senha do projeto')
      return
    }
    setSending(true)
    try {
      const res = await dispatchProjectEmails(
        projectId,
        recipients,
        password,
        customMessage || undefined,
        sentBy || undefined,
      )
      setResult(res)
    } finally {
      setSending(false)
    }
  }

  function resetForm() {
    setRecipients([])
    setInputVal('')
    setPassword('')
    setCustomMessage('')
    setResult(null)
    setInputError('')
    router.refresh()
  }

  // ── Render ──────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">

      {/* ── Formulário de disparo ── */}
      <div
        className="flex flex-col gap-4 p-5 rounded-xl border"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      >
        <h3
          className="text-xs font-mono uppercase tracking-widest"
          style={{ color: 'var(--muted)' }}
        >
          Novo Disparo
        </h3>

        {result ? (
          /* ── Feedback pós-disparo ── */
          <div className="flex flex-col gap-3">
            {result.successCount > 0 && (
              <div
                className="flex items-center gap-2 text-sm font-mono px-4 py-3 rounded-lg"
                style={{ background: 'rgba(110,212,160,0.1)', color: 'var(--success)', border: '1px solid rgba(110,212,160,0.2)' }}
              >
                ✓ {result.successCount} e-mail{result.successCount !== 1 ? 's' : ''} enviado{result.successCount !== 1 ? 's' : ''} com sucesso
              </div>
            )}
            {result.errorCount > 0 && (
              <div
                className="flex flex-col gap-1 text-sm font-mono px-4 py-3 rounded-lg"
                style={{ background: 'rgba(255,107,107,0.1)', color: 'var(--danger)', border: '1px solid rgba(255,107,107,0.2)' }}
              >
                <span>✗ {result.errorCount} falhou</span>
                {result.errors.map(e => (
                  <span key={e.email} className="text-xs" style={{ color: 'var(--muted)' }}>
                    {e.email} — {e.error}
                  </span>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={resetForm}
              className="self-start px-4 py-2 rounded-lg border text-xs font-mono transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
            >
              Novo disparo
            </button>
          </div>
        ) : (
          <>
            {/* Destinatários */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
                Destinatários
              </label>

              {/* Tag input container */}
              <div
                className="flex flex-wrap gap-1.5 min-h-[44px] px-3 py-2 rounded-lg border cursor-text"
                style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
                onClick={() => inputRef.current?.focus()}
              >
                {recipients.map(email => (
                  <span
                    key={email}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono"
                    style={{
                      background:  'rgba(200,240,110,0.12)',
                      color:       'var(--accent)',
                      border:      '1px solid rgba(200,240,110,0.25)',
                    }}
                  >
                    {email}
                    <button
                      type="button"
                      onClick={() => removeTag(email)}
                      className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity"
                      style={{ lineHeight: 1 }}
                    >
                      ✕
                    </button>
                  </span>
                ))}
                <input
                  ref={inputRef}
                  type="text"
                  className="flex-1 min-w-[180px] bg-transparent outline-none text-sm font-mono"
                  style={{ color: 'var(--text)' }}
                  placeholder={recipients.length === 0 ? 'email@exemplo.com — Enter ou vírgula para adicionar' : ''}
                  value={inputVal}
                  onChange={e => { setInputVal(e.target.value); setInputError('') }}
                  onKeyDown={handleKeyDown}
                  onBlur={() => tryAddEmail(inputVal)}
                />
              </div>

              {inputError && (
                <span className="text-xs font-mono" style={{ color: 'var(--danger)' }}>
                  {inputError}
                </span>
              )}

              {linkedClientEmail && !recipients.includes(linkedClientEmail) && (
                <button
                  type="button"
                  onClick={addLinkedClient}
                  className="self-start text-xs font-mono transition-colors"
                  style={{ color: 'var(--accent2)' }}
                >
                  + Adicionar cliente vinculado ({linkedClientEmail})
                </button>
              )}
            </div>

            {/* Senha */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
                Senha do projeto (plain text)
              </label>
              <div className="flex gap-2">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="flex-1 px-4 py-2.5 rounded-lg border text-sm font-mono outline-none transition-colors"
                  style={{ borderColor: 'var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                  placeholder="A senha que você configurou no projeto"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="px-3 py-2 rounded-lg border text-xs font-mono transition-colors"
                  style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
                >
                  {showPassword ? 'ocultar' : 'mostrar'}
                </button>
              </div>
            </div>

            {/* Mensagem opcional */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
                Mensagem personalizada <span style={{ color: 'var(--muted)', opacity: 0.6 }}>(opcional)</span>
              </label>
              <textarea
                className="px-4 py-3 rounded-lg border text-sm font-mono outline-none transition-colors resize-y min-h-[80px]"
                style={{ borderColor: 'var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                placeholder="Olá! Segue o acesso ao projeto…"
                value={customMessage}
                onChange={e => setCustomMessage(e.target.value)}
              />
            </div>

            {/* Enviado por */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
                Enviado por
              </label>
              <input
                type="text"
                className="px-4 py-2.5 rounded-lg border text-sm font-mono outline-none transition-colors"
                style={{ borderColor: 'var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                value={sentBy}
                onChange={e => setSentBy(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-1 flex-wrap">
              <button
                type="button"
                onClick={handlePreview}
                disabled={loadingPreview}
                className="px-4 py-2 rounded-lg border text-xs font-mono transition-colors disabled:opacity-50"
                style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
              >
                {loadingPreview ? 'carregando…' : '👁 Pré-visualizar'}
              </button>

              <button
                type="button"
                onClick={handleDispatch}
                disabled={sending || recipients.length === 0 || !password.trim()}
                className="ml-auto px-5 py-2 rounded-lg text-sm font-bold font-sans transition-opacity disabled:opacity-40"
                style={{ background: 'var(--accent)', color: 'var(--bg)' }}
              >
                {sending
                  ? 'Enviando…'
                  : `Disparar${recipients.length > 0 ? ` (${recipients.length})` : ''} →`}
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── Histórico ── */}
      {dispatches.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3
            className="text-xs font-mono uppercase tracking-widest"
            style={{ color: 'var(--muted)' }}
          >
            Histórico de Disparos
          </h3>

          <div className="flex flex-col gap-2">
            {dispatches.map(d => (
              <div
                key={d.id}
                className="flex flex-col gap-2 px-4 py-3 rounded-lg border"
                style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
              >
                {/* Summary row */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
                    {formatDate(d.sent_at)}
                  </span>
                  <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
                    · enviado por <span style={{ color: 'var(--text)' }}>{d.sent_by}</span>
                  </span>
                  <span
                    className="text-xs font-mono"
                    style={{ color: d.success_count > 0 ? 'var(--success)' : 'var(--muted)' }}
                  >
                    {d.success_count} enviado{d.success_count !== 1 ? 's' : ''}
                  </span>
                  {d.error_count > 0 && (
                    <span className="text-xs font-mono" style={{ color: 'var(--danger)' }}>
                      · {d.error_count} erro{d.error_count !== 1 ? 's' : ''}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setExpandedId(id => id === d.id ? null : d.id)}
                    className="ml-auto text-xs font-mono transition-colors"
                    style={{ color: 'var(--muted)' }}
                  >
                    {expandedId === d.id ? 'ocultar ↑' : 'detalhes ↓'}
                  </button>
                </div>

                {/* Expanded details */}
                {expandedId === d.id && (
                  <div
                    className="flex flex-col gap-2 pt-2 border-t"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <div className="flex flex-wrap gap-1.5">
                      {d.recipients.map(r => (
                        <span
                          key={r}
                          className="text-xs font-mono px-2 py-0.5 rounded-full"
                          style={{
                            background: 'rgba(200,240,110,0.08)',
                            color:      'var(--accent)',
                            border:     '1px solid rgba(200,240,110,0.15)',
                          }}
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                    {d.message && (
                      <p className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
                        "{d.message}"
                      </p>
                    )}
                    {d.errors?.length > 0 && (
                      <div className="flex flex-col gap-0.5">
                        {d.errors.map((e, i) => (
                          <span key={i} className="text-xs font-mono" style={{ color: 'var(--danger)' }}>
                            ✗ {e.email}: {e.error}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Preview modal ── */}
      {previewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(4px)' }}
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl flex flex-col rounded-2xl overflow-hidden"
            style={{
              background:   'var(--surface)',
              border:       '1px solid var(--border)',
              maxHeight:    '85vh',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div
              className="flex items-center justify-between px-5 py-3 border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              <span className="text-xs font-mono uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
                Pré-visualização do E-mail
              </span>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="text-muted hover:text-text transition-colors text-lg leading-none"
              >
                ✕
              </button>
            </div>
            {/* iframe */}
            <iframe
              srcDoc={previewHtml}
              className="w-full flex-1"
              style={{ minHeight: 500, border: 'none', background: '#0a0a0f' }}
              title="Preview do e-mail"
            />
          </div>
        </div>
      )}
    </div>
  )
}
