'use client'

import { useState } from 'react'
import { differenceInDays, startOfDay } from 'date-fns'
import type { Zoom } from '@/lib/timeline'
import { DAY_WIDTH, VISIBLE_DAYS, defaultViewStart } from '@/lib/timeline'
import { TASK_STATUS } from '@/lib/constants'
import type { Task, Milestone, TeamMember } from '@/lib/types'
import TimelineNav     from './TimelineNav'
import TimelineHeader  from './TimelineHeader'
import TodayLine       from './TodayLine'
import TimelineRow     from './TimelineRow'
import MilestoneMarker from './MilestoneMarker'
import TaskDrawer      from '@/components/tasks-pro/TaskDrawer'

interface TimelineProProps {
  tasks?:       Task[]
  milestones?:  Milestone[]
  teamMembers?: TeamMember[]
  projectId?:   string
}

export default function TimelinePro({
  tasks       = [],
  milestones  = [],
  teamMembers = [],
  projectId   = '',
}: TimelineProProps) {
  const [viewStart,       setViewStart]       = useState<Date>(defaultViewStart)
  const [zoom,            setZoom]            = useState<Zoom>('month')
  const [editingTask,     setEditingTask]     = useState<Task | null>(null)
  const [groupByAssignee, setGroupByAssignee] = useState(false)

  const totalDays       = VISIBLE_DAYS[zoom]
  const dayWidthDesktop = DAY_WIDTH[zoom].desktop
  const dayWidthMobile  = DAY_WIDTH[zoom].mobile

  const tasksWithDates    = tasks.filter(t => t.start_date && t.due_date)
  const tasksWithoutDates = tasks.filter(t => !t.start_date || !t.due_date)

  const orderedTasks = groupByAssignee
    ? [...tasksWithDates].sort((a, b) => {
        const na = a.team_member?.name ?? '\uffff'
        const nb = b.team_member?.name ?? '\uffff'
        return na.localeCompare(nb)
      })
    : tasksWithDates

  // Dias restantes (baseado na última due_date das tasks)
  const latestDue = tasksWithDates.reduce<Date | null>((acc, t) => {
    const d = startOfDay(new Date(t.due_date!))
    return acc === null || d > acc ? d : acc
  }, null)
  const daysLeft = latestDue
    ? differenceInDays(latestDue, startOfDay(new Date()))
    : null

  // ── Grid (full-width, Notion-style: sem coluna de labels separada) ──
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
            {orderedTasks.map((task, i) => (
              <TimelineRow
                key={task.id}
                task={task}
                viewStart={viewStart}
                dayWidth={dayWidth}
                totalDays={totalDays}
                onEdit={setEditingTask}
                index={i}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 w-full">

      {/* ── Nav + dias restantes + agrupar ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <TimelineNav
          viewStart={viewStart}
          zoom={zoom}
          onViewStartChange={setViewStart}
          onZoomChange={setZoom}
        />

        {daysLeft !== null && (
          <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
            {daysLeft > 0
              ? `${daysLeft} dias restantes`
              : daysLeft === 0
              ? 'Prazo hoje'
              : `Encerrado há ${Math.abs(daysLeft)} dias`}
          </span>
        )}

        <button
          type="button"
          onClick={() => setGroupByAssignee(prev => !prev)}
          className="px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors ml-auto"
          style={{
            borderColor: groupByAssignee ? 'var(--accent)' : 'var(--border)',
            color:       groupByAssignee ? 'var(--accent)' : 'var(--muted)',
          }}
        >
          Responsável
        </button>
      </div>

      {/* ── Grid ── */}
      {tasksWithDates.length === 0 ? (
        <div
          className="flex items-center justify-center h-32 rounded-xl border text-sm font-mono"
          style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
        >
          Nenhuma task com datas definidas
        </div>
      ) : (
        <div
          className="border rounded-xl overflow-hidden"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="hidden md:block">{renderGrid(dayWidthDesktop)}</div>
          <div className="block md:hidden">{renderGrid(dayWidthMobile)}</div>
        </div>
      )}

      {/* ── Tasks sem data ── */}
      {tasksWithoutDates.length > 0 && (
        <div
          className="flex flex-col gap-2 pt-3 border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          <span className="text-[11px] font-mono" style={{ color: 'var(--muted)' }}>
            {tasksWithoutDates.length} task{tasksWithoutDates.length > 1 ? 's' : ''} sem data — configure em Tarefas
          </span>
          <div className="flex flex-wrap gap-2">
            {tasksWithoutDates.map(t => {
              const cfg = TASK_STATUS[t.status]
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setEditingTask(t)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-mono transition-opacity hover:opacity-80"
                  style={{
                    borderColor: 'var(--border)',
                    color:       'var(--text)',
                    background:  'var(--surface)',
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: t.color ?? cfg.color }}
                  />
                  {t.title}
                  <span style={{ color: cfg.color }}>· {cfg.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* TaskDrawer */}
      {editingTask && (
        <TaskDrawer
          task={editingTask}
          onClose={() => setEditingTask(null)}
          projectId={projectId}
          teamMembers={teamMembers}
        />
      )}
    </div>
  )
}
