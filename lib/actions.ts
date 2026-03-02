'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { sendDeliverableNotification } from './email'
import {
  createProject, updateProject, deleteProject, getProjectBySlug,
  createClient, updateClient, deleteClient,
  createClientAttachment, deleteClientAttachment,
  createInvoice, updateInvoice, deleteInvoice,
  createTeamMember, updateTeamMember, deleteTeamMember,
  addProjectTeamMember, removeProjectTeamMember,
  createTask, updateTask, deleteTask, reorderTasks, getTasksByProject,
  createMilestone, updateMilestone, deleteMilestone,
  createProjectUpdate, deleteProjectUpdate,
  createDeliverable, updateDeliverable, deleteDeliverable,
  createComment, deleteComment,
} from './db'
import { createAdminClient } from './supabase'
import { signClientJWT, CLIENT_COOKIE_PREFIX } from './auth'
import { slugify } from './utils'
import type {
  ProjectFormValues, ProjectInput, ClientFormValues, ClientInput,
  TaskUpdate, DeliverableUpdate, TeamMemberFormValues,
  Invoice, InvoiceUpdate,
} from './types'

type ActionResult = { error?: string }
type ClientActionResult = ActionResult & { generatedPassword?: string }

/** Generates a random 8-character password (alphanumeric, no ambiguous chars) */
function generatePortalPassword(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789'
  return Array.from({ length: 8 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}

// ── Projects ─────────────────────────────────────────────────

export async function createProjectAction(data: ProjectFormValues): Promise<ActionResult> {
  try {
    if (!data.password) return { error: 'Senha é obrigatória' }

    const password_hash = await bcrypt.hash(data.password, 10)

    const input: ProjectInput = {
      name: data.name,
      client: data.client,
      slug: data.slug,
      status: data.status,
      color: data.color,
      year: data.year,
      start_month: data.start_month,
      end_month: data.end_month,
      milestone_month: data.milestone_month,
      password_hash,
      drive_url: data.drive_url || null,
      figma_url: data.figma_url || null,
      description: data.description || null,
      client_email: data.client_email || null,
      extra_links: [],
    }

    await createProject(input)
    revalidatePath('/dashboard')
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao criar projeto' }
  }
}

export async function updateProjectAction(id: string, data: ProjectFormValues): Promise<ActionResult> {
  try {
    const patch: Parameters<typeof updateProject>[1] = {
      name: data.name,
      client: data.client,
      slug: data.slug,
      status: data.status,
      color: data.color,
      year: data.year,
      start_month: data.start_month,
      end_month: data.end_month,
      milestone_month: data.milestone_month,
      drive_url: data.drive_url || null,
      figma_url: data.figma_url || null,
      description: data.description || null,
      client_email: data.client_email || null,
    }

    if (data.password) {
      patch.password_hash = await bcrypt.hash(data.password, 10)
    }

    await updateProject(id, patch)
    revalidatePath(`/dashboard/projects/${id}`)
    revalidatePath('/dashboard')
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao atualizar projeto' }
  }
}

export async function deleteProjectAction(id: string): Promise<ActionResult> {
  try {
    await deleteProject(id)
    revalidatePath('/dashboard')
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao deletar projeto' }
  }
}

// ── Clients ──────────────────────────────────────────────────

export async function createClientAction(data: ClientFormValues): Promise<ClientActionResult> {
  try {
    if (!data.name.trim()) return { error: 'Nome é obrigatório' }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return { error: 'E-mail inválido' }
    }

    // Slug: usar o informado ou gerar a partir do nome
    const slug = data.slug.trim()
      ? data.slug.trim()
      : slugify(data.name.trim())

    // Senha do portal: usar a informada ou gerar aleatória (8 chars)
    let generatedPassword: string | undefined
    let portal_password_hash: string | null = null

    const plainPassword = data.portal_password.trim()
    if (plainPassword) {
      portal_password_hash = await bcrypt.hash(plainPassword, 10)
    } else {
      generatedPassword = generatePortalPassword()
      portal_password_hash = await bcrypt.hash(generatedPassword, 10)
    }

    const input: ClientInput = {
      name:                 data.name.trim(),
      company:              data.company   || null,
      email:                data.email     || null,
      phone:                data.phone     || null,
      whatsapp:             data.whatsapp  || null,
      instagram:            data.instagram || null,
      website:              data.website   || null,
      cnpj_cpf:             data.cnpj_cpf  || null,
      address:              data.address   || null,
      notes:                data.notes     || null,
      slug,
      portal_password_hash,
    }

    await createClient(input)
    revalidatePath('/dashboard/clients')
    return { generatedPassword }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao criar cliente' }
  }
}

export async function updateClientAction(id: string, data: ClientFormValues): Promise<ClientActionResult> {
  try {
    if (!data.name.trim()) return { error: 'Nome é obrigatório' }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return { error: 'E-mail inválido' }
    }

    const patch: ClientInput = {
      name:      data.name.trim(),
      company:   data.company   || null,
      email:     data.email     || null,
      phone:     data.phone     || null,
      whatsapp:  data.whatsapp  || null,
      instagram: data.instagram || null,
      website:   data.website   || null,
      cnpj_cpf:  data.cnpj_cpf  || null,
      address:   data.address   || null,
      notes:     data.notes     || null,
      slug:      data.slug.trim() || null,
    }

    // Só atualiza a senha se uma nova foi informada
    if (data.portal_password.trim()) {
      patch.portal_password_hash = await bcrypt.hash(data.portal_password.trim(), 10)
    }

    await updateClient(id, patch)
    revalidatePath('/dashboard/clients')
    revalidatePath(`/dashboard/clients/${id}`)
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao atualizar cliente' }
  }
}

