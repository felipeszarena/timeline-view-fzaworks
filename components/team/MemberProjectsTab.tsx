'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Project } from '@/lib/types'
import { addProjectTeamAction, removeProjectTeamAction } from '@/lib/actions'
import { calcProgress } from '@/lib/utils'

const STATUS_CONFIG = {
  active:  { label: 'Ativo',     color: 'var(--success)' },
  review:  { label: 'Revisão',   color: 'var(--warn)'    },
  planned: { label: 'Planejado', color: 'var(--accent2)' },
  done:    { label: 'Concluído', color: 'var(--muted)'   },
}

interface MemberProjectsTabProps {
  memberId: string
  linkedProjects: Project[]
  availableProjects: Project[]
}

export default function MemberProjectsTab({
  memberId,
  linkedProjects,
  availableProjects,
}: MemberProjectsTabProps) {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleAdd() {
    if (!selectedId) return
    setLoading(true)
    await addProjectTeamAction(selectedId, memberId)
    setSelectedId('')
    setLoading(false)
    router.refresh()
  }

  async function handleRemove(projectId: string) {
    if (!confirm('Remover projeto deste membro?')) return
    await removeProjectTeamAction(projectId, memberId)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-6">
      {linkedProjects.length === 0 ? (
        <p className="text-sm font-mono text-muted text-center py-6">
          Nenhum projeto vinculado.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {linkedProjects.map(p => {
            const pct = calcProgress(p)
            const s = STATUS_CONFIG[p.status]
            return (
              <div
                key={p.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-border"
              >
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/dashboard/projects/${p.id}`}
                    className="text-sm font-sans font-semibold text-text hover:text-accent transition-colors truncate block"
                  >
                    {p.name}
                  </Link>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-mono" style={{ color: s.color }}>
                      {s.label}
                    </span>
                    <span className="text-xs font-mono text-muted">{pct}%</span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(p.id)}
                  className="text-xs font-mono text-muted hover:text-danger transition-colors shrink-0 cursor-pointer"
                >
                  remover
                </button>
              </div>
            )
          })}
        </div>
      )}

      {availableProjects.length > 0 && (
        <div className="flex gap-2 items-center">
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg bg-bg border border-border text-text font-mono text-sm outline-none focus:border-accent transition-colors"
          >
            <option value="">Vincular projeto…</option>
            {availableProjects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            disabled={!selectedId || loading}
            className="px-4 py-2 rounded-lg text-sm font-mono bg-surface border border-border text-text hover:border-accent transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? '…' : 'Vincular'}
          </button>
        </div>
      )}
    </div>
  )
}
