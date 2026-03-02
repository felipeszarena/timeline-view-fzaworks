import type { Project } from '@/lib/types'
import { calcProgress, getProgressStatus } from '@/lib/utils'

export default function ProgressBar({ project }: { project: Project }) {
  const pct = calcProgress(project)
  const { label, color } = getProgressStatus(project)

  const displayLabel = pct > 0 && pct < 100 && project.status !== 'done'
    ? `${label} — ${pct}%`
    : label

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono" style={{ color }}>
          {displayLabel}
        </span>
        {project.status === 'done' && (
          <span className="text-xs font-mono" style={{ color: 'var(--success)' }}>
            100%
          </span>
        )}
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: color,
          }}
        />
      </div>
    </div>
  )
}
