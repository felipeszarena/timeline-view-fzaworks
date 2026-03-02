import type { Project } from '@/lib/types'
import { currentMonth, monthName } from '@/lib/utils'

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

interface Props {
  project: Project
}

function calcProgress(project: Project): number {
  const now = currentMonth()
  if (now < project.start_month) return 0
  if (now > project.end_month) return 100
  const total = project.end_month - project.start_month + 1
  const elapsed = now - project.start_month + 1
  return Math.round((elapsed / total) * 100)
}

export default function ClientTimeline({ project }: Props) {
  const now = currentMonth()
  const progress = calcProgress(project)
  const barColor = project.color ?? 'var(--accent)'

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">

      {/* Horizontal scroll wrapper */}
      <div className="overflow-x-auto">
        <div className="min-w-[560px]">

          {/* Month headers */}
          <div
            className="grid border-b border-border"
            style={{ gridTemplateColumns: 'repeat(12, 1fr)' }}
          >
            {MONTHS.map((m) => (
              <div key={m} className="py-2.5 text-center">
                <span
                  className="text-xs font-mono uppercase"
                  style={{
                    color: m === now ? 'var(--accent)' : 'var(--muted)',
                    fontWeight: m === now ? 700 : 400,
                  }}
                >
                  {monthName(m)}
                </span>
              </div>
            ))}
          </div>

          {/* Bar row */}
          <div
            className="grid py-5 px-1"
            style={{ gridTemplateColumns: 'repeat(12, 1fr)' }}
          >
            {MONTHS.map((m) => {
              const inRange = m >= project.start_month && m <= project.end_month
              const isMilestone = project.milestone_month === m
              const isNow = m === now

              return (
                <div
                  key={m}
                  className="relative h-8 flex items-center justify-center"
                  style={{
                    backgroundColor: isNow ? 'rgba(200,240,110,0.04)' : undefined,
                  }}
                >
                  {/* Current month guide line */}
                  {isNow && (
                    <div
                      className="absolute inset-y-0 left-1/2 w-px pointer-events-none"
                      style={{ backgroundColor: 'var(--accent)', opacity: 0.35 }}
                    />
                  )}

                  {/* Bar segment */}
                  {inRange && (
                    <div
                      className="absolute inset-y-1.5"
                      style={{
                        backgroundColor: barColor,
                        opacity: 0.9,
                        left: m === project.start_month ? '6px' : '0',
                        right: m === project.end_month ? '6px' : '0',
                        borderRadius:
                          m === project.start_month && m === project.end_month
                            ? '6px'
                            : m === project.start_month
                            ? '6px 0 0 6px'
                            : m === project.end_month
                            ? '0 6px 6px 0'
                            : '0',
                      }}
                    />
                  )}

                  {/* Milestone diamond */}
                  {isMilestone && (
                    <div
                      className="absolute z-10 w-3 h-3 rotate-45"
                      style={{
                        backgroundColor: 'var(--accent)',
                        boxShadow: '0 0 8px var(--accent)',
                      }}
                    />
                  )}
                </div>
              )
            })}
          </div>

        </div>
      </div>

      {/* Progress bar */}
      <div className="px-5 pb-5 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted font-mono">progresso</span>
          <span
            className="text-xs font-mono font-bold tabular-nums"
            style={{ color: 'var(--accent)' }}
          >
            {progress}%
          </span>
        </div>
        <div className="h-1 rounded-full bg-border overflow-hidden">
          <div
            className="h-1 rounded-full transition-all"
            style={{ width: `${progress}%`, backgroundColor: 'var(--accent)' }}
          />
        </div>
        <p className="text-xs text-muted font-mono">
          {monthName(project.start_month)} → {monthName(project.end_month)} {project.year}
          {project.milestone_month && (
            <span style={{ color: 'var(--accent)' }}>
              {' '}· marco em {monthName(project.milestone_month)}
            </span>
          )}
        </p>
      </div>

    </div>
  )
}
