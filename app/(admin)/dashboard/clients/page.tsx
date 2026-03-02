import Link from 'next/link'
import { getAllClients, getAllProjects } from '@/lib/db'

export const dynamic = 'force-dynamic'
import ClientList from '@/components/clients/ClientList'
import type { Client, Project } from '@/lib/types'

interface StatCardProps {
  label: string
  value: number
  color: string
}

function StatCard({ label, value, color }: StatCardProps) {
  return (
    <div className="bg-surface border border-border rounded-xl px-6 py-5 flex flex-col gap-1.5">
      <span className="text-3xl font-bold font-mono tabular-nums" style={{ color }}>
        {value}
      </span>
      <span className="text-xs text-muted font-mono uppercase tracking-widest">{label}</span>
    </div>
  )
}

export default async function ClientsPage() {
  let clients: Client[] = []
  let projects: Project[] = []

  try {
    ;[clients, projects] = await Promise.all([getAllClients(), getAllProjects()])
  } catch {
    // Supabase not yet configured — render empty state
  }

  // Project count per client_id
  const projectCounts = projects.reduce<Record<string, number>>((acc, p) => {
    if (p.client_id) acc[p.client_id] = (acc[p.client_id] ?? 0) + 1
    return acc
  }, {})

  const activeLinked = projects.filter((p) => p.status === 'active' && p.client_id).length
  const withoutClient = clients.filter((c) => !projectCounts[c.id]).length

  return (
    <div className="px-6 py-8 max-w-[1400px] mx-auto flex flex-col gap-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-text">Clientes</h1>
          <p className="text-sm text-muted font-mono mt-0.5">
            {clients.length} {clients.length === 1 ? 'cadastrado' : 'cadastrados'}
          </p>
        </div>

        <Link
          href="/dashboard/clients/new"
          className="shrink-0 px-4 py-2.5 rounded-lg text-sm font-bold font-sans bg-accent text-bg hover:opacity-90 transition-opacity"
        >
          <span className="hidden sm:inline">+ Novo Cliente</span>
          <span className="sm:hidden">+ Novo</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard label="Total"            value={clients.length} color="var(--text)"    />
        <StatCard label="Projetos Ativos"  value={activeLinked}   color="var(--success)" />
        <StatCard label="Sem Projeto"      value={withoutClient}  color="var(--muted)"   />
      </div>

      {/* List */}
      <ClientList clients={clients} projectCounts={projectCounts} />

    </div>
  )
}
