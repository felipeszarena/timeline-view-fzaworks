'use client'

import { useState } from 'react'
import ClientCard from './ClientCard'
import type { Client } from '@/lib/types'

interface ClientListProps {
  clients: Client[]
  projectCounts: Record<string, number>
}

export default function ClientList({ clients, projectCounts }: ClientListProps) {
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? clients.filter((c) => {
        const q = search.toLowerCase()
        return (
          c.name.toLowerCase().includes(q) ||
          c.company?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q)
        )
      })
    : clients

  return (
    <div className="flex flex-col gap-5">

      {/* Search */}
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por nome, empresa ou e-mail…"
        className="w-full max-w-sm px-4 py-2.5 rounded-lg bg-bg border border-border text-text font-mono text-sm outline-none focus:border-accent transition-colors"
      />

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface flex items-center justify-center py-16">
          <p className="text-muted font-mono text-sm">
            {search ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              projectCount={projectCounts[client.id] ?? 0}
            />
          ))}
        </div>
      )}
    </div>
  )
}
