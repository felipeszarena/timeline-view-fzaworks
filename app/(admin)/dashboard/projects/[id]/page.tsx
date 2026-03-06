import Link from 'next/link'
import { notFound } from 'next/navigation'
import Toast from '@/components/ui/Toast'
import {
  getProjectById,
  getTasksByProject, getMilestonesByProject,
  getUpdatesByProject, getDeliverablesByProject, getCommentsByProject,
  getTeamMembersByProject,
  getClientById,
} from '@/lib/db'
import CopyPortalLinkBadge from '@/components/project/CopyPortalLinkBadge'
import ProjectForm from '@/components/project/ProjectForm'
import ProjectTabs from '@/components/project/ProjectTabs'
import TimelinePro from '@/components/timeline-pro/TimelinePro'
import TasksWithBoard from '@/components/tasks-pro/TasksWithBoard'
import MilestonesTab from '@/components/project/MilestonesTab'
import UpdatesTab from '@/components/project/UpdatesTab'
import DeliverablesTab from '@/components/project/DeliverablesTab'
import BudgetTab from '@/components/project/BudgetTab'
import CommentsTab  from '@/components/project/CommentsTab'
import DispatchTab  from '@/components/project/DispatchTab'
import type { Task, TeamMember, Milestone, ProjectUpdate, Deliverable, Comment, EmailDispatch } from '@/lib/types'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string; toast?: string }>
}

export const dynamic = 'force-dynamic'

export default async function ProjectDetailPage({ params, searchParams }: Props) {
  const { id } = await params
  const { tab = 'timeline', toast } = await searchParams

  const project = await getProjectById(id)
  if (!project) return notFound()

  // Busca cliente vinculado (para exibir badge do portal)
  const linkedClient = project.client_id
    ? await getClientById(project.client_id)
    : null
  const clientPortalSlug =
    linkedClient?.slug && linkedClient?.portal_password_hash
      ? linkedClient.slug
      : null

  // Tab-conditional data fetching
  let tasks: Task[] = []
  let teamMembers: TeamMember[] = []
  let milestones: Milestone[] = []
  let updates: ProjectUpdate[] = []
  let deliverables: Deliverable[] = []
  let comments: Comment[] = []
  let dispatches: EmailDispatch[] = []

  if (tab === 'timeline') {
    ;[tasks, milestones, teamMembers] = await Promise.all([
      getTasksByProject(id),
      getMilestonesByProject(id),
      getTeamMembersByProject(id),
    ])
  }
  if (tab === 'tasks') {
    ;[tasks, teamMembers] = await Promise.all([
      getTasksByProject(id),
      getTeamMembersByProject(id),
    ])
  }
  if (tab === 'milestones')   milestones   = await getMilestonesByProject(id)
  if (tab === 'updates')      updates      = await getUpdatesByProject(id)
  if (tab === 'deliverables') deliverables = await getDeliverablesByProject(id)
  if (tab === 'comments')     comments     = await getCommentsByProject(id)
  if (tab === 'dispatch') {
    const supabase = (await import('@/lib/supabase')).createAdminClient()
    const { data } = await supabase
      .from('email_dispatches')
      .select('*')
      .eq('project_id', id)
      .order('sent_at', { ascending: false })
      .limit(20)
    dispatches = (data ?? []) as EmailDispatch[]
  }

  // Progress for dispatch email
  function calcProgress() {
    if (!project) return 0
    if (project.status === 'done')    return 100
    if (project.status === 'planned') return 0
    if (project.status === 'review')  return 75
    const now   = new Date()
    const start = new Date(project.year, project.start_month - 1, 1)
    const end   = new Date(project.year, project.end_month, 0)
    const total = end.getTime() - start.getTime()
    if (total <= 0) return 50
    return Math.min(95, Math.max(5, Math.round(((now.getTime() - start.getTime()) / total) * 100)))
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-6">

      <Link
        href="/dashboard"
        className="text-sm text-muted font-mono hover:text-text transition-colors w-fit"
      >
        ← dashboard
      </Link>

      {/* Header */}
      <div className="flex items-start gap-3 flex-wrap">
        <div
          className="w-3 h-3 rounded-full shrink-0 mt-1.5"
          style={{ background: project.color }}
        />
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold font-sans text-text">{project.name}</h1>
          <p className="text-sm text-muted font-mono">{project.client}</p>
        </div>
        {clientPortalSlug && (
          <CopyPortalLinkBadge clientSlug={clientPortalSlug} />
        )}
      </div>

      {/* Tab navigation */}
      <ProjectTabs active={tab} projectId={id} />

      {/* Tab content */}
      <div>
        {tab === 'timeline' && (
          <div className="flex flex-col gap-10">
            <ProjectForm
              defaultValues={project}
              isEditing
              projectId={id}
            />
            <div>
              <h3 className="text-xs font-mono text-muted uppercase tracking-widest border-b border-border pb-2 mb-4">
                Timeline Pro
              </h3>
              <TimelinePro
                tasks={tasks}
                milestones={milestones}
                teamMembers={teamMembers}
                projectId={id}
              />
            </div>
          </div>
        )}

        {tab === 'tasks' && (
          <TasksWithBoard
            projectId={id}
            initialTasks={tasks}
            teamMembers={teamMembers}
          />
        )}

        {tab === 'milestones' && (
          <MilestonesTab
            projectId={id}
            initialMilestones={milestones}
            defaultYear={project.year}
          />
        )}

        {tab === 'updates' && (
          <UpdatesTab projectId={id} updates={updates} />
        )}

        {tab === 'deliverables' && (
          <DeliverablesTab projectId={id} deliverables={deliverables} />
        )}

        {tab === 'budget' && (
          <BudgetTab project={project} />
        )}

        {tab === 'comments' && (
          <CommentsTab projectId={id} comments={comments} />
        )}

        {tab === 'dispatch' && (
          <DispatchTab
            projectId={id}
            projectName={project.name}
            projectSlug={project.slug}
            projectStatus={project.status}
            progressPercent={calcProgress()}
            linkedClientEmail={linkedClient?.email ?? null}
            dispatches={dispatches}
          />
        )}
      </div>

      <Toast message={toast} />
    </div>
  )
}
