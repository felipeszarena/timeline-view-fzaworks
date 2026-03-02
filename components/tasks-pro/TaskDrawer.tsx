'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Task, TeamMember } from '@/lib/types'
import { TASK_COLORS } from '@/lib/constants'
import { updateTaskAction, deleteTaskAction } from '@/lib/actions'
import TaskStatusSelect from './TaskStatusSelect'
import TaskDatePicker from './TaskDatePicker'
import BottomSheet from '@/components/ui/BottomSheet'

interface TaskDrawerProps {
  task: Task | null
  onClose: () => void
  projectId: string
  teamMembers?: TeamMember[]
}

// ── Draft state shape ────────────────────────────────────────
interface Draft {
  title: string
  description: string
  status: Task['status']
  color: string
  team_member_id: string
  start_date: string
  due_date: string
  visible_to_client: boolean
}

function taskToDraft(task: Task): Draft {
  return {
    title:            task.title,
    description:      task.description     ?? '',
    status:           task.status,
    color:            task.color            ?? '',
    team_member_id:   task.team_member_id   ?? '',
    start_date:       task.start_date        ?? '',
    due_date:         task.due_date          ?? '',
    visible_to_client: task.visible_to_client,
  }
}

// ── Shared input style ───────────────────────────────────────
const INPUT =
  'w-full px-3 py-2.5 rounded-lg border text-sm font-mono outline-none transition-colors'
const inputStyle = {
  background: 'var(--bg)',
  borderColor: 'var(--border)',
  color: 'var(--text)',
}

