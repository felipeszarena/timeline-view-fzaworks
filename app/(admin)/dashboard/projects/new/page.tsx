import Link from 'next/link'
import ProjectForm from '@/components/project/ProjectForm'
import { createProjectAction } from '@/lib/actions'

export default function NewProjectPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-6">
      <Link
        href="/dashboard"
        className="text-sm text-muted font-mono hover:text-text transition-colors w-fit"
      >
        ← dashboard
      </Link>

      <h1 className="text-2xl font-bold font-sans text-text">Novo Projeto</h1>

      <ProjectForm onSubmit={createProjectAction} />
    </div>
  )
}
