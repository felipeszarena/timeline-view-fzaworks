import Link from 'next/link'
import type { TeamMember } from '@/lib/types'

function Avatar({ name, avatarUrl }: { name: string; avatarUrl?: string | null }) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className="w-11 h-11 rounded-full object-cover shrink-0"
      />
    )
  }
  return (
    <div className="w-11 h-11 rounded-full bg-surface border border-border flex items-center justify-center shrink-0">
      <span className="font-bold font-sans text-base" style={{ color: 'var(--accent2)' }}>
        {name[0].toUpperCase()}
      </span>
    </div>
  )
}

interface TeamCardProps {
  member: TeamMember
  projectCount: number
}

export default function TeamCard({ member, projectCount }: TeamCardProps) {
  return (
    <Link
      href={`/dashboard/team/${member.id}`}
      className="group flex flex-col gap-3 p-5 rounded-xl bg-surface border border-border hover:border-accent2/40 transition-colors"
    >
      <div className="flex items-start gap-3">
        <Avatar name={member.name} avatarUrl={member.avatar_url} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 justify-between">
            <span className="font-sans font-semibold text-text text-sm truncate group-hover:text-accent2 transition-colors">
              {member.name}
            </span>
            {projectCount > 0 && (
              <span
                className="shrink-0 text-xs font-mono px-1.5 py-0.5 rounded"
                style={{ backgroundColor: 'rgba(123,110,246,0.10)', color: 'var(--accent2)' }}
              >
                {projectCount} proj
              </span>
            )}
          </div>
          {member.role && (
            <p className="text-xs text-muted font-mono truncate mt-0.5">{member.role}</p>
          )}
          {!member.active && (
            <span className="text-xs font-mono" style={{ color: 'var(--danger)' }}>inativo</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        {member.email ? (
          <p className="text-xs text-muted font-mono truncate">{member.email}</p>
        ) : (
          <p className="text-xs font-mono" style={{ color: 'var(--border)' }}>sem email cadastrado</p>
        )}
      </div>
    </Link>
  )
}
