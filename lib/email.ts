import { Resend } from 'resend'
import { render } from '@react-email/render'
import DeliverableEmail from '@/components/email/DeliverableEmail'
import ProjectAccessEmail from '@/components/email/ProjectAccessEmail'
import type { Project } from '@/lib/types'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendProjectAccess(params: {
  to:              string
  projectName:     string
  projectSlug:     string
  projectStatus:   Project['status']
  projectPassword: string
  progressPercent: number
  customMessage?:  string
  sentBy:          string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const html = await render(
      ProjectAccessEmail({
        ...params,
        baseUrl: process.env.NEXT_PUBLIC_APP_URL!,
      })
    )

    const { error } = await resend.emails.send({
      from:    process.env.EMAIL_FROM!,
      to:      params.to,
      subject: `Acesso ao projeto: ${params.projectName}`,
      html,
    })

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

export async function renderProjectAccessEmail(params: {
  projectName:     string
  projectSlug:     string
  projectStatus:   Project['status']
  projectPassword: string
  progressPercent: number
  customMessage?:  string
  sentBy:          string
}): Promise<string> {
  return render(
    ProjectAccessEmail({
      ...params,
      baseUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    })
  )
}

export async function sendDeliverableNotification(
  to: string,
  projectName: string,
  projectSlug: string,
  deliverableTitle: string,
  deliverableDescription?: string
): Promise<void> {
  try {
    const html = await render(
      DeliverableEmail({ projectName, projectSlug, deliverableTitle, deliverableDescription })
    )
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to,
      subject: `[${projectName}] Novo entregável aguarda sua aprovação`,
      html,
    })
    if (error) console.error('[Email] Resend error:', error.message)
  } catch (error) {
    console.error('[Email] Falha ao enviar notificação:', error)
  }
}
