'use client'

import { useState } from 'react'
import type { Task } from '@/lib/types'
import { TASK_STATUS } from '@/lib/constants'

const COLUMNS: Task['status'][] = ['todo', 'in_progress', 'review', 'done']

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export default function ClientTaskListView({ tasks }: { tasks: Task[] }) {
  const [collapsed, setCollapsed] = useState<Partial<Record<Task['status'], boolean>>>({})

  function toggle(status: Task['status']) {
    setCollapsed(prev => ({ ...prev, [status]: !prev[status] }))
  }

  return (
    <div className="flex flex-col gap-2">
      {COLUMNS.map(status => {
        const group = tasks.filter(t => t.status === status)
        if (group.length === 0) return null

        const cfg = TASK_STATUS[status]
        const isCollapsed = !!collapsed[status]

        return (
          <div key={status} className="flex flex-col">
            {/* Group header — toggle collapse */}
            <button
              type="button"
              onClick={() => toggle(status)}
              className="flex items-center gap-2 py-2 px-1 text-left w-full rounded transition-colors hover:bg-surface"
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: cfg.color }}
              />
              <span
                className="text-xs font-mono font-semibold"
                style={{ color: cfg.color }}
              >
                {cfg.label}
              </span>
              <span className="text-xs font-mono text-muted">· {group.length}</span>
              <span className="ml-auto text-xs font-mono text-muted opacity-50">
                {isCollapsed ? '▶' : '▼'}
              </span>
            </button>

            {/* Task rows */}
            {!isCollapsed && (
              <div
                className="flex flex-col gap-1 pl-4 mb-2"
                style={{ borderLeft: `2px solid ${cfg.color}25` }}
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
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg border"
                      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
                    >
                      {/* Color dot */}
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: taskColor }}
                      />

                      {/* Title */}
                      <span
                        className={`flex-1 text-sm font-mono min-w-0 truncate ${
                          task.status === 'done' ? 'line-through text-muted' : 'text-text'
                        }`}
                      >
                        {task.title}
                      </span>

                      {/* Due date */}
                      {task.due_date && (
                        <span
                          className="text-xs font-mono shrink-0"
                          style={{ color: isOverdue ? 'var(--danger)' : 'var(--muted)' }}
                        >
                          {formatDate(task.due_date)}
                          {isOverdue && ' ⚠'}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
