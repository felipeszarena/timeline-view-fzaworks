'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ProjectUpdate } from '@/lib/types'
import { createProjectUpdateAction, deleteProjectUpdateAction } from '@/lib/actions'

export default function UpdatesTab({
  projectId,
  updates,
}: {
  projectId: string
  updates: ProjectUpdate[]
}) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [author, setAuthor] = useState('Admin')
  const [visibleToClient, setVisibleToClient] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setSaving(true)
    setError('')
    try {
      const res = await createProjectUpdateAction(projectId, {
        content,
        author,
        visible_to_client: visibleToClient,
      })
      if (res?.error) {
        setError(res.error)
      } else {
        setContent('')
        setVisibleToClient(false)
        router.refresh()
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(updateId: string) {
    if (!confirm('Deletar esta atualização?')) return
    await deleteProjectUpdateAction(updateId, projectId)
    router.refresh()
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  }

  return (
    <div className="flex flex-col gap-6">

      {/* New update form */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 p-4 rounded-xl border border-border bg-surface"
      >
        <textarea
          className="w-full px-4 py-3 rounded-lg bg-bg border border-border text-text font-mono text-sm outline-none focus:border-accent transition-colors resize-y min-h-[100px]"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Descreva o progresso, alterações ou comunicados…"
        />
        <div className="flex flex-wrap items-center gap-3">
          <input
            className="px-4 py-2 rounded-lg bg-bg border border-border text-text font-mono text-sm outline-none focus:border-accent transition-colors w-36"
            value={author}
            onChange={e => setAuthor(e.target.value)}
            placeholder="Autor"
          />
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={visibleToClient}
              onChange={e => setVisibleToClient(e.target.checked)}
              className="accent-accent w-4 h-4"
            />
            <span className="text-xs font-mono text-muted">Visível ao cliente</span>
          </label>
          <button
            type="submit"
            disabled={saving || !content.trim()}
            className="ml-auto px-6 py-2 rounded-lg bg-accent text-bg text-sm font-bold font-sans hover:opacity-90 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {saving ? 'publicando…' : 'Publicar'}
          </button>
        </div>
        {error && <p className="text-sm text-warn font-mono">{error}</p>}
      </form>

      {/* Feed */}
      {updates.length === 0 ? (
        <p className="text-sm font-mono text-muted text-center py-6">
          Nenhuma atualização publicada.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {updates.map(u => (
            <div
              key={u.id}
              className="flex flex-col gap-2 px-4 py-3 rounded-lg bg-surface border border-border"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono text-accent font-bold">{u.author}</span>
                <span className="text-xs font-mono text-muted">{formatDate(u.created_at)}</span>
                {u.visible_to_client && (
                  <span
                    className="text-xs font-mono"
                    style={{ color: 'var(--success)' }}
                  >
                    visível ao cliente
                  </span>
                )}
                <button
                  onClick={() => handleDelete(u.id)}
                  type="button"
                  className="ml-auto text-xs font-mono text-muted hover:text-danger transition-colors"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm font-mono text-text whitespace-pre-line">{u.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
