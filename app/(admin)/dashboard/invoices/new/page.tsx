import Link from 'next/link'
import { getAllClients, getAllTeamMembers, getAllProjects } from '@/lib/db'
import InvoiceForm from '@/components/invoices/InvoiceForm'

export const dynamic = 'force-dynamic'

export default async function NewInvoicePage() {
  const [clients, teamMembers, projects] = await Promise.all([
    getAllClients().catch(() => []),
    getAllTeamMembers().catch(() => []),
    getAllProjects().catch(() => []),
  ])

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-6">

      <Link
        href="/dashboard/invoices"
        className="text-sm text-muted font-mono hover:text-text transition-colors w-fit"
      >
        ← faturas
      </Link>

      <div>
        <h1 className="text-2xl font-bold font-sans text-text">Nova Fatura</h1>
        <p className="text-sm text-muted font-mono mt-0.5">Registrar receita ou despesa</p>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6">
        <InvoiceForm
          clients={clients}
          teamMembers={teamMembers}
          projects={projects}
        />
      </div>

    </div>
  )
}
