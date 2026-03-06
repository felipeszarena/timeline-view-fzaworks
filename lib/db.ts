import { createAdminClient } from './supabase'
import type {
  Project, ProjectInput, ProjectPatch,
  Client, ClientInput, ClientUpdate,
  ClientAttachment, ClientAttachmentInput,
  Invoice, InvoiceInput, InvoiceUpdate,
  TeamMember, TeamMemberInput, TeamMemberUpdate, ProjectTeam,
  Milestone, MilestoneInput, MilestoneUpdate,
  Task, TaskInput, TaskUpdate,
  ProjectUpdate, ProjectUpdateInput,
  Deliverable, DeliverableInput, DeliverableUpdate,
  Comment, CommentInput,
} from './types'

// ── Projects ─────────────────────────────────────────────────

/** Fetch all projects ordered by creation date (admin use) */
export async function getAllProjects(): Promise<Project[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(`getAllProjects: ${error.message}`)
  return data as Project[]
}

/** Fetch a single project by its id (admin edit page) */
export async function getProjectById(id: string): Promise<Project | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data as Project
}

/** Fetch a single project by its slug (public + admin use) */
export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) return null
  return data as Project
}

/** Create a new project — password_hash must already be hashed before calling */
export async function createProject(data: ProjectInput): Promise<Project> {
  const supabase = createAdminClient()
  const { data: project, error } = await supabase
    .from('projects')
    .insert(data)
    .select()
    .single()

  if (error) throw new Error(`createProject: ${error.message}`)
  return project as Project
}

/** Update project fields by id */
export async function updateProject(id: string, data: ProjectPatch): Promise<Project> {
  const supabase = createAdminClient()
  const { data: project, error } = await supabase
    .from('projects')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`updateProject: ${error.message}`)
  return project as Project
}

/** Delete a project by id */
export async function deleteProject(id: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) throw new Error(`deleteProject: ${error.message}`)
}

// ── Clients ──────────────────────────────────────────────────

/** Fetch all clients ordered by name */
export async function getAllClients(): Promise<Client[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw new Error(`getAllClients: ${error.message}`)
  return data as Client[]
}

/** Fetch a single client by portal slug */
export async function getClientBySlug(slug: string): Promise<Client | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) return null
  return data as Client
}

/** Fetch a single client by id */
export async function getClientById(id: string): Promise<Client | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data as Client
}

/** Fetch a client together with all linked projects */
export async function getClientWithProjects(id: string): Promise<Client | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*, projects(*)')
    .eq('id', id)
    .single()

  if (error) return null
  return data as Client
}

/** Create a new client */
export async function createClient(data: ClientInput): Promise<Client> {
  const supabase = createAdminClient()
  const { data: client, error } = await supabase
    .from('clients')
    .insert(data)
    .select()
    .single()

  if (error) throw new Error(`createClient: ${error.message}`)
  return client as Client
}

/** Update client fields by id */
export async function updateClient(id: string, data: ClientUpdate): Promise<Client> {
  const supabase = createAdminClient()
  const { data: client, error } = await supabase
    .from('clients')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`updateClient: ${error.message}`)
  return client as Client
}

/** Delete a client by id — projects.client_id will be set to null (ON DELETE SET NULL) */
export async function deleteClient(id: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)

  if (error) throw new Error(`deleteClient: ${error.message}`)
}

// ── Client Attachments ───────────────────────────────────────

/** Fetch all attachments for a client */
export async function getClientAttachments(clientId: string): Promise<ClientAttachment[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('client_attachments')
    .select('*')
    .eq('client_id', clientId)
    .order('uploaded_at', { ascending: false })

  if (error) throw new Error(`getClientAttachments: ${error.message}`)
  return data as ClientAttachment[]
}

/** Save a new attachment record */
export async function createClientAttachment(data: ClientAttachmentInput): Promise<ClientAttachment> {
  const supabase = createAdminClient()
  const { data: attachment, error } = await supabase
    .from('client_attachments')
    .insert(data)
    .select()
    .single()

  if (error) throw new Error(`createClientAttachment: ${error.message}`)
  return attachment as ClientAttachment
}

/** Delete an attachment record by id */
export async function deleteClientAttachment(id: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('client_attachments')
    .delete()
    .eq('id', id)

  if (error) throw new Error(`deleteClientAttachment: ${error.message}`)
}

// ── Invoices ──────────────────────────────────────────────────

/** Fetch all invoices ordered by creation date desc */
export async function getAllInvoices(): Promise<Invoice[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(`getAllInvoices: ${error.message}`)
  return data as Invoice[]
}

/** Fetch invoices for a specific client */
export async function getInvoicesByClient(clientId: string): Promise<Invoice[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`getInvoicesByClient: ${error.message}`)
  return data as Invoice[]
}

/** Fetch invoices for a specific team member */
export async function getInvoicesByTeamMember(memberId: string): Promise<Invoice[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('team_member_id', memberId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`getInvoicesByTeamMember: ${error.message}`)
  return data as Invoice[]
}

