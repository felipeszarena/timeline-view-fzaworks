import Link from 'next/link'
import ClientForm from '@/components/clients/ClientForm'
import { createClientAction } from '@/lib/actions'

export default function NewClientPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-6">
      <Link
        href="/dashboard/clients"
        className="text-sm text-muted font-mono hover:text-text transition-colors w-fit"
      >
        ← clientes
      </Link>

      <h1 className="text-2xl font-bold font-sans text-text">Novo Cliente</h1>

      <ClientForm onSubmit={createClientAction} />
    </div>
  )
}