/** Redefine a senha do portal do cliente — retorna a nova senha gerada */
export async function resetClientPortalPasswordAction(
  clientId: string
): Promise<ClientActionResult> {
  try {
    const newPassword = generatePortalPassword()
    const portal_password_hash = await bcrypt.hash(newPassword, 10)
    await updateClient(clientId, { portal_password_hash })
    revalidatePath(`/dashboard/clients/${clientId}`)
    return { generatedPassword: newPassword }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao redefinir senha' }
  }
}

export async function deleteClientAction(id: string): Promise<ActionResult> {
  try {
    await deleteClient(id)
    revalidatePath('/dashboard/clients')
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao deletar cliente' }
  }
}

// ── Client relationships & files ─────────────────────────────

export async function linkProjectToClientAction(projectId: string, clientId: string): Promise<ActionResult> {
  try {
    await updateProject(projectId, { client_id: clientId })
    revalidatePath(`/dashboard/clients/${clientId}`)
    revalidatePath('/dashboard')
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao vincular projeto' }
  }
}

export async function unlinkProjectFromClientAction(projectId: string, clientId: string): Promise<ActionResult> {
  try {
    await updateProject(projectId, { client_id: null })
    revalidatePath(`/dashboard/clients/${clientId}`)
    revalidatePath('/dashboard')
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao desvincular projeto' }
  }
}

export async function uploadClientAttachmentAction(formData: FormData): Promise<ActionResult> {
  try {
    const file = formData.get('file') as File
    const clientId = formData.get('clientId') as string

    if (!file || !clientId) return { error: 'Dados inválidos' }

    const supabase = createAdminClient()
    const path = `${clientId}/${Date.now()}-${file.name.replace(/\s/g, '-')}`

    const { error: uploadError } = await supabase.storage
      .from('client-attachments')
      .upload(path, file, { upsert: false })

    if (uploadError) return { error: uploadError.message }

    await createClientAttachment({
      client_id: clientId,
      name: file.name,
      url: path,
      size: file.size || null,
      mime_type: file.type || null,
    })

    revalidatePath(`/dashboard/clients/${clientId}`)
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao enviar arquivo' }
  }
}

export async function deleteClientAttachmentAction(
  attachmentId: string,
  storagePath: string,
  clientId: string
): Promise<ActionResult> {
  try {
    const supabase = createAdminClient()

    const { error: storageError } = await supabase.storage
      .from('client-attachments')
      .remove([storagePath])

    if (storageError) return { error: storageError.message }

    await deleteClientAttachment(attachmentId)
    revalidatePath(`/dashboard/clients/${clientId}`)
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao deletar arquivo' }
  }
}

export async function updateClientNotesAction(clientId: string, notes: string): Promise<ActionResult> {
  try {
    await updateClient(clientId, { notes: notes || null })
    revalidatePath(`/dashboard/clients/${clientId}`)
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao atualizar notas' }
  }
}

// ── Client auth (project password gate) ──────────────────────