/** Create a new invoice */
export async function createInvoice(data: InvoiceInput): Promise<Invoice> {
  const supabase = createAdminClient()
  const { data: invoice, error } = await supabase
    .from('invoices')
    .insert(data)
    .select()
    .single()

  if (error) throw new Error(`createInvoice: ${error.message}`)
  return invoice as Invoice
}

/** Update an invoice by id */
export async function updateInvoice(id: string, data: InvoiceUpdate): Promise<Invoice> {
  const supabase = createAdminClient()
  const { data: invoice, error } = await supabase
    .from('invoices')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`updateInvoice: ${error.message}`)
  return invoice as Invoice
}

/** Delete an invoice by id */
export async function deleteInvoice(id: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id)

  if (error) throw new Error(`deleteInvoice: ${error.message}`)
}

// ── Team Members ──────────────────────────────────────────────

/** Fetch team members linked to a project via project_team */
export async function getTeamMembersByProject(projectId: string): Promise<TeamMember[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('project_team')
    .select('team_members(*)')
    .eq('project_id', projectId)

  if (error) throw new Error(`getTeamMembersByProject: ${error.message}`)
  return (data ?? []).map((row: { team_members: unknown }) => row.team_members as TeamMember)
}

/** Fetch all team members ordered by name */
export async function getAllTeamMembers(): Promise<TeamMember[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw new Error(`getAllTeamMembers: ${error.message}`)
  return data as TeamMember[]
}

/** Fetch a single team member by id */
export async function getTeamMemberById(id: string): Promise<TeamMember | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data as TeamMember
}

/** Create a new team member */
export async function createTeamMember(data: TeamMemberInput): Promise<TeamMember> {
  const supabase = createAdminClient()
  const { data: member, error } = await supabase
    .from('team_members')
    .insert(data)
    .select()
    .single()

  if (error) throw new Error(`createTeamMember: ${error.message}`)
  return member as TeamMember
}

/** Update a team member by id */
export async function updateTeamMember(id: string, data: TeamMemberUpdate): Promise<TeamMember> {
  const supabase = createAdminClient()
  const { data: member, error } = await supabase
    .from('team_members')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`updateTeamMember: ${error.message}`)
  return member as TeamMember
}

/** Fetch all projects linked to a team member via project_team */
export async function getTeamMemberProjects(memberId: string): Promise<Project[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('project_team')
    .select('projects(*)')
    .eq('team_member_id', memberId)

  if (error) throw new Error(`getTeamMemberProjects: ${error.message}`)
  return (data ?? []).map((row: { projects: unknown }) => row.projects as Project)
}

/** Delete a team member by id */
export async function deleteTeamMember(id: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', id)

  if (error) throw new Error(`deleteTeamMember: ${error.message}`)
}

/** Fetch all project_team rows (used for computing per-member project counts) */
export async function getAllProjectTeam(): Promise<ProjectTeam[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('project_team')
    .select('*')

  if (error) throw new Error(`getAllProjectTeam: ${error.message}`)
  return data as ProjectTeam[]
}

/** Fetch all tasks assigned to a team member */
export async function getTasksByTeamMember(memberId: string): Promise<Task[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('team_member_id', memberId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`getTasksByTeamMember: ${error.message}`)
  return data as Task[]
}

/** Link a project to a team member (upsert) */
export async function addProjectTeamMember(projectId: string, memberId: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('project_team')
    .upsert(
      { project_id: projectId, team_member_id: memberId },
      { onConflict: 'project_id,team_member_id' }
    )

  if (error) throw new Error(`addProjectTeamMember: ${error.message}`)
}

/** Remove the link between a project and a team member */
export async function removeProjectTeamMember(projectId: string, memberId: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('project_team')
    .delete()
    .eq('project_id', projectId)
    .eq('team_member_id', memberId)

  if (error) throw new Error(`removeProjectTeamMember: ${error.message}`)
}

// ── Milestones ────────────────────────────────────────────────

/** Fetch all milestones for a project ordered by year, month */
export async function getMilestonesByProject(projectId: string): Promise<Milestone[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('milestones')
    .select('*')
    .eq('project_id', projectId)
    .order('year', { ascending: true })
    .order('month', { ascending: true })

  if (error) throw new Error(`getMilestonesByProject: ${error.message}`)
  return data as Milestone[]
}

/** Create a new milestone */
export async function createMilestone(data: MilestoneInput): Promise<Milestone> {
  const supabase = createAdminClient()
  const { data: milestone, error } = await supabase
    .from('milestones')
    .insert(data)
    .select()
    .single()

  if (error) throw new Error(`createMilestone: ${error.message}`)
  return milestone as Milestone
}

/** Update a milestone by id (e.g. toggle done) */
export async function updateMilestone(id: string, data: MilestoneUpdate): Promise<Milestone> {
  const supabase = createAdminClient()
  const { data: milestone, error } = await supabase
    .from('milestones')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`updateMilestone: ${error.message}`)
  return milestone as Milestone
}

