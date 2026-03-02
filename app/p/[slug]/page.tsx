import { notFound } from 'next/navigation'
import { getProjectBySlug } from '@/lib/db'
import PasswordGate from '@/components/client/PasswordGate'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ProjectPasswordPage({ params }: Props) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)

  if (!project) notFound()

  // Only pass the name — never expose password_hash or other sensitive fields
  return <PasswordGate projectName={project.name} slug={slug} />
}
