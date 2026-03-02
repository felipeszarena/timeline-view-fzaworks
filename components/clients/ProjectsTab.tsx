'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Project } from '@/lib/types'
import { linkProjectToClientAction, unlinkProjectFromClientAction } from '@/lib/actions'
import { calcProgress } from '@/lib/utils'

const STATUS_MAP: Record<Project['status'], { label: string; color: string }> = {
  active:  { label: 'Ativo',     color: 'var(--success)' },
  review:  { label: 'Revisão',   color: 'var(--warn)'    },
  planned: { label: 'Planejado', color: 'var(--accent2)' },
  done:    { label: 'Concluído', color: 'var(--muted)'   },
}

interface ProjectsTabProps {
  clientId: string
  linkedProjects: Project[]
  availableProjects: Project[]
}

export default function ProjectsTab({
  clientId,
  linkedProjects,
  availableProjects,
}: ProjectsTabProps) {
  const router = useRouter()
  const [selected, setSelected] = useState('')
  const [linking, setLinking] = useState(false)
  const [error, setError] = useState('')

  async function handleLink() {
    if (!selected) return
    setLinking(true)
    setError('')
    try {
      const res = await linkProjectToClientAction(selected, clientId)
      if (res?.error) {
        setError(res.error)
      } else {
        setSelected('')
        router.refresh()
      }
    } finally {
      setLinking(false)
    }
  }

  async function handleUnlink(projectId: string, projectName: string) {
    if (!confirm(`Desvincular "${projectName}" deste cliente?`)) return
    const res = await unlinkProjectFromClientAction(projectId, clientId)
    if (res?.error) setError(res.error)
    else router.refresh()
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Linked projects */}
      {linkedProjects.length === 0 ? (
        <p className="text-sm font-mono text-muted text-center py-8">
          Nenhum projeto vinculado a este cliente.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {linkedProjects.map(p => {
            const progress = calcProgress(p)
            const status = STATUS_MAP[p.status]
            return (
              <div
                key={p.id}
                className="flex items-center gap-4 px-4 py-3 rounded-lg bg-surface border border-border"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: p.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono text-text truncate">{p.name}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="w-24 h-1 rounded-full overflow-hidden bg-border">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${progress}%`, background: 'var(--accent)' }}
                      />
                    </div>
                    <span className="text-xs font-mono text-muted">{progress}%</span>
                    <span
                      className="text-xs font-mono"
                      style={{ color: status.color }}
                    >
                      {status.label}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleUnlink(p.id, p.name)}
                  className="text-xs font-mono text-muted hover:text-danger transition-colors shrink-0"
                >
                  desvincular
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Link new project */}
      {availableProjects.length > 0 && (
        <div className="flex flex-col gap-3 pt-2 border-t border-border">
          <h3 className="text-xs font-mono text-muted uppercase tracking-widest">
            Vincular Projeto
          </h3>
          <div className="flex gap-2">
            <select
              value={selected}
              onChange={e => setSelected(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-lg bg-bg border border-border text-text font-mono text-sm outline-none focus:border-accent transition-colors"
            >
              <option value="">Selecionar projeto…</option>
              {availableProjects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}{p.client ? ` — ${p.client}` : ''}
                </option>
              ))}
            </select>
            <button
              onClick={handleLink}
              disabled={!selected || linking}
              className="px-5 py-2.5 rounded-lg bg-accent text-bg text-sm font-bold font-sans hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {linking ? 'vinculando…' : 'Vincular'}
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-warn font-mono">{error}</p>}
    </div>
  )
}
