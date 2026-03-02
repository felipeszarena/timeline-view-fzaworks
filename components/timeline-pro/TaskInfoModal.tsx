'use client'

import { differenceInCalendarDays, startOfDay, format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Task } from '@/lib/types'
import { TASK_STATUS } from '@/lib/constants'

interface TaskInfoModalProps {
  task:    Task
  onClose: () => void
}

const BAR_COLORS: Record<Task['status'], string> = {
  todo:        '#6b6b80',
  in_progress: '#f0c14b',
  review:      '#7b6ef6',
  done:        '#6ed4a0',
}

function calcProgress(task: Task): number {
  if (task.status === 'done')   return 100
  if (task.status === 'review') return 90
  if (task.status === 'todo')   return 0
  if (!task.start_date || !task.due_date) return 0
  const now   = startOfDay(new Date())
  const start = startOfDay(parseISO(task.start_date))
  const due   = startOfDay(parseISO(task.due_date))
  const total = differenceInCalendarDays(due, start)
  if (total <= 0) return 0
  return Math.min(90, Math.max(0, Math.round((differenceInCalendarDays(now, start) / total) * 100)))
}

export default function TaskInfoModal({ task, onClose }: TaskInfoModalProps) {
  const cfg      = TASK_STATUS[task.status]
  const accentColor = BAR_COLORS[task.status]
  const progress = calcProgress(task)

  const start = task.start_date ? startOfDay(parseISO(task.start_date)) : null
  const due   = task.due_date   ? startOfDay(parseISO(task.due_date))   : null

  const startFmt = start ? format(start, "dd 'de' MMM", { locale: ptBR }) : null
  const dueFmt   = due   ? format(due,   "dd 'de' MMM yyyy", { locale: ptBR }) : null

  const today    = startOfDay(new Date())
  const daysLeft = due ? differenceInCalendarDays(due, today) : null

  const daysLeftStr =
    task.status === 'done'           ? 'Concluída'
    : daysLeft === null              ? null
    : daysLeft < 0                   ? `${Math.abs(daysLeft)} dia${Math.abs(daysLeft) !== 1 ? 's' : ''} em atraso`
    : daysLeft === 0                 ? 'Vence hoje'
    :                                  `${daysLeft} dia${daysLeft !== 1 ? 's' : ''} restante${daysLeft !== 1 ? 's' : ''}`

  const daysLeftColor =
    task.status === 'done'    ? 'var(--success)'
    : daysLeft !== null && daysLeft < 0 ? 'var(--danger)'
    : daysLeft === 0          ? 'var(--warn)'
    :                           'var(--muted)'

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,10,15,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      {/* Card */}
      <div
        className="relative w-full max-w-sm rounded-2xl flex flex-col gap-4 p-5"
        style={{
          background:   'var(--surface)',
          border:       `1px solid var(--border)`,
          boxShadow:    `0 0 0 1px ${accentColor}22, 0 24px 48px rgba(0,0,0,0.5)`,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-text transition-colors"
          style={{ fontSize: 18, lineHeight: 1, color: 'var(--muted)' }}
          aria-label="Fechar"
        >
          ✕
        </button>

        {/* Status badge */}
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium"
            style={{
              background: cfg.bg,
              color:      accentColor,
              border:     `1px solid ${accentColor}44`,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: accentColor }}
            />
            {cfg.label}
          </span>
        </div>

        {/* Title */}
        <h3
          className="font-display font-semibold leading-snug pr-6"
          style={{ fontSize: 16, color: 'var(--text)' }}
        >
          {task.title}
        </h3>

        {/* Description */}
        {task.description && (
          <p
            className="text-[13px] leading-relaxed"
            style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono, monospace)' }}
          >
            {task.description}
          </p>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--border)' }} />

        {/* Progress */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono" style={{ color: 'var(--muted)' }}>
              Progresso
            </span>
            <span className="text-[11px] font-mono" style={{ color: accentColor }}>
              {progress}%
            </span>
          </div>
          <div
            className="w-full rounded-full overflow-hidden"
            style={{ height: 4, background: 'var(--border)' }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progress}%`, background: accentColor }}
            />
          </div>
        </div>

        {/* Dates */}
        {(startFmt || dueFmt) && (
          <div className="flex flex-col gap-1">
            {startFmt && (
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono" style={{ color: 'var(--muted)' }}>Início</span>
                <span className="text-[11px] font-mono" style={{ color: 'var(--text)' }}>{startFmt}</span>
              </div>
            )}
            {dueFmt && (
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono" style={{ color: 'var(--muted)' }}>Prazo</span>
                <span className="text-[11px] font-mono" style={{ color: 'var(--text)' }}>{dueFmt}</span>
              </div>
            )}
            {daysLeftStr && (
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono" style={{ color: 'var(--muted)' }}>Situação</span>
                <span className="text-[11px] font-mono" style={{ color: daysLeftColor }}>{daysLeftStr}</span>
              </div>
            )}
          </div>
        )}

        {/* Assignee */}
        {task.team_member && (
          <>
            <div style={{ height: 1, background: 'var(--border)' }} />
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-mono font-bold"
                style={{ background: `${accentColor}22`, color: accentColor, border: `1px solid ${accentColor}44` }}
              >
                {task.team_member.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-mono" style={{ color: 'var(--text)' }}>
                  {task.team_member.name}
                </span>
                {task.team_member.role && (
                  <span className="text-[10px] font-mono" style={{ color: 'var(--muted)' }}>
                    {task.team_member.role}
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
