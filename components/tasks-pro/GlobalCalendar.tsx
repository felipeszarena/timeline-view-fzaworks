'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, format, addMonths, subMonths,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Task } from '@/lib/types'
import { toLocalDate, toUTC } from '@/lib/utils'
import { TASK_STATUS } from '@/lib/constants'
import { createTaskWithDatesAction } from '@/lib/actions'

type CalendarTask = Task & { project_name: string; project_color: string | null }

interface Project { id: string; name: string; color: string | null }

interface GlobalCalendarProps {
  tasks: CalendarTask[]
  projects: Project[]
}

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function GlobalCalendar({ tasks, projects }: GlobalCalendarProps) {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [addingDay, setAddingDay] = useState<Date | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newProjectId, setNewProjectId] = useState(projects[0]?.id ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const monthStart = startOfMonth(currentDate)
  const monthEnd   = endOfMonth(currentDate)
  const gridStart  = startOfWeek(monthStart, { weekStartsOn: 0 })
  const gridEnd    = endOfWeek(monthEnd,     { weekStartsOn: 0 })
  const days       = eachDayOfInterval({ start: gridStart, end: gridEnd })
  const today      = new Date()

  function getTasksForDay(day: Date): CalendarTask[] {
    return tasks.filter(t => {
      if (!t.due_date) return false
      return isSameDay(toLocalDate(t.due_date), day)
    })
  }

  function handleDayClick(day: Date) {
    setAddingDay(day)
    setNewTitle('')
    setNewProjectId(projects[0]?.id ?? '')
    setError('')
  }

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim() || !newProjectId || !addingDay) return
    setSaving(true)
    setError('')
    try {
      const localStr = format(addingDay, 'yyyy-MM-dd') + 'T09:00'
      const utcDate = toUTC(localStr)
      const res = await createTaskWithDatesAction(newProjectId, newTitle.trim(), utcDate, utcDate)
      if (res.error) { setError(res.error); return }
      setAddingDay(null)
      setNewTitle('')
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">

      {/* ── Navegação do mês ── */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setCurrentDate(d => subMonths(d, 1))}
          className="px-3 py-1.5 rounded-lg border text-sm font-mono text-muted hover:text-text transition-colors"
          style={{ borderColor: 'var(--border)' }}
        >
          ←
        </button>
        <h2 className="text-base font-mono font-semibold text-text capitalize">
          {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <button
          type="button"
          onClick={() => setCurrentDate(d => addMonths(d, 1))}
          className="px-3 py-1.5 rounded-lg border text-sm font-mono text-muted hover:text-text transition-colors"
          style={{ borderColor: 'var(--border)' }}
        >
          →
        </button>
      </div>

      {/* ── Grade do calendário ── */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: 'var(--border)' }}
      >
        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7" style={{ borderBottom: '1px solid var(--border)' }}>
          {WEEK_DAYS.map(d => (
            <div
              key={d}
              className="py-2 text-center text-xs font-mono text-muted"
              style={{ background: 'var(--surface)' }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Células dos dias */}
        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            const dayTasks  = getTasksForDay(day)
            const isToday   = isSameDay(day, today)
            const inMonth   = isSameMonth(day, currentDate)
            const isAdding  = addingDay && isSameDay(day, addingDay)
            const isLastRow = idx >= days.length - 7

            return (
              <div
                key={day.toISOString()}
                className="calendar-cell relative group"
                style={{
                  minHeight: 90,
                  borderRight:  (idx + 1) % 7 !== 0 ? '1px solid var(--border)' : 'none',
                  borderBottom: !isLastRow ? '1px solid var(--border)' : 'none',
                  background: isAdding
                    ? 'rgba(200,240,110,0.06)'
                    : isToday
                    ? 'rgba(200,240,110,0.04)'
                    : 'var(--bg)',
                  cursor: 'pointer',
                }}
                onClick={() => handleDayClick(day)}
              >
                {/* Número do dia */}
                <div className="flex items-center justify-between px-2 pt-1.5 pb-1">
                  <span
                    className="text-xs font-mono w-6 h-6 flex items-center justify-center rounded-full"
                    style={{
                      background: isToday ? 'var(--accent)' : 'transparent',
                      color: isToday ? 'var(--bg)' : inMonth ? 'var(--text)' : 'var(--muted)',
                      fontWeight: isToday ? 700 : 400,
                    }}
                  >
                    {format(day, 'd')}
                  </span>

                  {/* Botão "+" aparece no hover */}
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); handleDayClick(day) }}
                    className="calendar-add-btn opacity-0 group-hover:opacity-100 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-opacity"
                    style={{ background: 'var(--accent)', color: 'var(--bg)' }}
                  >
                    +
                  </button>
                </div>

                {/* Tasks do dia */}
                <div className="flex flex-col gap-0.5 px-1.5 pb-1.5">
                  {dayTasks.slice(0, 3).map(task => {
                    const cfg = TASK_STATUS[task.status]
                    const color = task.color ?? task.project_color ?? cfg.color
                    return (
                      <button
                        key={task.id}
                        type="button"
                        onClick={e => { e.stopPropagation() }}
                        className="w-full text-left text-[10px] font-mono px-1.5 py-0.5 rounded truncate transition-opacity hover:opacity-80"
                        style={{
                          background: `${color}20`,
                          color: color,
                          borderLeft: `2px solid ${color}`,
                        }}
                        title={`${task.title} · ${task.project_name}`}
                      >
                        {task.title}
                      </button>
                    )
                  })}
                  {dayTasks.length > 3 && (
                    <span className="text-[10px] font-mono text-muted pl-1">
                      +{dayTasks.length - 3} mais
                    </span>
                  )}
                </div>

                {/* Formulário inline quando clicado */}
                {isAdding && (
                  <div
                    className="absolute left-0 right-0 z-20 p-2 rounded-b-xl shadow-lg"
                    style={{
                      top: '100%',
                      background: 'var(--surface)',
                      border: '1px solid var(--accent)',
                      borderTop: 'none',
                    }}
                    onClick={e => e.stopPropagation()}
                  >
                    <form onSubmit={handleAddTask} className="flex flex-col gap-1.5">
                      <input
                        autoFocus
                        className="w-full px-2 py-1.5 rounded-md border text-xs font-mono outline-none"
                        style={{
                          background: 'var(--bg)',
                          borderColor: 'var(--accent)',
                          color: 'var(--text)',
                        }}
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        placeholder="Título da tarefa…"
                      />
                      {projects.length > 1 && (
                        <select
                          className="w-full px-2 py-1 rounded-md border text-xs font-mono outline-none"
                          style={{
                            background: 'var(--bg)',
                            borderColor: 'var(--border)',
                            color: 'var(--text)',
                          }}
                          value={newProjectId}
                          onChange={e => setNewProjectId(e.target.value)}
                        >
                          {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      )}
                      {error && (
                        <span className="text-[10px] font-mono" style={{ color: 'var(--danger)' }}>
                          {error}
                        </span>
                      )}
                      <div className="flex gap-1">
                        <button
                          type="submit"
                          disabled={saving || !newTitle.trim()}
                          className="flex-1 py-1 rounded-md text-xs font-bold disabled:opacity-50"
                          style={{ background: 'var(--accent)', color: 'var(--bg)' }}
                        >
                          {saving ? '…' : 'Criar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setAddingDay(null)}
                          className="px-2 py-1 rounded-md text-xs font-mono border"
                          style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
                        >
                          ✕
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <style>{`
        .calendar-cell { transition: background 0.12s; }
        .calendar-cell:hover { background: rgba(200,240,110,0.05) !important; }
      `}</style>
    </div>
  )
}