/** Delete a milestone by id */
export async function deleteMilestone(id: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('milestones')
    .delete()
    .eq('id', id)

  if (error) throw new Error(`deleteMilestone: ${error.message}`)
}

// ── Tasks ─────────────────────────────────────────────────────

/** Fetch all tasks across all projects that have a due_date, with project info */
export async function getAllTasksForCalendar(): Promise<(Task & { project_name: string; project_color: string | null })[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('tasks')
    .select('*, projects(name, color)')
    .not('due_date', 'is', null)
    .order('due_date', { ascending: true })

  if (error) throw new Error(`getAllTasksForCalendar: ${error.message}`)
  return (data ?? []).map((t: Record<string, unknown>) => {
    const proj = t.projects as { name: string; color: string | null } | null
    return { ...t, project_name: proj?.name ?? '', project_color: proj?.color ?? null } as Task & { project_name: string; project_color: string | null }
  })
}

/** Fetch all tasks for a project ordered by order_index */
export async function getTasksByProject(projectId: string): Promise<Task[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('order_index', { ascending: true })

  if (error) throw new Error(`getTasksByProject: ${error.message}`)
  return data as Task[]
}

/** Create a new task */
export async function createTask(data: TaskInput): Promise<Task> {
  const supabase = createAdminClient()
  const { data: task, error } = await supabase
    .from('tasks')
    .insert(data)
    .select()
    .single()

  if (error) throw new Error(`createTask: ${error.message}`)
  return task as Task
}

/** Update a task by id */
export async function updateTask(id: string, data: TaskUpdate): Promise<Task> {
  const supabase = createAdminClient()
  const { data: task, error } = await supabase
    .from('tasks')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`updateTask: ${error.message}`)
  return task as Task
}

/** Delete a task by id */
export async function deleteTask(id: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)

  if (error) throw new Error(`deleteTask: ${error.message}`)
}

/** Batch-update order_index for a list of task ids */
export async function reorderTasks(orderedIds: string[]): Promise<void> {
  const supabase = createAdminClient()
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from('tasks').update({ order_index: index }).eq('id', id)
    )
  )
}

// ── Project Updates ───────────────────────────────────────────

/** Fetch all updates for a project ordered by creation date desc */
export async function getUpdatesByProject(projectId: string): Promise<ProjectUpdate[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('project_updates')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`getUpdatesByProject: ${error.message}`)
  return data as ProjectUpdate[]
}

/** Create a new project update */
export async function createProjectUpdate(data: ProjectUpdateInput): Promise<ProjectUpdate> {
  const supabase = createAdminClient()
  const { data: update, error } = await supabase
    .from('project_updates')
    .insert(data)
    .select()
    .single()

  if (error) throw new Error(`createProjectUpdate: ${error.message}`)
  return update as ProjectUpdate
}

/** Delete a project update by id */
export async function deleteProjectUpdate(id: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('project_updates')
    .delete()
    .eq('id', id)

  if (error) throw new Error(`deleteProjectUpdate: ${error.message}`)
}

// ── Deliverables ──────────────────────────────────────────────

/** Fetch all deliverables for a project */
export async function getDeliverablesByProject(projectId: string): Promise<Deliverable[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('deliverables')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`getDeliverablesByProject: ${error.message}`)
  return data as Deliverable[]
}

/** Create a new deliverable */
export async function createDeliverable(data: DeliverableInput): Promise<Deliverable> {
  const supabase = createAdminClient()
  const { data: deliverable, error } = await supabase
    .from('deliverables')
    .insert(data)
    .select()
    .single()

  if (error) throw new Error(`createDeliverable: ${error.message}`)
  return deliverable as Deliverable
}

/** Update a deliverable by id */
export async function updateDeliverable(id: string, data: DeliverableUpdate): Promise<Deliverable> {
  const supabase = createAdminClient()
  const { data: deliverable, error } = await supabase
    .from('deliverables')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`updateDeliverable: ${error.message}`)
  return deliverable as Deliverable
}

/** Delete a deliverable by id */
export async function deleteDeliverable(id: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('deliverables')
    .delete()
    .eq('id', id)

  if (error) throw new Error(`deleteDeliverable: ${error.message}`)
}

// ── Comments ──────────────────────────────────────────────────

/** Fetch all comments for a project ordered by creation date asc */
export async function getCommentsByProject(projectId: string): Promise<Comment[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(`getCommentsByProject: ${error.message}`)
  return data as Comment[]
}

/** Create a new comment */
export async function createComment(data: CommentInput): Promise<Comment> {
  const supabase = createAdminClient()
  const { data: comment, error } = await supabase
    .from('comments')
    .insert(data)
    .select()
    .single()

  if (error) throw new Error(`createComment: ${error.message}`)
  return comment as Comment
}

/** Delete a comment by id */
export async function deleteComment(id: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', id)

  if (error) throw new Error(`deleteComment: ${error.message}`)
}
