import type { Project } from '@/lib/types'
import MonthHeader from './MonthHeader'
import GanttRow from './GanttRow'

interface GanttChartProps {
  projects: Project[]
  showEditLinks?: boolean
}

export default function GanttChart({ projects, showEditLinks = false }: GanttChartProps) {
  if (projects.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <MonthHeader />
        <div className="flex items-center justify-center py-16">
          <p className="text-muted font-mono text-sm">Nenhum projeto encontrado.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      {/* Horizontal scroll wrapper for mobile */}
      <div className="overflow-x-auto">
        <div className="min-w-[480px] lg:min-w-[780px]">
          <MonthHeader />
          {projects.map((project) => (
            <GanttRow
              key={project.id}
              project={project}
              showEditLink={showEditLinks}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
