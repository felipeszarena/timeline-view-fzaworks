'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import type { Task, TeamMember } from '@/lib/types'
import { updateTaskAction, createTaskAction } from '@/lib/actions'
import TaskColumn from './TaskColumn'
import TaskCard from './TaskCard'
import TaskListView from './TaskListView'

const COLUMNS: Task['status'][] = ['todo', 'in_progress', 'review', 'done']

interface TaskBoardProps {
  projectId: string
  initialTasks: Task[]
  teamMembers?: TeamMember[]
  /** Abre o drawer de edição ao clicar num card */
  onTaskEdit?: (task: Task) => void
}

export default function TaskBoard({
  projectId,
  initialTasks,
  teamMembers = [],
  onTaskEdit,
}: TaskBoardProps) {
  const router = useRouter()
  const [tasks, setTasks] = useState(initialTasks)
  const [view, setView] = useState<'kanban' | 'list'>('kanban')

  // Sincroniza o estado local quando o servidor retorna dados atualizados
  // (ex: após router.refresh() do TaskDrawer salvar datas/campos novos)
  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks])
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [adding, setAdding] = useState(false)

  // ── Sensors: pointer (desktop) + touch (mobile, com delay) ──
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  )

  // ── Drag handlers ────────────────────────────────────────────

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find(t => t.id === event.active.id)
    setActiveTask(task ?? null)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return

    const taskId = active.id as string
    const newStatus = over.id as Task['status']

    // Só processa se o over.id for um status válido
    if (!COLUMNS.includes(newStatus)) return

    const task = tasks.find(t => t.id === taskId)
    if (!task || task.status === newStatus) return

    // Optimistic update
    setTasks(prev =>
      prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
    )

    // Server action + refresh server components
    updateTaskAction(taskId, { status: newStatus }, projectId).then(() => {
      router.refresh()
    })
  }

  // ── Quick add ────────────────────────────────────────────────

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return
    setAdding(true)
    try {
      const res = await createTaskAction(projectId, newTitle.trim())
      if (!res?.error) {
        setNewTitle('')
        setShowAdd(false)
        router.refresh()
      }
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">

      {/* ── Header: toggle view + botão nova tarefa ── */}
      <div className="flex items-center justify-between gap-3">
        {/* Toggle kanban / lista */}
        <div
          className="flex items-center gap-0.5 p-1 rounded-lg border"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          {(['kanban', 'list'] as const).map(v => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
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

        <button
          type="button"
          onClick={() => setShowAdd(v => !v)}
          className="text-sm font-mono text-muted hover:text-accent transition-colors"
        >
          + Nova Tarefa
        </button>
      </div>

      {/* ── Quick add form ── */}
      {showAdd && (
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            autoFocus
            className="flex-1 px-4 py-2.5 rounded-lg border text-text font-mono text-sm outline-none transition-colors"
            style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Título da tarefa…"
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          />
          <button
            type="submit"
            disabled={adding}
            className="px-5 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            style={{ background: 'var(--accent)', color: 'var(--bg)' }}
          >
            {adding ? '…' : 'Criar'}
          </button>
          <button
            type="button"
            onClick={() => { setShowAdd(false); setNewTitle('') }}
            className="px-4 py-2.5 rounded-lg border text-sm font-mono text-muted hover:text-text transition-colors"
            style={{ borderColor: 'var(--border)' }}
          >
            cancelar
          </button>
        </form>
      )}

      {/* ── Kanban view ── */}
      {view === 'kanban' && (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* Colunas em scroll horizontal (mobile: min-w por coluna) */}
          <div className="flex gap-4 overflow-x-auto pb-4">
            {COLUMNS.map(status => (
              <TaskColumn
                key={status}
                status={status}
                tasks={tasks.filter(t => t.status === status)}
                teamMembers={teamMembers}
                onTaskEdit={onTaskEdit}
              />
            ))}
          </div>

          {/* Card fantasma durante o drag */}
          <DragOverlay dropAnimation={null}>
            {activeTask && (
              <div style={{ cursor: 'grabbing' }}>
                <TaskCard
                  task={activeTask}
                  teamMembers={teamMembers}
                  isDragging
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}

      {/* ── Lista view ── */}
      {view === 'list' && (
        <TaskListView
          tasks={tasks}
          teamMembers={teamMembers}
          onTaskEdit={onTaskEdit}
        />
      )}
    </div>
  )
}