export async function verifyClientPasswordAction(
  slug: string,
  password: string
): Promise<ActionResult> {
  try {
    const project = await getProjectBySlug(slug)
    if (!project) return { error: 'Projeto não encontrado' }

    const valid = await bcrypt.compare(password, project.password_hash)
    if (!valid) return { error: 'Senha incorreta' }

    const token = await signClientJWT(slug)
    const cookieStore = await cookies()
    cookieStore.set(`${CLIENT_COOKIE_PREFIX}${slug}`, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return {}
  } catch {
    return { error: 'Erro ao verificar senha' }
  }
}

// ── Tasks ─────────────────────────────────────────────────────

export async function createTaskAction(projectId: string, title: string): Promise<ActionResult> {
  try {
    if (!title.trim()) return { error: 'Título é obrigatório' }
    const existing = await getTasksByProject(projectId)
    const maxOrder = existing.reduce((max, t) => Math.max(max, t.order_index), -1)
    await createTask({
      project_id: projectId,
      title: title.trim(),
      status: 'todo',
      visible_to_client: false,
      order_index: maxOrder + 1,
    })
    revalidatePath(`/dashboard/projects/${projectId}`)
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao criar tarefa' }
  }
}

export async function updateTaskAction(
  taskId: string,
  data: TaskUpdate,
  projectId: string
): Promise<ActionResult> {
  try {
    await updateTask(taskId, data)
    revalidatePath(`/dashboard/projects/${projectId}`)
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao atualizar tarefa' }
  }
}

export async function deleteTaskAction(taskId: string, projectId: string): Promise<ActionResult> {
  try {
    await deleteTask(taskId)
    revalidatePath(`/dashboard/projects/${projectId}`)
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao deletar tarefa' }
  }
}

export async function reorderTasksAction(
  orderedIds: string[],
  projectId: string
): Promise<ActionResult> {
  try {
    await reorderTasks(orderedIds)
    revalidatePath(`/dashboard/projects/${projectId}`)
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao reordenar tarefas' }
  }
}

// ── Milestones ────────────────────────────────────────────────

export async function createMilestoneAction(
  projectId: string,
  data: { title: string; month: number; year: number }
): Promise<ActionResult> {
  try {
    if (!data.title.trim()) return { error: 'Título é obrigatório' }
    await createMilestone({
      project_id: projectId,
      title: data.title.trim(),
      month: data.month,
      year: data.year,
      done: false,
    })
    revalidatePath(`/dashboard/projects/${projectId}`)
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao criar marco' }
  }
}

export async function toggleMilestoneAction(
  milestoneId: string,
  done: boolean,
  projectId: string
): Promise<ActionResult> {
  try {
    await updateMilestone(milestoneId, { done })
    revalidatePath(`/dashboard/projects/${projectId}`)
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao atualizar marco' }
  }
}

export async function deleteMilestoneAction(
  milestoneId: string,
  projectId: string
): Promise<ActionResult> {
  try {
    await deleteMilestone(milestoneId)
    revalidatePath(`/dashboard/projects/${projectId}`)
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao deletar marco' }
  }
}

// ── Project Updates ───────────────────────────────────────────

export async function createProjectUpdateAction(
  projectId: string,
  data: { content: string; author: string; visible_to_client: boolean }
): Promise<ActionResult> {
  try {
    if (!data.content.trim()) return { error: 'Conteúdo é obrigatório' }
    await createProjectUpdate({
      project_id: projectId,
      author: data.author.trim() || 'Admin',
      content: data.content.trim(),
      visible_to_client: data.visible_to_client,
    })
    revalidatePath(`/dashboard/projects/${projectId}`)
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao criar atualização' }
  }
}

export async function deleteProjectUpdateAction(
  updateId: string,
  projectId: string
): Promise<ActionResult> {
  try {
    await deleteProjectUpdate(updateId)
    revalidatePath(`/dashboard/projects/${projectId}`)
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao deletar atualização' }
  }
}

// ── Deliverables ──────────────────────────────────────────────

export async function createDeliverableAction(
  projectId: string,
  data: { title: string; description?: string; file_url?: string; preview_url?: string }
): Promise<ActionResult & { emailSent?: boolean; emailMissing?: boolean }> {
  try {
    if (!data.title.trim()) return { error: 'Título é obrigatório' }

    // 1. Insert deliverable
    const deliverable = await createDeliverable({
      project_id: projectId,
      title: data.title.trim(),
      description: data.description || null,
      file_url: data.file_url || null,
      preview_url: data.preview_url || null,
      status: 'pending',
    })

    // 2. Fetch project to get name, slug and client_email override
    const supabase = createAdminClient()
    const { data: project } = await supabase
      .from('projects')
      .select('name, slug, client_email, client_id')
      .eq('id', projectId)
      .single()

    // 3. Resolve recipient: projects.client_email → clients.email → null
    let to: string | null = project?.client_email ?? null
    if (!to && project?.client_id) {
      const { data: client } = await supabase
        .from('clients')
        .select('email')
        .eq('id', project.client_id)
        .single()
      to = client?.email ?? null
    }

    // 4a. Send notification + log success
    if (to && project) {
      await sendDeliverableNotification(
        to,
        project.name,
        project.slug,
        deliverable.title,
        deliverable.description ?? undefined
      )
      await createProjectUpdate({
        project_id: projectId,
        author: 'Sistema',
        content: `Entregável "${deliverable.title}" publicado. Notificação enviada para ${to}.`,
        visible_to_client: false,
      })
      revalidatePath(`/dashboard/projects/${projectId}`)
      return { emailSent: true }
    }

    // 4b. No email — log warning but don't fail
    if (project) {
      await createProjectUpdate({
        project_id: projectId,
        author: 'Sistema',
        content: `Entregável "${deliverable.title}" publicado. Nenhum e-mail de cliente configurado para este projeto.`,
        visible_to_client: false,
      })
    }
    revalidatePath(`/dashboard/projects/${projectId}`)
    return { emailMissing: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao criar entregável' }
  }
}

export async function updateDeliverableAction(
  deliverableId: string,
  data: DeliverableUpdate,
  projectId: string
): Promise<ActionResult> {
  try {
    await updateDeliverable(deliverableId, data)
    revalidatePath(`/dashboard/projects/${projectId}`)
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao atualizar entregável' }
  }
}

export async function deleteDeliverableAction(
  deliverableId: string,
  projectId: string
): Promise<ActionResult> {
  try {
    await deleteDeliverable(deliverableId)
    revalidatePath(`/dashboard/projects/${projectId}`)
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao deletar entregável' }
  }
}

// ── Budget ────────────────────────────────────────────────────

export async function updateProjectBudgetAction(
  projectId: string,
  budget: number | null,
  currency: string
): Promise<ActionResult> {
  try {
    await updateProject(projectId, { budget, budget_currency: currency || 'BRL' })
    revalidatePath(`/dashboard/projects/${projectId}`)
    revalidatePath('/dashboard')
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao atualizar budget' }
  }
}

// ── Migration ─────────────────────────────────────────────────

/** Link a batch of projects to an existing client */
export async function linkProjectsToClientAction(
  projectIds: string[],
  clientId: string
): Promise<ActionResult> {
  try {
    await Promise.all(projectIds.map(id => updateProject(id, { client_id: clientId })))
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/settings')
    revalidatePath('/dashboard/clients')
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao vincular projetos' }
  }
}

/** Create a new client from a legacy name and link all given projects to it */
export async function createAndLinkClientAction(
  clientName: string,
  projectIds: string[]
): Promise<ActionResult> {
  try {
    const newClient = await createClient({ name: clientName.trim() })
    await Promise.all(projectIds.map(id => updateProject(id, { client_id: newClient.id })))
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/settings')
    revalidatePath('/dashboard/clients')
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao criar e vincular cliente' }
  }
}

// ── Invoices ──────────────────────────────────────────────────

export async function createInvoiceAction(formData: FormData): Promise<ActionResult> {
  try {
    const type = formData.get('type') as 'client' | 'team'
    const title = (formData.get('title') as string)?.trim()
    const amountStr = formData.get('amount') as string
    const amount = parseFloat(amountStr)

    if (!title) return { error: 'Título é obrigatório' }
    if (isNaN(amount) || amount <= 0) return { error: 'Valor inválido' }

    const file = formData.get('file') as File | null
    let attachment_url: string | null = null

    if (file && file.size > 0) {
      const supabase = createAdminClient()
      const path = `${Date.now()}-${file.name.replace(/\s/g, '-')}`
      const { error: uploadError } = await supabase.storage
        .from('invoice-attachments')
        .upload(path, file, { upsert: false })
      if (uploadError) return { error: uploadError.message }
      attachment_url = path
    }

    const clientIdRaw = formData.get('client_id') as string
    const teamMemberIdRaw = formData.get('team_member_id') as string
    const projectIdRaw = formData.get('project_id') as string
    const dueDateRaw = formData.get('due_date') as string

    await createInvoice({
      type,
      client_id:      type === 'client' && clientIdRaw     ? clientIdRaw     : null,
      team_member_id: type === 'team'   && teamMemberIdRaw ? teamMemberIdRaw : null,
      project_id:     projectIdRaw || null,
      title,
      amount,
      currency:       (formData.get('currency') as string) || 'BRL',
      status:         (formData.get('status') as Invoice['status']) || 'pending',
      due_date:       dueDateRaw || null,
      paid_date:      null,
      notes:          (formData.get('notes') as string) || null,
      attachment_url,
    })

    revalidatePath('/dashboard/invoices')
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao criar fatura' }
  }
}

export async function updateInvoiceStatusAction(
  invoiceId: string,
  status: Invoice['status']
): Promise<ActionResult> {
  try {
    const patch: InvoiceUpdate = { status }
    if (status === 'paid') {
      patch.paid_date = new Date().toISOString().split('T')[0]
    }
    await updateInvoice(invoiceId, patch)
    revalidatePath('/dashboard/invoices')
    revalidatePath('/dashboard')
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao atualizar status' }
  }
}

export async function deleteInvoiceAction(invoiceId: string): Promise<ActionResult> {
  try {
    await deleteInvoice(invoiceId)
    revalidatePath('/dashboard/invoices')
    revalidatePath('/dashboard')
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao deletar fatura' }
  }
}

// ── Team Members ──────────────────────────────────────────────

export async function createTeamMemberAction(data: TeamMemberFormValues): Promise<ActionResult> {
  try {
    if (!data.name.trim()) return { error: 'Nome é obrigatório' }
    await createTeamMember({
      name:        data.name.trim(),
      role:        data.role        || null,
      email:       data.email       || null,
      avatar_url:  null,
      hourly_rate: data.hourly_rate ? parseFloat(data.hourly_rate) : null,
      notes:       data.notes       || null,
      active:      data.active,
    })
    revalidatePath('/dashboard/team')
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao criar membro' }
  }
}

export async function updateTeamMemberAction(id: string, data: TeamMemberFormValues): Promise<ActionResult> {
  try {
    if (!data.name.trim()) return { error: 'Nome é obrigatório' }
    await updateTeamMember(id, {
      name:        data.name.trim(),
      role:        data.role        || null,
      email:       data.email       || null,
      hourly_rate: data.hourly_rate ? parseFloat(data.hourly_rate) : null,
      notes:       data.notes       || null,
      active:      data.active,
    })
    revalidatePath('/dashboard/team')
    revalidatePath(`/dashboard/team/${id}`)
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao atualizar membro' }
  }
}

export async function deleteTeamMemberAction(id: string): Promise<ActionResult> {
  try {
    await deleteTeamMember(id)
    revalidatePath('/dashboard/team')
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao deletar membro' }
  }
}

export async function addProjectTeamAction(projectId: string, memberId: string): Promise<ActionResult> {
  try {
    await addProjectTeamMember(projectId, memberId)
    revalidatePath(`/dashboard/team/${memberId}`)
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao vincular projeto' }
  }
}

export async function removeProjectTeamAction(projectId: string, memberId: string): Promise<ActionResult> {
  try {
    await removeProjectTeamMember(projectId, memberId)
    revalidatePath(`/dashboard/team/${memberId}`)
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao desvincular projeto' }
  }
}

// ── Deliverable client actions (from client view) ─────────────

export async function approveDeliverableClientAction(
  deliverableId: string,
  projectSlug: string
): Promise<ActionResult> {
  try {
    await updateDeliverable(deliverableId, {
      status: 'approved',
      approved_at: new Date().toISOString(),
    })
    revalidatePath(`/p/${projectSlug}/view`)
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao aprovar entregável' }
  }
}

export async function rejectDeliverableClientAction(
  deliverableId: string,
  projectSlug: string,
  feedback: string
): Promise<ActionResult> {
  try {
    await updateDeliverable(deliverableId, {
      status: 'rejected',
      client_feedback: feedback.trim() || null,
    })
    revalidatePath(`/p/${projectSlug}/view`)
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao solicitar revisão' }
  }
}

// ── Comments ──────────────────────────────────────────────────

export async function createCommentAction(
  projectId: string,
  data: { author: string; content: string }
): Promise<ActionResult> {
  try {
    if (!data.content.trim()) return { error: 'Conteúdo é obrigatório' }
    await createComment({
      project_id: projectId,
      author: data.author.trim() || 'Admin',
      content: data.content.trim(),
      is_internal: true,
    })
    revalidatePath(`/dashboard/projects/${projectId}`)
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao criar comentário' }
  }
}

export async function deleteCommentAction(
  commentId: string,
  projectId: string
): Promise<ActionResult> {
  try {
    await deleteComment(commentId)
    revalidatePath(`/dashboard/projects/${projectId}`)
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao deletar comentário' }
  }
}
