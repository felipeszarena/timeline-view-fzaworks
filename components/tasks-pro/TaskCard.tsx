'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { Task, TeamMember } from '@/lib/types'
import { TASK_STATUS } from '@/lib/constants'

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

interface TaskCardProps {
  task: Task
  teamMembers?: TeamMember[]
  /** Quando true, renderizado dentro do DragOverlay — sem interação */
  isDragging?: boolean
  onEdit?: (task: Task) => void
}

export default function TaskCard({
  task,
  teamMembers = [],
  isDragging = false,
  onEdit,
}: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
    data: { status: task.status },
  })

  const cfg = TASK_STATUS[task.status]
  const taskColor = task.color ?? cfg.color

  const assignee = task.team_member_id
    ? teamMembers.find(m => m.id === task.team_member_id)
    : task.team_member ?? null

  const isOverdue =
    !!task.due_date &&
    task.status !== 'done' &&
    new Date(task.due_date) < new Date()

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.85 : 1,
        background: 'var(--bg)',
        borderColor: isDragging ? `${taskColor}60` : 'var(--border)',
        boxShadow: isDragging ? `0 8px 28px ${taskColor}25` : undefined,
      }}
      className="flex flex-col gap-2 rounded-lg p-3 border transition-shadow cursor-default select-none"
      onClick={() => !isDragging && onEdit?.(task)}
    >
      {/* Top row: handle + dot + title */}
      <div className="flex items-start gap-2">
        {/* Drag handle — stopPropagation to avoid triggering onEdit */}
        <button
          {...attributes}
          {...listeners}
          type="button"
          className="text-muted hover:text-text cursor-grab active:cursor-grabbing shrink-0 leading-none mt-0.5 text-base"
          onClick={e => e.stopPropagation()}
          title="Arrastar"
        >
          ⠿
        </button>

        {/* Color dot */}
        <span
          className="w-2 h-2 rounded-full shrink-0 mt-1.5"
          style={{ background: taskColor }}
        />

        {/* Title */}
        <span
          className={`flex-1 text-sm font-mono leading-snug min-w-0 ${
            task.status === 'done' ? 'line-through text-muted' : 'text-text'
          }`}
        >
          {task.title}
        </span>
      </div>

      {/* Bottom row: due_date + assignee avatar */}
      {(task.due_date || assignee) && (
        <div className="flex items-center gap-2 pl-8">
          {task.due_date && (
            <span
              className="text-xs font-mono"
              style={{ color: isOverdue ? 'var(--danger)' : 'var(--muted)' }}
            >
              {formatDate(task.due_date)}
              {isOverdue && ' · ⚠'}
            </span>
          )}

          {assignee && (
            <span
              className="ml-auto w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
              style={{ background: `${cfg.color}30`, color: cfg.color }}
              title={assignee.name}
            >
              {getInitials(assignee.name)}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
