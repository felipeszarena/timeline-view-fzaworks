import Link from 'next/link'
import { createTeamMemberAction } from '@/lib/actions'
import TeamForm from '@/components/team/TeamForm'

export default function NewTeamMemberPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-6">

      <Link
        href="/dashboard/team"
        className="text-sm text-muted font-mono hover:text-text transition-colors w-fit"
      >
        ← equipe
      </Link>

      <div>
        <h1 className="text-2xl font-bold font-sans text-text">Novo Membro</h1>
        <p className="text-sm text-muted font-mono mt-0.5">Adicionar membro à equipe</p>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6">
        <TeamForm onSubmit={createTeamMemberAction} />
      </div>

    </div>
  )
}
