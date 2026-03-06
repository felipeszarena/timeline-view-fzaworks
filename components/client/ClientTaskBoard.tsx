'use client'

import { useState, useEffect } from 'react'
import type { Task } from '@/lib/types'
import { TASK_STATUS } from '@/lib/constants'
import ClientTaskListView from './ClientTaskListView'

// Kanban mostra apenas tasks em progresso (sem "A fazer")
const KANBAN_COLUMNS: Task['status'][] = ['in_progress', 'review', 'done']

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

interface ClientTaskBoardProps {
  tasks: Task[]
  slug: string
}

/**
 * Kanban/Lista read-only para a view pública do cliente.
 * Recebe tasks já filtradas por visible_to_client.
 * Não expõe assignees nem info interna.
 */
export default function ClientTaskBoard({ tasks, slug }: ClientTaskBoardProps) {
  const storageKey = `client-tasks-view-${slug}`

  const [view, setView] = useState<'kanban' | 'list'>('kanban')

  // Carrega preferência salva após mount (evita hydration mismatch)
  useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved === 'kanban' || saved === 'list') setView(saved)
  }, [storageKey])

  function switchView(v: 'kanban' | 'list') {
    setView(v)
    localStorage.setItem(storageKey, v)
  }

  if (tasks.length === 0) return null

  return (
    <section className="flex flex-col gap-4">
      {/* Header com toggle */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs font-mono text-muted uppercase tracking-widest">
          Andamento do Projeto
        </h2>

        <div
          className="flex items-center gap-0.5 p-1 rounded-lg border"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          {(['kanban', 'list'] as const).map(v => (
            <button
              key={v}
              type="button"
              onClick={() => switchView(v)}
              className="px-3 py-1 rounded-md text-xs font-mono transition-colors"
              style={{
                background: view === v ? 'var(--accent)' : 'transparent',
                color: view === v ? 'var(--bg)' : 'var(--muted)',
              }}
            >
              {v === 'kanban' ? 'Kanban' : 'Lista'}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban view */}
      {view === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6">
          {KANBAN_COLUMNS.map(status => {
            const group = tasks.filter(t => t.status === status)
            if (group.length === 0) return null

            const cfg = TASK_STATUS[status]

            return (
              <div
                key={status}
                className="flex flex-col gap-2 min-w-[260px] flex-shrink-0"
              >
                {/* Column header */}
                <div className="flex items-center gap-1.5 px-1">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: cfg.color }}
                  />
                  <span
                    className="text-xs font-mono font-medium"
                    style={{ color: cfg.color }}
                  >
                    {cfg.label}
                  </span>
                  <span className="text-xs font-mono text-muted">
                    · {group.length}
                  </span>
                </div>

                {/* Task cards */}
                <div
                  className="flex flex-col gap-2 rounded-xl p-2"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {group.map(task => {
                    const isOverdue =
                      !!task.due_date &&
                      task.status !== 'done' &&
                      new Date(task.due_date) < new Date()

                    const taskColor = task.color ?? cfg.color

                    return (
                      <div
                        key={task.id}
                        className="flex flex-col gap-1.5 px-3 py-2.5 rounded-lg border"
                        style={{
                          background: 'var(--bg)',
                          borderColor: 'var(--border)',
                          borderLeft: `3px solid ${taskColor}`,
                        }}
                      >
                        {/* Title */}
                        <span
                          className={`text-sm font-mono leading-snug ${
                            task.status === 'done' ? 'line-through text-muted' : 'text-text'
                          }`}
                        >
                          {task.title}
                        </span>

                        {/* Due date */}
                        {task.due_date && (
                          <span
                            className="text-xs font-mono"
                            style={{ color: isOverdue ? 'var(--danger)' : 'var(--muted)' }}
                          >
                            Prazo: {formatDate(task.due_date)}
                            {isOverdue && ' · vencido'}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Lista view */}
      {view === 'list' && (
        <ClientTaskListView tasks={tasks} />
      )}
    </section>
  )
}
