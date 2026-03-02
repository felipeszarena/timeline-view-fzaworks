'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Deliverable } from '@/lib/types'
import {
  createDeliverableAction, updateDeliverableAction, deleteDeliverableAction,
} from '@/lib/actions'

const STATUS_MAP: Record<Deliverable['status'], { label: string; color: string }> = {
  pending:  { label: 'Aguardando', color: 'var(--warn)'    },
  approved: { label: 'Aprovado',   color: 'var(--success)' },
  rejected: { label: 'Revisão',    color: 'var(--danger)'  },
}

const INPUT =
  'w-full px-4 py-2.5 rounded-lg bg-bg border border-border text-text font-mono text-sm outline-none focus:border-accent transition-colors'

export default function DeliverablesTab({
  projectId,
  deliverables,
}: {
  projectId: string
  deliverables: Deliverable[]
}) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [emailStatus, setEmailStatus] = useState<'sent' | 'missing' | null>(null)

  function resetForm() {
    setTitle('')
    setDescription('')
    setFileUrl('')
    setPreviewUrl('')
    setShowForm(false)
    setEmailStatus(null)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    setError('')
    try {
      const res = await createDeliverableAction(projectId, {
        title,
        description: description || undefined,
        file_url: fileUrl || undefined,
        preview_url: previewUrl || undefined,
      })
      if (res?.error) {
        setError(res.error)
      } else {
        setEmailStatus(res.emailSent ? 'sent' : 'missing')
        setTitle('')
        setDescription('')
        setFileUrl('')
        setPreviewUrl('')
        setShowForm(false)
        router.refresh()
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleStatus(d: Deliverable, status: Deliverable['status']) {
    await updateDeliverableAction(d.id, { status }, projectId)
    router.refresh()
  }

  async function handleDelete(d: Deliverable) {
    if (!confirm(`Deletar "${d.title}"?`)) return
    await deleteDeliverableAction(d.id, projectId)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-4">

      {/* E-mail feedback banner */}
      {emailStatus === 'sent' && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-mono"
          style={{ borderColor: 'var(--success)', color: 'var(--success)', background: 'rgba(110,212,160,0.08)' }}>
          <span>✉</span>
          <span>Entregável criado — notificação enviada ao cliente.</span>
          <button onClick={() => setEmailStatus(null)} className="ml-auto opacity-60 hover:opacity-100">✕</button>
        </div>
      )}
      {emailStatus === 'missing' && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-mono"
          style={{ borderColor: 'var(--warn)', color: 'var(--warn)', background: 'rgba(240,193,75,0.08)' }}>
          <span>⚠</span>
          <span>Entregável criado — nenhum e-mail configurado para este projeto.</span>
          <button onClick={() => setEmailStatus(null)} className="ml-auto opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {deliverables.length === 0 && !showForm && (
        <p className="text-sm font-mono text-muted text-center py-8">
          Nenhum entregável cadastrado.
        </p>
      )}

      {deliverables.length > 0 && (
        <div className="flex flex-col gap-3">
          {deliverables.map(d => {
            const s = STATUS_MAP[d.status]
            return (
              <div
                key={d.id}
                className="flex flex-col gap-2 px-4 py-3 rounded-lg bg-surface border border-border"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono text-text">{d.title}</p>
                    {d.description && (
                      <p className="text-xs font-mono text-muted mt-0.5">{d.description}</p>
                    )}
                  </div>
                  <span
                    className="text-xs font-mono px-2 py-0.5 rounded shrink-0"
                    style={{ color: s.color, background: `${s.color}20` }}
                  >
                    {s.label}
                  </span>
                  <button
                    onClick={() => handleDelete(d)}
                    type="button"
                    className="text-xs font-mono text-muted hover:text-danger transition-colors shrink-0"
                  >
                    ✕
                  </button>
                </div>

                {(d.file_url || d.preview_url) && (
                  <div className="flex gap-3 text-xs font-mono">
                    {d.file_url && (
                      <a
                        href={d.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-accent hover:underline"
                      >
                        arquivo ↗
                      </a>
                    )}
                    {d.preview_url && (
                      <a
                        href={d.preview_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-accent2 hover:underline"
                      >
                        preview ↗
                      </a>
                    )}
                  </div>
                )}

                {d.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatus(d, 'approved')}
                      type="button"
                      className="text-xs font-mono px-3 py-1 rounded border transition-colors"
                      style={{
                        borderColor: 'var(--success)',
                        color: 'var(--success)',
                      }}
                    >
                      Aprovar
                    </button>
                    <button
                      onClick={() => handleStatus(d, 'rejected')}
                      type="button"
                      className="text-xs font-mono px-3 py-1 rounded border transition-colors"
                      style={{
                        borderColor: 'var(--danger)',
                        color: 'var(--danger)',
                      }}
                    >
                      Solicitar revisão
                    </button>
                  </div>
                )}
                {(d.status === 'approved' || d.status === 'rejected') && (
                  <button
                    onClick={() => handleStatus(d, 'pending')}
                    type="button"
                    className="text-xs font-mono text-muted hover:text-text transition-colors w-fit"
                  >
                    ← voltar a pendente
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showForm ? (
        <form
          onSubmit={handleCreate}
          className="flex flex-col gap-3 border-t border-border pt-4"
        >
          <h3 className="text-xs font-mono text-muted uppercase tracking-widest">
            Novo Entregável
          </h3>
          <input
            autoFocus
            className={INPUT}
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Título"
            required
          />
          <input
            className={INPUT}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Descrição (opcional)"
          />
          <input
            type="url"
            className={INPUT}
            value={fileUrl}
            onChange={e => setFileUrl(e.target.value)}
            placeholder="URL do arquivo (opcional)"
          />
          <input
            type="url"
            className={INPUT}
            value={previewUrl}
            onChange={e => setPreviewUrl(e.target.value)}
            placeholder="URL de preview (opcional)"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-lg bg-accent text-bg text-sm font-bold font-sans hover:opacity-90 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {saving ? 'salvando…' : 'Criar Entregável'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2.5 rounded-lg border border-border text-sm font-mono text-muted hover:text-text transition-colors"
            >
              cancelar
            </button>
          </div>
          {error && <p className="text-sm text-warn font-mono">{error}</p>}
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          type="button"
          className="text-sm font-mono text-muted hover:text-accent transition-colors text-left w-fit"
        >
          + Novo Entregável
        </button>
      )}
    </div>
  )
}
