'use client'

import { useState, useEffect } from 'react'
import type { Task, TeamMember } from '@/lib/types'
import TaskBoard from './TaskBoard'
import TaskDrawer from './TaskDrawer'

interface TasksWithBoardProps {
  projectId: string
  initialTasks: Task[]
  teamMembers: TeamMember[]
}

export default function TasksWithBoard({
  projectId,
  initialTasks,
  teamMembers,
}: TasksWithBoardProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // Quando o servidor retorna dados frescos (após router.refresh()),
  // atualiza o editingTask se o mesmo task ainda estiver aberto no drawer
  useEffect(() => {
    if (!editingTask) return
    const fresh = initialTasks.find(t => t.id === editingTask.id)
    if (fresh) setEditingTask(fresh)
  }, [initialTasks])

  return (
    <>
      <TaskBoard
        projectId={projectId}
        initialTasks={initialTasks}
        teamMembers={teamMembers}
        onTaskEdit={setEditingTask}
      />

      {editingTask && (
        <TaskDrawer
          task={editingTask}
          onClose={() => setEditingTask(null)}
          projectId={projectId}
          teamMembers={teamMembers}
        />
      )}
    </>
  )
}
