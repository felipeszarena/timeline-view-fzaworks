'use client'

import { differenceInCalendarDays, startOfDay, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Task } from '@/lib/types'
import { TASK_STATUS } from '@/lib/constants'
import { toLocalDate } from '@/lib/utils'

interface TimelineTaskProps {
  task:      Task
  viewStart: Date
  dayWidth:  number
  onEdit:    (task: Task) => void
}

// ── Bar colors por status (hex para controle de opacidade) ────
const BAR_COLORS: Record<Task['status'], { bg: string; border: string }> = {
  todo:        { bg: 'rgba(107,107,128,0.35)', border: '#6b6b80' },
  in_progress: { bg: 'rgba(240,193,75,0.25)',  border: '#f0c14b' },
  review:      { bg: 'rgba(123,110,246,0.25)', border: '#7b6ef6' },
  done:        { bg: 'rgba(110,212,160,0.25)', border: '#6ed4a0' },
}

/** Progresso visual (0–100) baseado em status + datas reais */
function calcTaskProgress(task: Task): number {
  if (task.status === 'done')   return 100
  if (task.status === 'review') return 90
  if (task.status === 'todo')   return 0
  if (!task.start_date || !task.due_date) return 0

  const now   = startOfDay(new Date())
  const start = startOfDay(toLocalDate(task.start_date))
  const due   = startOfDay(toLocalDate(task.due_date))
  const total = differenceInCalendarDays(due, start)
  if (total <= 0) return 0
  return Math.min(90, Math.max(0, Math.round((differenceInCalendarDays(now, start) / total) * 100)))
}

export default function TimelineTask({ task, viewStart, dayWidth, onEdit }: TimelineTaskProps) {
  if (!task.start_date || !task.due_date) return null

  const start  = startOfDay(toLocalDate(task.start_date))
  const due    = startOfDay(toLocalDate(task.due_date))
  const vStart = startOfDay(viewStart)

  const left  = differenceInCalendarDays(start, vStart) * dayWidth
  const days  = Math.max(differenceInCalendarDays(due, start) + 1, 1)
  const width = Math.max(days * dayWidth, dayWidth)

  const colors      = BAR_COLORS[task.status]
  const barBg       = task.color ? `${task.color}40` : colors.bg
  const barBorder   = task.color ?? colors.border
  const progressPct = calcTaskProgress(task)
  const isNarrow    = width < 80

  // ── Tooltip nativo ───────────────────────────────────────────
  const today       = startOfDay(new Date())
  const daysLeft    = differenceInCalendarDays(due, today)
  const daysLeftStr =
    task.status === 'done' ? 'Concluída'
    : daysLeft < 0         ? `${Math.abs(daysLeft)}d em atraso`
    : daysLeft === 0       ? 'Vence hoje'
    :                        `${daysLeft}d restantes`

  const cfg      = TASK_STATUS[task.status]
  const startFmt = format(toLocalDate(task.start_date!), "dd MMM", { locale: ptBR })
  const dueFmt   = format(toLocalDate(task.due_date!),   "dd MMM yyyy", { locale: ptBR })
  const tooltip  = [
    task.title,
    cfg.label,
    `${progressPct}% concluído`,
    `${startFmt} → ${dueFmt}`,
    daysLeftStr,
    task.team_member ? `👤 ${task.team_member.name}` : null,
  ].filter(Boolean).join('\n')

  return (
    <>
      {/* ── Barra principal ── */}
      <div
        className="absolute cursor-pointer select-none transition-opacity hover:opacity-100"
        style={{
          left,
          width,
          top:       '50%',
          transform: 'translateY(-50%)',
          height:    32,
          borderRadius: 6,
          background: barBg,
          border:    `1.5px solid ${barBorder}`,
          overflow:  'hidden',
          opacity:   0.92,
          zIndex:    2,
        }}
        onClick={() => onEdit(task)}
        title={tooltip}
      >
        {/* Camada de progresso (branco translúcido) */}
        {progressPct > 0 && (
          <div
            className="absolute inset-y-0 left-0 pointer-events-none"
            style={{
              width:      `${progressPct}%`,
              background: 'rgba(255,255,255,0.12)',
              borderRadius: 'inherit',
            }}
          />
        )}

        {/* Nome dentro da barra */}
        {!isNarrow && (
          <span
            className="absolute inset-0 flex items-center px-2.5 pointer-events-none"
            style={{
              fontSize:     11,
              fontFamily:   'var(--font-mono, monospace)',
              fontWeight:   500,
              color:        '#e8e8f0',
              textShadow:   '0 1px 3px rgba(0,0,0,0.6)',
              whiteSpace:   'nowrap',
              overflow:     'hidden',
              textOverflow: 'ellipsis',
              zIndex:       1,
            }}
          >
            {task.title}
          </span>
        )}
      </div>

      {/* Nome fora da barra (quando estreita) */}
      {isNarrow && (
        <span
          className="absolute pointer-events-none"
          style={{
            left:         left + width + 6,
            top:          '50%',
            transform:    'translateY(-50%)',
            fontSize:     10,
            fontFamily:   'var(--font-mono, monospace)',
            color:        'var(--muted)',
            whiteSpace:   'nowrap',
            maxWidth:     120,
            overflow:     'hidden',
            textOverflow: 'ellipsis',
            zIndex:       1,
          }}
        >
          {task.title}
        </span>
      )}
    </>
  )
}
