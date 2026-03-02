'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Deliverable } from '@/lib/types'
import {
  approveDeliverableClientAction,
  rejectDeliverableClientAction,
} from '@/lib/actions'

const STATUS_CONFIG = {
  pending:  { label: 'Aguardando aprovação', color: 'var(--warn)'    },
  approved: { label: 'Aprovado',             color: 'var(--success)' },
  rejected: { label: 'Revisão solicitada',   color: 'var(--danger)'  },
}

interface Props {
  deliverable: Deliverable
  projectSlug: string
}

export default function DeliverableApproval({ deliverable, projectSlug }: Props) {
  const router = useRouter()
  const [rejecting, setRejecting] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')

  const status = STATUS_CONFIG[deliverable.status]

  async function handleApprove() {
    setSaving(true)
    setError('')
    const res = await approveDeliverableClientAction(deliverable.id, projectSlug)
    if (res?.error) {
      setError(res.error)
    } else {
      setConfirmation('Entregável aprovado!')
      router.refresh()
    }
    setSaving(false)
  }

  async function handleReject(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const res = await rejectDeliverableClientAction(deliverable.id, projectSlug, feedback)
    if (res?.error) {
      setError(res.error)
    } else {
      setConfirmation('Revisão solicitada. Aguarde o retorno.')
      setRejecting(false)
      setFeedback('')
      router.refresh()
    }
    setSaving(false)
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-5 flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-sans font-bold text-text">
            {deliverable.title}
          </span>
          {deliverable.description && (
            <p className="text-xs font-mono text-muted leading-relaxed">
              {deliverable.description}
            </p>
          )}
        </div>
        {/* Status badge */}
        <span
          className="text-xs font-mono px-2 py-1 rounded-md shrink-0"
          style={{
            color: status.color,
            background: `color-mix(in srgb, ${status.color} 12%, transparent)`,
          }}
        >
          {status.label}
        </span>
      </div>

      {/* Preview / Download */}
      {(deliverable.preview_url || deliverable.file_url) && (
        <div className="flex gap-2 flex-wrap">
          {deliverable.preview_url && (
            <a
              href={deliverable.preview_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono px-3 py-1.5 rounded-lg border border-border text-text hover:border-accent2 transition-colors"
            >
              👁 Visualizar
            </a>
          )}
          {deliverable.file_url && (
            <a
              href={deliverable.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono px-3 py-1.5 rounded-lg border border-border text-text hover:border-accent transition-colors"
            >
              ↓ Download
            </a>
          )}
        </div>
      )}

      {/* Confirmation message */}
      {confirmation && (
        <p className="text-xs font-mono text-success">{confirmation}</p>
      )}

      {/* Action buttons — only when pending */}
      {deliverable.status === 'pending' && !confirmation && (
        <>
          {!rejecting ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleApprove}
                disabled={saving}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs font-mono font-bold border transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                style={{
                  color: 'var(--success)',
                  borderColor: 'rgba(110,212,160,0.3)',
                  background: 'rgba(110,212,160,0.08)',
                }}
              >
                {saving ? '…' : '✓ Aprovar'}
              </button>
              <button
                onClick={() => setRejecting(true)}
                disabled={saving}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs font-mono border transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                style={{
                  color: 'var(--danger)',
                  borderColor: 'rgba(255,107,107,0.3)',
                  background: 'rgba(255,107,107,0.08)',
                }}
              >
                ✕ Solicitar Revisão
              </button>
            </div>
          ) : (
            <form onSubmit={handleReject} className="flex flex-col gap-2">
              <textarea
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="Descreva o que precisa ser revisado…"
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-bg border border-border text-text font-mono text-sm outline-none focus:border-danger transition-colors resize-y"
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="submit"
                  disabled={saving || !feedback.trim()}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs font-mono border transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                  style={{
                    color: 'var(--danger)',
                    borderColor: 'rgba(255,107,107,0.3)',
                    background: 'rgba(255,107,107,0.08)',
                  }}
                >
                  {saving ? 'enviando…' : 'Enviar revisão'}
                </button>
                <button
                  type="button"
                  onClick={() => { setRejecting(false); setFeedback('') }}
                  disabled={saving}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs font-mono border border-border text-muted hover:text-text transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </>
      )}

      {/* Show existing feedback if rejected */}
      {deliverable.status === 'rejected' && deliverable.client_feedback && (
        <div
          className="rounded-lg px-3 py-2 text-xs font-mono text-muted border"
          style={{ borderColor: 'rgba(255,107,107,0.2)', background: 'rgba(255,107,107,0.05)' }}
        >
          <span className="text-danger">Feedback: </span>
          {deliverable.client_feedback}
        </div>
      )}

      {error && <p className="text-xs font-mono text-danger">{error}</p>}
    </div>
  )
}
