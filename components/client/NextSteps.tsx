import type { Task } from '@/lib/types'

const STATUS_LABEL: Record<Task['status'], string> = {
  todo:        'A fazer',
  in_progress: 'Em andamento',
  review:      'Revisão',
  done:        'Concluído',
}

const STATUS_COLOR: Record<Task['status'], string> = {
  todo:        'var(--muted)',
  in_progress: 'var(--warn)',
  review:      'var(--accent2)',
  done:        'var(--success)',
}

export default function NextSteps({ tasks }: { tasks: Task[] }) {
  const visible = tasks.filter(t => t.visible_to_client)
  if (visible.length === 0) return null

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xs font-mono text-muted uppercase tracking-widest">
        Próximos Passos
      </h2>
      <div className="flex flex-col gap-2">
        {visible.map(task => (
          <div
            key={task.id}
            className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3"
          >
            {/* Status dot */}
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: STATUS_COLOR[task.status] }}
            />
            <span className="flex-1 text-sm font-mono text-text">
              {task.title}
            </span>
            <span
              className="text-xs font-mono shrink-0"
              style={{ color: STATUS_COLOR[task.status] }}
            >
              {STATUS_LABEL[task.status]}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
