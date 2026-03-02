'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy, arrayMove, useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '@/lib/types'
import {
  createTaskAction, updateTaskAction, deleteTaskAction, reorderTasksAction,
} from '@/lib/actions'

const STATUS_CYCLE: Record<Task['status'], Task['status']> = {
  todo:        'in_progress',
  in_progress: 'review',
  review:      'done',
  done:        'todo',
}

const STATUS_STYLE: Record<Task['status'], { label: string; color: string }> = {
  todo:        { label: 'A fazer',      color: 'var(--muted)'   },
  in_progress: { label: 'Em andamento', color: 'var(--warn)'    },
  review:      { label: 'Revisão',      color: 'var(--accent2)' },
  done:        { label: 'Concluído',    color: 'var(--success)' },
}

// ── Sortable row ──────────────────────────────────────────────

function SortableTaskRow({
  task, projectId, onOptimisticUpdate, onOptimisticDelete,
}: {
  task: Task
  projectId: string
  onOptimisticUpdate: (id: string, patch: Partial<Task>) => void
  onOptimisticDelete: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const status = STATUS_STYLE[task.status]

  async function cycleStatus() {
    const next = STATUS_CYCLE[task.status]
    onOptimisticUpdate(task.id, { status: next })
    await updateTaskAction(task.id, { status: next }, projectId)
  }

  async function toggleVisibility() {
    const next = !task.visible_to_client
    onOptimisticUpdate(task.id, { visible_to_client: next })
    await updateTaskAction(task.id, { visible_to_client: next }, projectId)
  }

  async function handleDelete() {
    if (!confirm(`Deletar "${task.title}"?`)) return
    onOptimisticDelete(task.id)
    await deleteTaskAction(task.id, projectId)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 px-4 py-3 rounded-lg bg-surface border border-border"
    >
      {/* drag handle */}
      <button
        {...attributes}
        {...listeners}
        type="button"
        className="text-muted hover:text-text cursor-grab active:cursor-grabbing text-base shrink-0 leading-none"
        title="Arrastar para reordenar"
      >
        ⠿
      </button>

      {/* status badge */}
      <button
        onClick={cycleStatus}
        type="button"
        title="Clique para avançar status"
        className="text-xs font-mono shrink-0 px-2 py-0.5 rounded transition-colors"
        style={{ color: status.color, background: `${status.color}20` }}
      >
        {status.label}
      </button>

      {/* title */}
      <span
        className={`flex-1 text-sm font-mono min-w-0 truncate ${
          task.status === 'done' ? 'line-through text-muted' : 'text-text'
        }`}
      >
        {task.title}
      </span>

      {/* client visibility toggle */}
      <button
        onClick={toggleVisibility}
        type="button"
        title={task.visible_to_client ? 'Visível ao cliente' : 'Oculto para o cliente'}
        className={`text-xs font-mono shrink-0 transition-colors ${
          task.visible_to_client ? 'text-accent' : 'text-muted'
        }`}
      >
        {task.visible_to_client ? 'visível' : 'oculto'}
      </button>

      {/* delete */}
      <button
        onClick={handleDelete}
        type="button"
        className="text-xs font-mono text-muted hover:text-danger transition-colors shrink-0"
      >
        ✕
      </button>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────

export default function TasksTab({
  projectId,
  initialTasks,
}: {
  projectId: string
  initialTasks: Task[]
}) {
  const router = useRouter()
  const [tasks, setTasks] = useState(initialTasks)
  const [newTitle, setNewTitle] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  function handleOptimisticUpdate(id: string, patch: Partial<Task>) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t))
  }

  function handleOptimisticDelete(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = tasks.findIndex(t => t.id === active.id)
    const newIndex = tasks.findIndex(t => t.id === over.id)
    const newOrder = arrayMove(tasks, oldIndex, newIndex)
    setTasks(newOrder)
    // fire-and-forget: optimistic UI is already updated
    reorderTasksAction(newOrder.map(t => t.id), projectId)
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return
    setAdding(true)
    setError('')
    try {
      const res = await createTaskAction(projectId, newTitle.trim())
      if (res?.error) {
        setError(res.error)
      } else {
        setNewTitle('')
        setShowForm(false)
        router.refresh()
      }
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <p className="text-sm font-mono text-muted text-center py-8">
              Nenhuma tarefa cadastrada.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {tasks.map(task => (
                <SortableTaskRow
                  key={task.id}
                  task={task}
                  projectId={projectId}
                  onOptimisticUpdate={handleOptimisticUpdate}
                  onOptimisticDelete={handleOptimisticDelete}
                />
              ))}
            </div>
          )}
        </SortableContext>
      </DndContext>

      {showForm ? (
        <form onSubmit={handleAdd} className="flex gap-2 mt-2">
          <input
            autoFocus
            className="flex-1 px-4 py-2.5 rounded-lg bg-bg border border-border text-text font-mono text-sm outline-none focus:border-accent transition-colors"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Título da tarefa…"
          />
          <button
            type="submit"
            disabled={adding}
            className="px-5 py-2.5 rounded-lg bg-accent text-bg text-sm font-bold font-sans hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {adding ? 'adicionando…' : 'Adicionar'}
          </button>
          <button
            type="button"
            onClick={() => { setShowForm(false); setNewTitle('') }}
            className="px-4 py-2.5 rounded-lg border border-border text-sm font-mono text-muted hover:text-text transition-colors"
          >
            cancelar
          </button>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          type="button"
          className="text-sm font-mono text-muted hover:text-accent transition-colors text-left w-fit"
        >
          + Nova Tarefa
        </button>
      )}

      {error && <p className="text-sm text-warn font-mono">{error}</p>}
    </div>
  )
}
