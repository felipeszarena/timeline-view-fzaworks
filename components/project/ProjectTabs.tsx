'use client'

import { useRouter } from 'next/navigation'

const TABS = [
  { id: 'timeline',     label: 'Timeline' },
  { id: 'tasks',        label: 'Tarefas' },
  { id: 'milestones',   label: 'Milestones' },
  { id: 'updates',      label: 'Atualizações' },
  { id: 'deliverables', label: 'Entregáveis' },
  { id: 'budget',       label: 'Budget' },
  { id: 'comments',     label: 'Comentários' },
  { id: 'dispatch',     label: '✉ Disparo' },
]

interface ProjectTabsProps {
  active: string
  projectId: string
}

export default function ProjectTabs({ active, projectId }: ProjectTabsProps) {
  const router = useRouter()

  return (
    <nav className="flex gap-0 border-b border-border overflow-x-auto">
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => router.push(`/dashboard/projects/${projectId}?tab=${tab.id}`)}
          className={`px-4 py-2.5 text-sm font-mono whitespace-nowrap border-b-2 transition-colors ${
            active === tab.id
              ? 'border-accent text-accent'
              : 'border-transparent text-muted hover:text-text'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
