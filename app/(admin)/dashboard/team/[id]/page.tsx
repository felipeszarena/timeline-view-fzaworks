import Link from 'next/link'
import { notFound } from 'next/navigation'
import Toast from '@/components/ui/Toast'
import {
  getTeamMemberById,
  getTeamMemberProjects,
  getAllProjects,
  getTasksByTeamMember,
  getInvoicesByTeamMember,
} from '@/lib/db'
import { updateTeamMemberAction, deleteTeamMemberAction } from '@/lib/actions'
import TeamTabs from '@/components/team/TeamTabs'
import TeamForm from '@/components/team/TeamForm'
import MemberProjectsTab from '@/components/team/MemberProjectsTab'
import MemberTasksTab from '@/components/team/MemberTasksTab'
import InvoiceList from '@/components/invoices/InvoiceList'
import type { InvoiceListItem } from '@/components/invoices/InvoiceList'
import type { Project, Task } from '@/lib/types'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string; toast?: string }>
}

export const dynamic = 'force-dynamic'

export default async function TeamMemberPage({ params, searchParams }: Props) {
  const { id } = await params
  const { tab = 'projects', toast } = await searchParams

  const member = await getTeamMemberById(id)
  if (!member) notFound()

  // Tab-conditional data fetching
  let linkedProjects: Project[]    = []
  let availableProjects: Project[] = []
  let tasks: Task[]                = []
  let projectMap: Record<string, Project> = {}
  let memberInvoices: InvoiceListItem[]   = []

  if (tab === 'projects') {
    const [memberProjects, allProjects] = await Promise.all([
      getTeamMemberProjects(id),
      getAllProjects(),
    ])
    linkedProjects = memberProjects
    const linkedIds = new Set(memberProjects.map(p => p.id))
    availableProjects = allProjects.filter(p => !linkedIds.has(p.id))
  }

  if (tab === 'tasks') {
    const [memberTasks, allProjects] = await Promise.all([
      getTasksByTeamMember(id),
      getAllProjects(),
    ])
    tasks = memberTasks
    projectMap = Object.fromEntries(allProjects.map(p => [p.id, p]))
  }

  if (tab === 'invoices') {
    const invoices = await getInvoicesByTeamMember(id)
    memberInvoices = invoices.map(inv => ({ ...inv, entityName: member.name }))
  }

  const handleUpdate = updateTeamMemberAction.bind(null, id)
  const handleDelete = deleteTeamMemberAction.bind(null, id)

  const initial = member.name.charAt(0).toUpperCase()

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-6">

      {/* Back link */}
      <Link
        href="/dashboard/team"
        className="text-sm text-muted font-mono hover:text-text transition-colors w-fit"
      >
        ← equipe
      </Link>

      {/* Member header */}
      <div className="flex items-center gap-4">
        {member.avatar_url ? (
          <img
            src={member.avatar_url}
            alt={member.name}
            className="w-14 h-14 rounded-full object-cover border border-border shrink-0"
          />
        ) : (
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold font-sans text-bg shrink-0"
            style={{ background: 'var(--accent2)' }}
          >
            {initial}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold font-sans text-text">{member.name}</h1>
            {!member.active && (
              <span
                className="text-xs font-mono px-2 py-0.5 rounded"
                style={{ color: 'var(--danger)', background: 'rgba(255,107,107,0.10)' }}
              >
                inativo
              </span>
            )}
          </div>
          {member.role && (
            <p className="text-sm text-muted font-mono">{member.role}</p>
          )}
        </div>
      </div>

      {/* Tab navigation */}
      <TeamTabs active={tab} memberId={id} />

      {/* Tab content */}
      <div>
        {tab === 'projects' && (
          <MemberProjectsTab
            memberId={id}
            linkedProjects={linkedProjects}
            availableProjects={availableProjects}
          />
        )}

        {tab === 'tasks' && (
          <MemberTasksTab tasks={tasks} projectMap={projectMap} />
        )}

        {tab === 'invoices' && (
          <InvoiceList invoices={memberInvoices} />
        )}

        {tab === 'info' && (
          <div className="bg-surface border border-border rounded-xl p-6">
            <TeamForm
              defaultValues={member}
              isEditing
              onSubmit={handleUpdate}
              onDelete={handleDelete}
            />
          </div>
        )}
      </div>

      <Toast message={toast} />
    </div>
  )
}