// ── Drawer content (shared between desktop and mobile) ───────
function DrawerContent({
  task,
  draft,
  setDraft,
  teamMembers,
  onSave,
  onDelete,
  onClose,
  saving,
  deleting,
}: {
  task: Task
  draft: Draft
  setDraft: React.Dispatch<React.SetStateAction<Draft>>
  teamMembers: TeamMember[]
  onSave: () => void
  onDelete: () => void
  onClose: () => void
  saving: boolean
  deleting: boolean
}) {
  function set<K extends keyof Draft>(key: K, val: Draft[K]) {
    setDraft(prev => ({ ...prev, [key]: val }))
  }

  return (
    <div className="flex flex-col gap-5 px-5 py-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-mono text-muted uppercase tracking-widest">
          Editar Tarefa
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-muted hover:text-text transition-colors text-lg leading-none"
        >
          ✕
        </button>
      </div>

      {/* Título */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-mono text-muted">Título</label>
        <input
          className={INPUT}
          style={inputStyle}
          value={draft.title}
          onChange={e => set('title', e.target.value)}
          onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          placeholder="Título da tarefa"
        />
      </div>

      {/* Descrição */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-mono text-muted">Descrição</label>
        <textarea
          className={`${INPUT} resize-y min-h-[72px]`}
          style={inputStyle}
          value={draft.description}
          onChange={e => set('description', e.target.value)}
          onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          placeholder="Detalhes da tarefa…"
        />
      </div>

      {/* Status */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-mono text-muted">Status</label>
        <TaskStatusSelect
          status={draft.status}
          onChange={s => set('status', s)}
        />
      </div>

      {/* Cor */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-mono text-muted">Cor</label>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Sem cor */}
          <button
            type="button"
            onClick={() => set('color', '')}
            className="w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center text-xs"
            style={{
              borderColor: draft.color === '' ? 'var(--text)' : 'var(--border)',
              background: 'var(--bg)',
              color: 'var(--muted)',
            }}
            title="Sem cor"
          >
            —
          </button>
          {TASK_COLORS.map(c => (
            <button
              key={c.value}
              type="button"
              onClick={() => set('color', c.value)}
              className="w-6 h-6 rounded-full transition-all"
              style={{
                background: c.value,
                outline: draft.color === c.value ? `3px solid ${c.value}` : 'none',
                outlineOffset: '2px',
                opacity: draft.color === c.value ? 1 : 0.65,
              }}
              title={c.label}
            />
          ))}
        </div>
      </div>

      {/* Responsável */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-mono text-muted">Responsável</label>
        <select
          className={INPUT}
          style={inputStyle}
          value={draft.team_member_id}
          onChange={e => set('team_member_id', e.target.value)}
        >
          <option value="">— Nenhum —</option>
          {teamMembers.map(m => (
            <option key={m.id} value={m.id}>{m.name}{m.role ? ` · ${m.role}` : ''}</option>
          ))}
        </select>
      </div>

      {/* Datas */}
      <TaskDatePicker
        label="Início"
        value={draft.start_date}
        onChange={v => set('start_date', v)}
        placeholder="Sem data de início"
      />
      <TaskDatePicker
        label="Prazo"
        value={draft.due_date}
        onChange={v => set('due_date', v)}
        placeholder="Sem prazo"
        overdue={draft.status !== 'done'}
      />

      {/* Visível ao cliente */}
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-mono text-text">Visível ao cliente</span>
        <button
          type="button"
          onClick={() => set('visible_to_client', !draft.visible_to_client)}
          className="relative w-11 h-6 rounded-full transition-colors shrink-0"
          style={{
            background: draft.visible_to_client ? 'var(--accent)' : 'var(--border)',
          }}
          role="switch"
          aria-checked={draft.visible_to_client}
        >
          <span
            className="absolute top-0.5 w-5 h-5 rounded-full transition-transform"
            style={{
              background: draft.visible_to_client ? 'var(--bg)' : 'var(--surface)',
              transform: draft.visible_to_client ? 'translateX(22px)' : 'translateX(2px)',
            }}
          />
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <button
          type="button"
          onClick={onSave}
          disabled={saving || !draft.title.trim()}
          className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-opacity disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          style={{ background: 'var(--accent)', color: 'var(--bg)' }}
        >
          {saving ? 'Salvando…' : 'Salvar'}
        </button>

        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="px-4 py-2.5 rounded-lg text-sm font-mono border transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
        >
          {deleting ? '…' : 'Deletar'}
        </button>
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────
export default function TaskDrawer({
  task,
  onClose,
  projectId,
  teamMembers = [],
}: TaskDrawerProps) {
  const router = useRouter()
  const [draft, setDraft] = useState<Draft>(task ? taskToDraft(task) : taskToDraft({
    id: '', project_id: '', title: '', status: 'todo',
    visible_to_client: false, order_index: 0, created_at: '',
  }))
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Sync draft when a different task is opened
  useEffect(() => {
    if (task) setDraft(taskToDraft(task))
  }, [task?.id])

  if (!task) return null

  async function handleSave() {
    if (!task || !draft.title.trim()) return
    setSaving(true)
    try {
      await updateTaskAction(task.id, {
        title:             draft.title.trim(),
        description:       draft.description || null,
        status:            draft.status,
        color:             draft.color || null,
        team_member_id:    draft.team_member_id || null,
        start_date:        draft.start_date || null,
        due_date:          draft.due_date || null,
        visible_to_client: draft.visible_to_client,
      }, projectId)
      onClose()
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!task || !confirm(`Deletar "${task.title}"?`)) return
    setDeleting(true)
    try {
      await deleteTaskAction(task.id, projectId)
      onClose()
      router.refresh()
    } finally {
      setDeleting(false)
    }
  }

  const contentProps = { task, draft, setDraft, teamMembers, onSave: handleSave, onDelete: handleDelete, onClose, saving, deleting }

  return (
    <>
      {/* ── Desktop: sheet lateral direita (>= lg) ── */}
      <div className="hidden lg:block">
        {/* Overlay */}
        <div
          className="fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.3)' }}
          onClick={onClose}
        />
        {/* Panel */}
        <div
          className="fixed top-0 right-0 h-full z-50 w-[420px] overflow-y-auto"
          style={{
            background: 'var(--surface)',
            borderLeft: '1px solid var(--border)',
            animation: 'drawer-slide-in 0.22s cubic-bezier(0.32,0.72,0,1)',
          }}
        >
          <DrawerContent {...contentProps} />
        </div>
      </div>

      {/* ── Mobile: BottomSheet (< lg) ── */}
      <div className="lg:hidden">
        <BottomSheet open onClose={onClose}>
          <DrawerContent {...contentProps} />
        </BottomSheet>
      </div>

      <style>{`
        @keyframes drawer-slide-in {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>
  )
}
