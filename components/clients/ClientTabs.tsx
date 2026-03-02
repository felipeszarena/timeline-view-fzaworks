'use client'

import { useRouter } from 'next/navigation'

const TABS = [
  { id: 'overview',     label: 'Visão Geral' },
  { id: 'projects',     label: 'Projetos' },
  { id: 'attachments',  label: 'Arquivos' },
  { id: 'notes',        label: 'Notas' },
  { id: 'invoices',     label: 'Faturas' },
]

interface ClientTabsProps {
  active: string
  clientId: string
}

export default function ClientTabs({ active, clientId }: ClientTabsProps) {
  const router = useRouter()

  return (
    <nav className="flex gap-0 border-b border-border overflow-x-auto">
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => router.push(`/dashboard/clients/${clientId}?tab=${tab.id}`)}
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
