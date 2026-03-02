'use client'

import { useState } from 'react'
import type { Client } from '@/lib/types'
import ClientForm from './ClientForm'
import { updateClientAction, deleteClientAction, resetClientPortalPasswordAction } from '@/lib/actions'

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-mono text-muted uppercase tracking-widest">{label}</span>
      <span className="text-sm font-mono text-text break-words">{value}</span>
    </div>
  )
}

export default function OverviewTab({ client }: { client: Client }) {
  const [editing, setEditing] = useState(false)

  const handleUpdate        = updateClientAction.bind(null, client.id)
  const handleDelete        = deleteClientAction.bind(null, client.id)
  const handleResetPassword = resetClientPortalPasswordAction.bind(null, client.id)

  const hasAnyInfo =
    client.email || client.phone || client.whatsapp ||
    client.instagram || client.website || client.cnpj_cpf ||
    client.address || client.company

  if (editing) {
    return (
      <div className="flex flex-col gap-4">
        <button
          onClick={() => setEditing(false)}
          className="text-xs font-mono text-muted hover:text-text transition-colors w-fit"
        >
          ← cancelar edição
        </button>
        <ClientForm
          defaultValues={client}
          isEditing
          onSubmit={handleUpdate}
          onDelete={handleDelete}
          onResetPortalPassword={handleResetPassword}
          redirectOnSave={`/dashboard/clients/${client.id}?tab=overview&toast=updated`}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <button
          onClick={() => setEditing(true)}
          className="px-5 py-2 rounded-lg border border-border text-sm font-mono text-muted hover:text-text hover:border-accent/60 transition-colors"
        >
          Editar Dados
        </button>
      </div>

      {!hasAnyInfo ? (
        <div className="text-center py-8">
          <p className="text-sm font-mono text-muted">
            Nenhuma informação de contato cadastrada.{' '}
            <button
              onClick={() => setEditing(true)}
              className="text-accent hover:underline"
            >
              Adicionar agora
            </button>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
          <InfoRow label="Nome" value={client.name} />
          <InfoRow label="Empresa" value={client.company} />
          <InfoRow label="E-mail" value={client.email} />
          <InfoRow label="Telefone" value={client.phone} />
          <InfoRow label="WhatsApp" value={client.whatsapp} />
          <InfoRow
            label="Instagram"
            value={client.instagram ? `@${client.instagram}` : null}
          />
          <InfoRow label="Website" value={client.website} />
          <InfoRow label="CNPJ / CPF" value={client.cnpj_cpf} />
          {client.address && (
            <div className="sm:col-span-2 flex flex-col gap-0.5">
              <span className="text-xs font-mono text-muted uppercase tracking-widest">
                Endereço
              </span>
              <span className="text-sm font-mono text-text whitespace-pre-line">
                {client.address}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
