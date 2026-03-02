'use client'

import { useState } from 'react'
import { addDays, format, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Zoom } from '@/lib/timeline'
import { DAY_WIDTH, VISIBLE_DAYS, defaultViewStart } from '@/lib/timeline'
import type { Task, Milestone } from '@/lib/types'
import TimelineHeader  from '@/components/timeline-pro/TimelineHeader'
import TodayLine       from '@/components/timeline-pro/TodayLine'
import TimelineRow     from '@/components/timeline-pro/TimelineRow'
import MilestoneMarker from '@/components/timeline-pro/MilestoneMarker'
import TaskInfoModal   from '@/components/timeline-pro/TaskInfoModal'

interface ClientTimelineProProps {
  tasks:      Task[]
  milestones: Milestone[]
}

export default function ClientTimelinePro({ tasks, milestones }: ClientTimelineProProps) {
  const [viewStart,    setViewStart]    = useState<Date>(defaultViewStart)
  const [zoom,         setZoom]         = useState<Zoom>('month')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const tasksWithDates = tasks.filter(t => t.start_date && t.due_date)
  if (tasksWithDates.length === 0) return null

  const totalDays       = VISIBLE_DAYS[zoom]
  const dayWidthDesktop = DAY_WIDTH[zoom].desktop
  const dayWidthMobile  = DAY_WIDTH[zoom].mobile
  const step            = totalDays

  const viewEnd    = addDays(viewStart, step - 1)
  const startLabel = format(viewStart, 'dd MMM',      { locale: ptBR })
  const endLabel   = format(viewEnd,   'dd MMM yyyy', { locale: ptBR })

  function renderGrid(dayWidth: number) {
    const totalWidth = totalDays * dayWidth
    return (
      <div
        className="timeline-scroll overflow-x-auto"
        style={{ background: 'var(--bg)' }}
      >
        <div style={{ width: totalWidth, minWidth: totalWidth, position: 'relative' }}>
          <TimelineHeader viewStart={viewStart} totalDays={totalDays} dayWidth={dayWidth} />
          <div className="relative">
            <TodayLine viewStart={viewStart} dayWidth={dayWidth} />
            {milestones.filter(m => m.date).map(m => (
              <MilestoneMarker key={m.id} milestone={m} viewStart={viewStart} dayWidth={dayWidth} />
            ))}
            {tasksWithDates.map((task, i) => (
              <TimelineRow
                key={task.id}
                task={task}
                viewStart={viewStart}
                dayWidth={dayWidth}
                totalDays={totalDays}
                onEdit={setSelectedTask}
                index={i}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className="flex flex-col gap-3">
      {selectedTask && (
        <TaskInfoModal task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
      <h2 className="text-xs font-mono text-muted uppercase tracking-widest">
        Cronograma do Projeto
      </h2>

      {/* ── Navegação ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setViewStart(d => addDays(d, -step))}
            className="px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors hover:border-accent hover:text-accent"
            style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => setViewStart(startOfDay(defaultViewStart()))}
            className="px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors hover:border-accent hover:text-accent"
            style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
          >
            Hoje
          </button>
          <button
            type="button"
            onClick={() => setViewStart(d => addDays(d, step))}
            className="px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors hover:border-accent hover:text-accent"
            style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
          >
            →
          </button>
        </div>

        <span className="text-xs font-mono text-muted">{startLabel} — {endLabel}</span>

        <div
          className="flex items-center gap-0.5 p-0.5 rounded-lg border ml-auto"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          {(['week', 'month'] as Zoom[]).map(z => (
            <button
              key={z}
              type="button"
              onClick={() => setZoom(z)}
              className="px-3 py-1 rounded-md text-xs font-mono transition-colors"
              style={{
                background: zoom === z ? 'var(--accent)' : 'transparent',
                color:      zoom === z ? 'var(--bg)'     : 'var(--muted)',
              }}
            >
              {z === 'week' ? 'Semana' : 'Mês'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid ── */}
      <div
        className="border rounded-xl overflow-hidden"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="hidden md:block">{renderGrid(dayWidthDesktop)}</div>
        <div className="block md:hidden">{renderGrid(dayWidthMobile)}</div>
      </div>
    </section>
  )
}
