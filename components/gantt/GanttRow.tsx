import Link from 'next/link'
import type { Project } from '@/lib/types'
import StatusBadge from '@/components/project/StatusBadge'
import { currentMonth, calcProgress } from '@/lib/utils'

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

const STATUS_BAR_COLOR: Record<Project['status'], string> = {
  active:  'var(--success)',
  review:  'var(--warn)',
  planned: 'var(--accent2)',
  done:    'rgba(107,107,128,0.35)',
}

const STATUS_PROGRESS_COLOR: Record<Project['status'], string> = {
  active:  'var(--success)',
  review:  'var(--warn)',
  planned: 'var(--accent2)',
  done:    'var(--success)',
}

interface GanttRowProps {
  project: Project
  showEditLink?: boolean
}

export default function GanttRow({ project, showEditLink = false }: GanttRowProps) {
  const now      = currentMonth()
  const barColor = project.color ?? STATUS_BAR_COLOR[project.status]
  const progress = calcProgress(project) // 0–100

  // Month where the progress bar should end (based on real %)
  // Map progress % to the project month range
  const totalMonths = project.end_month - project.start_month
  const progressMonth = project.status === 'done'
    ? project.end_month
    : Math.min(
        project.start_month + Math.round((progress / 100) * totalMonths),
        now,                // never past current month
        project.end_month,  // never past end
      )

  const progressColor = project.color ?? STATUS_PROGRESS_COLOR[project.status]

  return (
    <div className="flex border-b border-border hover:bg-surface/60 transition-colors group">

      {/* Info column */}
      <div className="shrink-0 w-[140px] lg:w-[260px] px-3 lg:px-4 py-3 border-r border-border flex flex-col justify-center gap-1">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: barColor }}
          />
          <span className="text-sm font-sans font-semibold text-text truncate">
            {project.name}
          </span>
          {showEditLink && (
            <Link
              href={`/dashboard/projects/${project.id}`}
              className="ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted hover:text-accent"
              title="Editar"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </Link>
          )}
        </div>
        <div className="hidden lg:flex items-center gap-2">
          <span className="text-xs text-muted font-mono truncate">{project.client}</span>
          <StatusBadge status={project.status} />
        </div>
      </div>

      {/* Month cells */}
      {MONTHS.map((m) => {
        const inRange = m >= project.start_month && m <= project.end_month
        const isMilestone = project.milestone_month === m
        const isCurrentMonth = m === now

        return (
          <div
            key={m}
            className="flex-1 min-w-[32px] relative flex items-center justify-center"
            style={{
              borderRight: '1px solid var(--border)',
              backgroundColor: isCurrentMonth ? 'rgba(200,240,110,0.04)' : undefined,
            }}
          >
            {/* Current month guide line */}
            {isCurrentMonth && (
              <div
                className="absolute inset-y-0 left-1/2 w-px opacity-30 pointer-events-none"
                style={{ backgroundColor: 'var(--accent)' }}
              />
            )}

            {/* Bar base layer — full project range, muted */}
            {inRange && (
              <div
                className="absolute inset-y-2"
                style={{
                  backgroundColor: barColor,
                  opacity: 0.22,
                  left: m === project.start_month ? '4px' : '0',
                  right: m === project.end_month ? '4px' : '0',
                  borderRadius:
                    m === project.start_month && m === project.end_month ? '4px' :
                    m === project.start_month ? '4px 0 0 4px' :
                    m === project.end_month ? '0 4px 4px 0' : '0',
                }}
              />
            )}

            {/* Bar progress layer — up to progressMonth */}
            {inRange && m <= progressMonth && (
              <div
                className="absolute inset-y-2"
                style={{
                  backgroundColor: progressColor,
                  opacity: project.status === 'done' ? 0.7 : 0.85,
                  left: m === project.start_month ? '4px' : '0',
                  right: m === progressMonth ? '4px' : '0',
                  borderRadius:
                    m === project.start_month && m === progressMonth ? '4px' :
                    m === project.start_month ? '4px 0 0 4px' :
                    m === progressMonth ? '0 4px 4px 0' : '0',
                }}
              />
            )}

            {/* Milestone diamond */}
            {isMilestone && (
              <div
                className="absolute z-10 w-3 h-3 rotate-45"
                style={{
                  backgroundColor: 'var(--accent)',
                  boxShadow: '0 0 6px var(--accent)',
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
