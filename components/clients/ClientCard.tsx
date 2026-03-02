import Link from 'next/link'
import type { Client } from '@/lib/types'

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
      <span className="text-accent2 font-bold font-sans text-base">
        {name[0].toUpperCase()}
      </span>
    </div>
  )
}

interface ClientCardProps {
  client: Client
  projectCount: number
}

export default function ClientCard({ client, projectCount }: ClientCardProps) {
  return (
    <Link
      href={`/dashboard/clients/${client.id}`}
      className="group flex flex-col gap-3 p-5 rounded-xl bg-surface border border-border hover:border-accent/40 transition-colors"
    >
      {/* Top row: avatar + name + project badge */}
      <div className="flex items-start gap-3">
        <Avatar name={client.name} avatarUrl={client.avatar_url} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 justify-between">
            <span className="font-sans font-semibold text-text text-sm truncate group-hover:text-accent transition-colors">
              {client.name}
            </span>
            {projectCount > 0 && (
              <span className="shrink-0 text-xs font-mono px-1.5 py-0.5 rounded"
                style={{ backgroundColor: 'rgba(200,240,110,0.10)', color: 'var(--accent)' }}>
                {projectCount} proj
              </span>
            )}
          </div>

          {client.company && (
            <p className="text-xs text-muted font-mono truncate mt-0.5">{client.company}</p>
          )}
        </div>
      </div>

      {/* Contact details */}
      <div className="flex flex-col gap-1">
        {client.email && (
          <p className="text-xs text-muted font-mono truncate">{client.email}</p>
        )}
        {client.phone && (
          <p className="text-xs text-muted font-mono">{client.phone}</p>
        )}
        {!client.email && !client.phone && (
          <p className="text-xs font-mono" style={{ color: 'var(--border)' }}>sem contato cadastrado</p>
        )}
      </div>
    </Link>
  )
}
