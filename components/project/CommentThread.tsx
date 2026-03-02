'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Comment } from '@/lib/types'
import { createCommentAction, deleteCommentAction } from '@/lib/actions'

// ── Helpers ───────────────────────────────────────────────────

const AVATAR_COLORS = [
  '#c8f06e', '#7b6ef6', '#6ed4a0', '#f0c14b', '#6eb4f0', '#f0a06e',
]

function authorColor(author: string): string {
  let hash = 0
  for (let i = 0; i < author.length; i++) {
    hash = author.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function relativeDate(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffSec = Math.floor((now - then) / 1000)
  if (diffSec < 60)   return 'agora mesmo'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60)   return `há ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24)     return `há ${diffH}h`
  const diffD = Math.floor(diffH / 24)
  if (diffD === 1)    return 'ontem'
  if (diffD < 7)      return `há ${diffD} dias`
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short',
  })
}

// ── Sub-components ────────────────────────────────────────────

function Avatar({ author }: { author: string }) {
  const color = authorColor(author)
  const initial = author.charAt(0).toUpperCase()
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-sans shrink-0 text-bg"
      style={{ background: color }}
    >
      {initial}
    </div>
  )
}

function CommentItem({
  comment,
  onDelete,
}: {
  comment: Comment
  onDelete: (id: string) => void
}) {
  return (
    <div className="flex gap-3">
      <Avatar author={comment.author} />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-sm font-mono font-bold text-text">
            {comment.author}
          </span>
          <span
            className="text-xs font-mono text-muted"
            title={new Date(comment.created_at).toLocaleString('pt-BR')}
          >
            {relativeDate(comment.created_at)}
          </span>
          <button
            onClick={() => onDelete(comment.id)}
            type="button"
            className="ml-auto text-xs font-mono text-muted hover:text-danger transition-colors shrink-0"
            title="Deletar comentário"
          >
            ✕
          </button>
        </div>
        <p className="text-sm font-mono text-text whitespace-pre-line leading-relaxed">
          {comment.content}
        </p>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────

interface CommentThreadProps {
  projectId: string
  comments: Comment[]
}

export default function CommentThread({ projectId, comments }: CommentThreadProps) {
  const router = useRouter()
  const [author, setAuthor] = useState('Admin')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setSaving(true)
    setError('')
    try {
      const res = await createCommentAction(projectId, { author, content })
      if (res?.error) {
        setError(res.error)
      } else {
        setContent('')
        router.refresh()
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(commentId: string) {
    if (!confirm('Deletar comentário?')) return
    await deleteCommentAction(commentId, projectId)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Internal-only notice */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border"
        style={{ borderColor: 'rgba(240,193,75,0.25)' }}
      >
        <span className="text-xs font-mono text-warn">
          🔒 Comentários internos — nunca visíveis ao cliente
        </span>
      </div>

      {/* Thread */}
      {comments.length === 0 ? (
        <p className="text-sm font-mono text-muted text-center py-6">
          Nenhum comentário ainda. Seja o primeiro!
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          {comments.map(c => (
            <CommentItem key={c.id} comment={c} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-border" />

      {/* New comment form */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <Avatar author={author || '?'} />
        <div className="flex-1 flex flex-col gap-2">
          <input
            className="w-32 px-3 py-1.5 rounded-lg bg-bg border border-border text-text font-mono text-sm outline-none focus:border-accent transition-colors"
            value={author}
            onChange={e => setAuthor(e.target.value)}
            placeholder="Seu nome"
            required
          />
          <textarea
            className="w-full px-4 py-3 rounded-lg bg-bg border border-border text-text font-mono text-sm outline-none focus:border-accent transition-colors resize-y min-h-[80px]"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Escreva um comentário interno…"
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                if (content.trim() && !saving) handleSubmit(e as unknown as React.FormEvent)
              }
            }}
          />
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving || !content.trim()}
              className="px-5 py-2 rounded-lg bg-surface border border-border text-text text-sm font-mono hover:border-accent transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {saving ? 'enviando…' : 'Comentar'}
            </button>
            <span className="text-xs font-mono text-muted">
              Ctrl+Enter para enviar
            </span>
            {error && <span className="text-xs font-mono text-warn">{error}</span>}
          </div>
        </div>
      </form>

    </div>
  )
}
