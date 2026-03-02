'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Client } from '@/lib/types'
import type { MigrationGroup } from '@/lib/migration'
import { linkProjectsToClientAction, createAndLinkClientAction } from '@/lib/actions'

const SELECT =
  'w-full px-3 py-2 rounded-lg bg-bg border border-border text-text font-mono text-sm outline-none focus:border-accent transition-colors cursor-pointer'

function GroupRow({
  group,
  clients,
}: {
  group: MigrationGroup
  clients: Client[]
}) {
  const router = useRouter()
  const [selected, setSelected] = useState(
    group.suggestedClient?.id ?? ''
  )
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const projectIds = group.projects.map(p => p.id)

  async function handleLink() {
    if (!selected) return
    setSaving(true)
    setError('')

    const res =
      selected === 'new'
        ? await createAndLinkClientAction(group.clientText, projectIds)
        : await linkProjectsToClientAction(projectIds, selected)

    if (res?.error) {
      setError(res.error)
    } else {
      setDone(true)
      router.refresh()
    }
    setSaving(false)
  }

  if (done) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface border border-border opacity-60">
        <span className="text-xs font-mono" style={{ color: 'var(--success)' }}>
          ✓ Vinculado
        </span>
        <span className="text-sm font-mono text-muted">{group.clientText}</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 px-4 py-4 rounded-xl bg-surface border border-border">
      {/* Group header */}
      <div className="flex items-baseline gap-2">
        <span className="text-sm font-sans font-semibold text-text">{group.clientText}</span>
        <span className="text-xs font-mono text-muted">
          {group.projects.length} projeto{group.projects.length > 1 ? 's' : ''}
        </span>
        {group.suggestedClient && (
          <span
            className="text-[10px] font-mono px-1.5 py-0.5 rounded uppercase"
            style={{ color: 'var(--accent)', background: 'rgba(200,240,110,0.10)' }}
          >
            match encontrado
          </span>
        )}
      </div>

      {/* Project list */}
      <ul className="flex flex-col gap-0.5">
        {group.projects.map(p => (
          <li key={p.id} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: p.color }} />
            <span className="text-xs font-mono text-muted">{p.name}</span>
          </li>
        ))}
      </ul>

      {/* Client select + action */}
      <div className="flex gap-2 items-center">
        <select
          value={selected}
          onChange={e => setSelected(e.target.value)}
          className={SELECT}
        >
          <option value="">Selecionar cliente…</option>
          <option value="new">✦ Criar novo cliente "{group.clientText}"</option>
          {clients.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}{c.company ? ` — ${c.company}` : ''}
            </option>
          ))}
        </select>

        <button
          onClick={handleLink}
          disabled={!selected || saving}
          className="shrink-0 px-4 py-2 rounded-lg text-sm font-mono bg-accent text-bg font-bold hover:opacity-90 transition-opacity disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
        >
          {saving ? '…' : 'Vincular'}
        </button>
      </div>

      {error && <p className="text-xs font-mono text-danger">{error}</p>}
    </div>
  )
}

interface MigrationSectionProps {
  groups: MigrationGroup[]
  clients: Client[]
}

export default function MigrationSection({ groups, clients }: MigrationSectionProps) {
  if (groups.length === 0) {
    return (
      <div className="flex items-center gap-3 px-4 py-4 rounded-xl bg-surface border border-border">
        <span className="text-xs font-mono" style={{ color: 'var(--success)' }}>✓</span>
        <p className="text-sm font-mono text-muted">
          Todos os projetos já estão vinculados a um cliente.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-mono text-muted">
        {groups.length} grupo{groups.length > 1 ? 's' : ''} de projetos sem cliente vinculado.
        Selecione um cliente existente ou crie um novo para cada grupo.
      </p>
      {groups.map(group => (
        <GroupRow key={group.clientText} group={group} clients={clients} />
      ))}
    </div>
  )
}
