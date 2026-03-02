import { notFound } from 'next/navigation'
import { getClientBySlug } from '@/lib/db'
import ClientPortalGate from '@/components/client/ClientPortalGate'

interface Props {
  params: Promise<{ clientSlug: string }>
}

export default async function ClientPortalLoginPage({ params }: Props) {
  const { clientSlug } = await params
  const client = await getClientBySlug(clientSlug)

  // 404 se o slug não existe ou o portal não está configurado
  if (!client || !client.portal_password_hash) notFound()

  return (
    <ClientPortalGate
      clientSlug={clientSlug}
      clientName={client.name}
      company={client.company ?? undefined}
    />
  )
}
