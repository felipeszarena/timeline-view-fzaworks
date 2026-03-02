// ── Project ──────────────────────────────────────────────────

export interface Project {
  id: string
  slug: string
  name: string
  client: string              // campo texto legado (manter para compatibilidade)
  client_id?: string | null   // FK para tabela clients (v2)
  client_email?: string | null // e-mail para notificações — override por projeto (v3)
  status: 'active' | 'review' | 'planned' | 'done'
  password_hash: string
  color: string
  start_month: number
  end_month: number
  year: number
  milestone_month?: number | null
  drive_url?: string | null
  figma_url?: string | null
  extra_links?: { label: string; url: string }[] | null
  description?: string | null
  budget?: number | null       // v2
  budget_currency?: string     // v2, default 'BRL'
  created_at: string
}

export type ProjectInput = Omit<Project, 'id' | 'created_at'>
export type ProjectPatch = Partial<Omit<Project, 'id' | 'created_at'>>

/** Shape of data collected by ProjectForm */
export interface ProjectFormValues {
  name: string
  client: string
  slug: string
  status: Project['status']
  color: string
  year: number
  start_month: number
  end_month: number
  milestone_month: number | null
  password: string
  drive_url: string
  figma_url: string
  description: string
  client_email: string  // v3: e-mail para notificações de entregáveis
}

// ── Client ───────────────────────────────────────────────────

export interface Client {
  id: string
  name: string
  company?: string | null
  email?: string | null
  phone?: string | null
  whatsapp?: string | null
  instagram?: string | null
  website?: string | null
  cnpj_cpf?: string | null
  address?: string | null
  notes?: string | null
  avatar_url?: string | null
  slug?: string | null                  // URL do portal: /client-portal/[slug]
  portal_password_hash?: string | null  // bcrypt da senha do portal
  created_at: string
  // joins opcionais (preenchidos por getClientWithProjects)
  projects?: Project[]
}

export type ClientInput = Omit<Client, 'id' | 'created_at' | 'projects'>
export type ClientUpdate = Partial<ClientInput>

/** Shape of data collected by ClientForm */
export interface ClientFormValues {
  name: string
  company: string
  email: string
  phone: string
  whatsapp: string
  instagram: string
  website: string
  cnpj_cpf: string
  address: string
  notes: string
  slug: string            // URL amigável do portal ex: 'joice-pereira'
  portal_password: string // senha plain-text — só usada em criar/redefinir
}

// ── ClientAttachment ─────────────────────────────────────────

export interface ClientAttachment {
  id: string
  client_id: string
  name: string
  url: string
  size?: number | null
  mime_type?: string | null
  uploaded_at: string
}

export type ClientAttachmentInput = Omit<ClientAttachment, 'id' | 'uploaded_at'>

// ── TeamMember ────────────────────────────────────────────────

export interface TeamMember {
  id: string
  name: string
  role?: string | null
  email?: string | null
  avatar_url?: string | null
  hourly_rate?: number | null
  notes?: string | null
  active: boolean
  created_at: string
}

export type TeamMemberInput = Omit<TeamMember, 'id' | 'created_at'>
export type TeamMemberUpdate = Partial<TeamMemberInput>

/** Shape of data collected by TeamForm */
export interface TeamMemberFormValues {
  name: string
  role: string
  email: string
  hourly_rate: string   // string for form input — convert to number in action
  notes: string
  active: boolean
}

// ── ProjectTeam ───────────────────────────────────────────────

export interface ProjectTeam {
  project_id: string
  team_member_id: string
  role_in_project?: string | null
}

// ── Invoice ───────────────────────────────────────────────────

export interface Invoice {
  id: string
  type: 'client' | 'team'
  client_id?: string | null
  team_member_id?: string | null
  project_id?: string | null
  title: string
  amount: number
  currency: string
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  due_date?: string | null
  paid_date?: string | null
  notes?: string | null
  attachment_url?: string | null   // storage path in 'invoice-attachments' bucket
  created_at: string
}

export type InvoiceInput = Omit<Invoice, 'id' | 'created_at'>
export type InvoiceUpdate = Partial<InvoiceInput>

/** Shape of data collected by InvoiceForm (file handled separately via FormData) */
export interface InvoiceFormValues {
  type: 'client' | 'team'
  client_id: string
  team_member_id: string
  project_id: string
  title: string
  amount: string      // string for <input type="number">
  currency: string
  status: Invoice['status']
  due_date: string
  notes: string
}

// ── Milestone ─────────────────────────────────────────────────

export interface Milestone {
  id: string
  project_id: string
  title: string
  month: number
  year: number
  date?: string | null  // v3: data exata (date), além de month/year
  done: boolean
  created_at: string
}

export type MilestoneInput = Omit<Milestone, 'id' | 'created_at'>
export type MilestoneUpdate = Partial<MilestoneInput>

// ── Task ──────────────────────────────────────────────────────

export interface Task {
  id: string
  project_id: string
  team_member_id?: string | null
  title: string
  description?: string | null
  status: 'todo' | 'in_progress' | 'review' | 'done'  // v3: +review
  start_date?: string | null   // v3: timestamptz (substitui due_month/due_year)
  due_date?: string | null     // v3: timestamptz
  color?: string | null        // v3: cor opcional por task
  visible_to_client: boolean
  order_index: number
  created_at: string
  // join opcional
  team_member?: TeamMember
}

export type TaskInput = Omit<Task, 'id' | 'created_at' | 'team_member'>
export type TaskUpdate = Partial<TaskInput>

// ── ProjectUpdate ─────────────────────────────────────────────

export interface ProjectUpdate {
  id: string
  project_id: string
  author: string
  content: string
  visible_to_client: boolean
  created_at: string
}

export type ProjectUpdateInput = Omit<ProjectUpdate, 'id' | 'created_at'>
export type ProjectUpdatePatch = Partial<ProjectUpdateInput>

// ── Deliverable ───────────────────────────────────────────────

export interface Deliverable {
  id: string
  project_id: string
  title: string
  description?: string | null
  file_url?: string | null
  preview_url?: string | null
  status: 'pending' | 'approved' | 'rejected'
  client_feedback?: string | null
  approved_at?: string | null
  created_at: string
}

export type DeliverableInput = Omit<Deliverable, 'id' | 'created_at'>
export type DeliverableUpdate = Partial<DeliverableInput>

// ── EmailDispatch ─────────────────────────────────────────────

export interface EmailDispatch {
  id: string
  project_id: string
  recipients: string[]
  message?: string | null
  sent_by: string
  sent_at: string
  success_count: number
  error_count: number
  errors: { email: string; error: string }[]
}

// ── Comment ───────────────────────────────────────────────────

export interface Comment {
  id: string
  project_id: string
  author: string
  content: string
  is_internal: boolean
  created_at: string
}

export type CommentInput = Omit<Comment, 'id' | 'created_at'>
