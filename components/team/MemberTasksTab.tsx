import type { Task, Project } from '@/lib/types'

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

interface MemberTasksTabProps {
  tasks: Task[]
  projectMap: Record<string, Project>
}

export default function MemberTasksTab({ tasks, projectMap }: MemberTasksTabProps) {
  if (tasks.length === 0) {
    return (
      <p className="text-sm font-mono text-muted text-center py-6">
        Nenhuma tarefa atribuída.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {tasks.map(task => {
        const project = projectMap[task.project_id]
        return (
          <div
            key={task.id}
            className="flex items-center gap-3 p-4 rounded-xl bg-surface border border-border"
          >
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: STATUS_COLOR[task.status] }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-mono text-text truncate">{task.title}</p>
              {project && (
                <p className="text-xs font-mono text-muted mt-0.5 truncate">{project.name}</p>
              )}
            </div>
            <span
              className="text-xs font-mono shrink-0"
              style={{ color: STATUS_COLOR[task.status] }}
            >
              {STATUS_LABEL[task.status]}
            </span>
          </div>
        )
      })}
    </div>
  )
}
