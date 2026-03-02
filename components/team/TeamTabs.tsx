'use client'

import { useRouter } from 'next/navigation'

const TABS = [
  { id: 'projects', label: 'Projetos' },
  { id: 'tasks',    label: 'Tarefas'  },
  { id: 'invoices', label: 'Faturas'  },
  { id: 'info',     label: 'Info'     },
]

interface TeamTabsProps {
  active: string
  memberId: string
}

export default function TeamTabs({ active, memberId }: TeamTabsProps) {
  const router = useRouter()

  return (
    <nav className="flex gap-0 border-b border-border overflow-x-auto">
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => router.push(`/dashboard/team/${memberId}?tab=${tab.id}`)}
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
