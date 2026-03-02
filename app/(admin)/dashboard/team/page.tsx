import Link from 'next/link'
import { getAllTeamMembers, getAllProjectTeam } from '@/lib/db'
import TeamCard from '@/components/team/TeamCard'

export const dynamic = 'force-dynamic'

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-surface border border-border rounded-xl px-6 py-5 flex flex-col gap-1.5">
      <span className="text-3xl font-bold font-mono tabular-nums" style={{ color }}>
        {value}
      </span>
      <span className="text-xs text-muted font-mono uppercase tracking-widest">{label}</span>
    </div>
  )
}

export default async function TeamPage() {
  let members = await getAllTeamMembers().catch(() => [])
  let projectTeam = await getAllProjectTeam().catch(() => [])

  // Project count per team member
  const projectCounts = projectTeam.reduce<Record<string, number>>((acc, row) => {
    acc[row.team_member_id] = (acc[row.team_member_id] ?? 0) + 1
    return acc
  }, {})

  const activeCount   = members.filter(m => m.active).length
  const inactiveCount = members.filter(m => !m.active).length

  return (
    <div className="px-6 py-8 max-w-[1400px] mx-auto flex flex-col gap-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-text">Equipe</h1>
          <p className="text-sm text-muted font-mono mt-0.5">
            {members.length} {members.length === 1 ? 'membro' : 'membros'}
          </p>
        </div>

        <Link
          href="/dashboard/team/new"
          className="shrink-0 px-4 py-2.5 rounded-lg text-sm font-bold font-sans bg-accent text-bg hover:opacity-90 transition-opacity"
        >
          <span className="hidden sm:inline">+ Novo Membro</span>
          <span className="sm:hidden">+ Novo</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard label="Total"   value={members.length} color="var(--text)"    />
        <StatCard label="Ativos"  value={activeCount}    color="var(--success)" />
        <StatCard label="Inativos" value={inactiveCount} color="var(--muted)"   />
      </div>

      {/* Grid */}
      {members.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted font-mono text-sm">Nenhum membro cadastrado.</p>
          <Link
            href="/dashboard/team/new"
            className="mt-4 inline-block text-sm font-mono text-accent hover:underline"
          >
            Adicionar primeiro membro →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map(member => (
            <TeamCard
              key={member.id}
              member={member}
              projectCount={projectCounts[member.id] ?? 0}
            />
          ))}
        </div>
      )}

    </div>
  )
}
