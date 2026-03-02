import type { Task } from '@/lib/types'
import { TASK_STATUS } from '@/lib/constants'

// Colunas visíveis ao cliente: ocultar "A fazer"
const VISIBLE_COLUMNS: Task['status'][] = ['in_progress', 'review', 'done']

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

/**
 * Kanban read-only para a view pública do cliente.
 * Recebe tasks já filtradas por visible_to_client.
 * Oculta "A fazer" e não expõe assignees nem info interna.
 */
export default function ClientTaskBoard({ tasks }: { tasks: Task[] }) {
  // Excluir tarefas com status "todo" — não relevante para o cliente
  const visible = tasks.filter(t => VISIBLE_COLUMNS.includes(t.status))

  if (visible.length === 0) return null

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xs font-mono text-muted uppercase tracking-widest">
        Andamento do Projeto
      </h2>

      {/* Colunas em scroll horizontal (mobile-friendly) */}
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6">
        {VISIBLE_COLUMNS.map(status => {
          const group = visible.filter(t => t.status === status)
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
    </section>
  )
}
