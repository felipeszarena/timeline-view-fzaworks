'use server'

import { revalidatePath } from 'next/cache'
import { getProjectById } from '@/lib/db'
import { createAdminClient } from '@/lib/supabase'
import { sendProjectAccess, renderProjectAccessEmail } from '@/lib/email'
import type { Project } from '@/lib/types'

// ── Helpers ───────────────────────────────────────────────────

function calcProjectProgress(project: Project): number {
  if (project.status === 'done')    return 100
  if (project.status === 'planned') return 0
  if (project.status === 'review')  return 75
  // active: based on start/end month
  const now   = new Date()
  const start = new Date(project.year, project.start_month - 1, 1)
  const end   = new Date(project.year, project.end_month,       0) // last day of end_month
  const total = end.getTime() - start.getTime()
  if (total <= 0) return 50
  const elapsed = now.getTime() - start.getTime()
  return Math.min(95, Math.max(5, Math.round((elapsed / total) * 100)))
}

// ── Actions ───────────────────────────────────────────────────

export async function dispatchProjectEmails(
  projectId:       string,
  recipients:      string[],
  passwordPlain:   string,
  customMessage?:  string,
  sentBy?:         string,
): Promise<{
  successCount: number
  errorCount:   number
  errors:       { email: string; error: string }[]
}> {
  const project = await getProjectById(projectId)
  if (!project) throw new Error('Projeto não encontrado')

  const progressPercent = calcProjectProgress(project)
  const sender = sentBy ?? 'FSZA WORKS'

  // Disparar em paralelo
  const results = await Promise.allSettled(
    recipients.map(email =>
      sendProjectAccess({
        to:              email,
        projectName:     project.name,
        projectSlug:     project.slug,
        projectStatus:   project.status,
        projectPassword: passwordPlain,
        progressPercent,
        customMessage,
        sentBy:          sender,
      })
    )
  )

  const errors: { email: string; error: string }[] = []
  let successCount = 0

  results.forEach((result, i) => {
    if (result.status === 'fulfilled' && result.value.success) {
      successCount++
    } else {
      const msg =
        result.status === 'rejected'
          ? String(result.reason)
          : result.value.error ?? 'Erro desconhecido'
      errors.push({ email: recipients[i], error: msg })
    }
  })

  const supabase = createAdminClient()

  // Salvar log
  await supabase.from('email_dispatches').insert({
    project_id:    projectId,
    recipients,
    message:       customMessage ?? null,
    sent_by:       sender,
    success_count: successCount,
    error_count:   errors.length,
    errors:        errors.length > 0 ? errors : [],
  })

  // Registrar no feed do projeto
  if (successCount > 0) {
    await supabase.from('project_updates').insert({
      project_id:        projectId,
      author:            'Sistema',
      content:           `Acesso disparado para ${successCount} destinatário(s): ${recipients.join(', ')}`,
      visible_to_client: false,
    })
  }

  revalidatePath(`/dashboard/projects/${projectId}`)

  return { successCount, errorCount: errors.length, errors }
}

export async function previewProjectAccessEmail(params: {
  projectName:     string
  projectSlug:     string
  projectStatus:   Project['status']
  projectPassword: string
  progressPercent: number
  customMessage?:  string
  sentBy:          string
}): Promise<string> {
  return renderProjectAccessEmail(params)
}
