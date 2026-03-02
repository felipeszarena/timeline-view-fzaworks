'use client'

import { useDroppable } from '@dnd-kit/core'
import type { Task, TeamMember } from '@/lib/types'
import { TASK_STATUS } from '@/lib/constants'
import TaskCard from './TaskCard'

interface TaskColumnProps {
  status: Task['status']
  tasks: Task[]
  teamMembers?: TeamMember[]
  onTaskEdit?: (task: Task) => void
}

export default function TaskColumn({
  status,
  tasks,
  teamMembers = [],
  onTaskEdit,
}: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const cfg = TASK_STATUS[status]

  return (
    <div className="flex flex-col gap-2 min-w-[280px] flex-shrink-0">
      {/* Column header */}
      <div className="flex items-center gap-2 px-1 py-1">
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
        <span className="text-xs font-mono text-muted ml-auto">
          {tasks.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className="flex flex-col gap-2 rounded-xl p-2 min-h-[120px] transition-colors"
        style={{
          background: isOver ? `${cfg.color}08` : 'var(--surface)',
          border: `1px solid ${isOver ? `${cfg.color}50` : 'var(--border)'}`,
        }}
      >
        {tasks.length === 0 && (
          <p className="text-xs font-mono text-muted text-center py-6 opacity-40">
            Vazio
          </p>
        )}

        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            teamMembers={teamMembers}
            onEdit={onTaskEdit}
          />
        ))}
      </div>
    </div>
  )
}
