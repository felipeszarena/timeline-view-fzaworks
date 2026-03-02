import Link from 'next/link'
import { notFound } from 'next/navigation'
import Toast from '@/components/ui/Toast'
import { getClientById, getAllProjects, getClientAttachments, getInvoicesByClient } from '@/lib/db'
import { createAdminClient } from '@/lib/supabase'
import ClientTabs from '@/components/clients/ClientTabs'
import OverviewTab from '@/components/clients/OverviewTab'
import ProjectsTab from '@/components/clients/ProjectsTab'
import AttachmentsTab from '@/components/clients/AttachmentsTab'
import type { AttachmentWithUrl } from '@/components/clients/AttachmentsTab'
import NotesTab from '@/components/clients/NotesTab'
import InvoiceList from '@/components/invoices/InvoiceList'
import type { InvoiceListItem } from '@/components/invoices/InvoiceList'
import type { Project } from '@/lib/types'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string; toast?: string }>
}

export const dynamic = 'force-dynamic'

export default async function ClientProfilePage({ params, searchParams }: Props) {
  const { id } = await params
  const { tab = 'overview', toast } = await searchParams

  const client = await getClientById(id)
  if (!client) notFound()

  // Tab-conditional data fetching
  let linkedProjects: Project[]       = []
  let availableProjects: Project[]    = []
  let attachments: AttachmentWithUrl[] = []
  let clientInvoices: InvoiceListItem[] = []

  if (tab === 'projects') {
    const allProjects = await getAllProjects()
    linkedProjects = allProjects.filter(p => p.client_id === id)
    availableProjects = allProjects.filter(p => !p.client_id)
  }

  if (tab === 'attachments') {
    const rawAttachments = await getClientAttachments(id)
    const supabase = createAdminClient()
    attachments = await Promise.all(
      rawAttachments.map(async att => {
        const { data } = await supabase.storage
          .from('client-attachments')
          .createSignedUrl(att.url, 3600)
        return { ...att, signedUrl: data?.signedUrl ?? '' }
      })
    )
  }

  if (tab === 'invoices') {
    const invoices = await getInvoicesByClient(id)
    clientInvoices = invoices.map(inv => ({ ...inv, entityName: client.name }))
  }

  const initial = client.name.charAt(0).toUpperCase()

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-6">

      {/* Back link */}
      <Link
        href="/dashboard/clients"
        className="text-sm text-muted font-mono hover:text-text transition-colors w-fit"
      >
        ← clientes
      </Link>

      {/* Client header */}
      <div className="flex items-center gap-4">
        {client.avatar_url ? (
          <img
            src={client.avatar_url}
            alt={client.name}
            className="w-14 h-14 rounded-full object-cover border border-border shrink-0"
          />
        ) : (
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold font-sans text-bg shrink-0"
            style={{ background: 'var(--accent)' }}
          >
            {initial}
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl font-bold font-sans text-text truncate">{client.name}</h1>
          {client.company && (
            <p className="text-sm text-muted font-mono">{client.company}</p>
          )}
        </div>
      </div>

      {/* Tab navigation */}
      <ClientTabs active={tab} clientId={id} />

      {/* Tab content */}
      <div>
        {tab === 'overview' && <OverviewTab client={client} />}

        {tab === 'projects' && (
          <ProjectsTab
            clientId={id}
            linkedProjects={linkedProjects}
            availableProjects={availableProjects}
          />
        )}

        {tab === 'attachments' && (
          <AttachmentsTab clientId={id} attachments={attachments} />
        )}

        {tab === 'notes' && (
          <NotesTab clientId={id} initialNotes={client.notes ?? ''} />
        )}

        {tab === 'invoices' && (
          <InvoiceList invoices={clientInvoices} />
        )}
      </div>

      <Toast message={toast} />
    </div>
  )
}
