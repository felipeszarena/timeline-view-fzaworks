import { notFound, redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import type { Metadata } from 'next'
import {
  getProjectBySlug,
  getTasksByProject,
  getMilestonesByProject,
  getUpdatesByProject,
  getDeliverablesByProject,
  getClientById,
} from '@/lib/db'
import { verifyClientJWT, CLIENT_COOKIE_PREFIX } from '@/lib/auth'
import ClientTimeline    from '@/components/client/ClientTimeline'
import ClientTimelinePro from '@/components/client/ClientTimelinePro'
import LinkButton        from '@/components/client/LinkButton'
import ProgressBar       from '@/components/client/ProgressBar'
import ClientTaskBoard   from '@/components/client/ClientTaskBoard'
import UpdateTimeline from '@/components/client/UpdateTimeline'
import DeliverableApproval from '@/components/client/DeliverableApproval'
import StatusBadge from '@/components/project/StatusBadge'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = await getProjectBySlug(slug)

  if (!project) return { title: 'Projeto' }

  const title = `${project.name} — F&A`
  const description = `Cronograma ${project.year} · ${project.client}`

  return {
    title,
    description,
    openGraph: {
      title: project.name,
      description,
      type: 'website',
    },
  }
}

export default async function ProjectViewPage({ params }: Props) {
  const { slug } = await params

  // ── Auth check ──────────────────────────────────────────────
  const cookieStore = await cookies()
  const token = cookieStore.get(`${CLIENT_COOKIE_PREFIX}${slug}`)?.value

  if (!token || !(await verifyClientJWT(token, slug))) {
    redirect(`/p/${slug}`)
  }

  // ── Data ────────────────────────────────────────────────────
  const project = await getProjectBySlug(slug)
  if (!project) notFound()

  const [tasks, milestones, updates, deliverables, linkedClient] = await Promise.all([
    getTasksByProject(project.id),
    getMilestonesByProject(project.id),
    getUpdatesByProject(project.id),
    getDeliverablesByProject(project.id),
    project.client_id ? getClientById(project.client_id) : Promise.resolve(null),
  ])

  // Portal do cliente — só exibe se o cliente tiver slug + senha configurados
  const clientPortalSlug =
    linkedClient?.slug && linkedClient?.portal_password_hash
      ? linkedClient.slug
      : null

  const visibleTasks   = tasks.filter(t => t.visible_to_client)
  const visibleUpdates = updates.filter(u => u.visible_to_client)
  // Tasks visible to client that have both dates — for the timeline
  const timelineTasks  = visibleTasks.filter(t => t.start_date && t.due_date)

  const hasLinks =
    !!project.drive_url ||
    !!project.figma_url ||
    (project.extra_links && project.extra_links.length > 0)

  return (
    <div className="min-h-screen bg-bg flex flex-col">

      {/* ── Header ──────────────────────────────────────── */}
      <header className="border-b border-border bg-surface">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <p className="text-xs text-muted font-mono mb-1.5">{project.client}</p>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold font-sans text-text">
              {project.name}
            </h1>
            <StatusBadge status={project.status} />
          </div>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────── */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-8 flex flex-col gap-10">

        {/* Progress */}
        <ProgressBar project={project} />

        {/* Timeline — Pro if tasks have dates, else month Gantt fallback */}
        {timelineTasks.length > 0 ? (
          <ClientTimelinePro tasks={timelineTasks} milestones={milestones} />
        ) : (
          <section className="flex flex-col gap-3">
            <h2 className="text-xs font-mono text-muted uppercase tracking-widest">
              Cronograma {project.year}
            </h2>
            <ClientTimeline project={project} />
          </section>
        )}

        {/* Andamento do Projeto — kanban/lista read-only */}
        <ClientTaskBoard tasks={visibleTasks} slug={slug} />

        {/* Deliverables */}
        {deliverables.length > 0 && (
          <section className="flex flex-col gap-4">
            <h2 className="text-xs font-mono text-muted uppercase tracking-widest">
              Entregáveis
            </h2>
            <div className="flex flex-col gap-3">
              {deliverables.map(d => (
                <DeliverableApproval
                  key={d.id}
                  deliverable={d}
                  projectSlug={slug}
                />
              ))}
            </div>
          </section>
        )}

        {/* Update Timeline */}
        {visibleUpdates.length > 0 && (
          <UpdateTimeline updates={visibleUpdates} />
        )}

        {/* Links */}
        {hasLinks && (
          <section className="flex flex-col gap-4">
            <h2 className="text-xs font-mono text-muted uppercase tracking-widest">
              Arquivos &amp; Links
            </h2>
            <div className="flex flex-wrap gap-3">
              {project.drive_url && (
                <LinkButton href={project.drive_url} variant="drive" />
              )}
              {project.figma_url && (
                <LinkButton href={project.figma_url} variant="figma" />
              )}
              {project.extra_links?.map((link, i) => (
                <LinkButton
                  key={i}
                  href={link.url}
                  variant="custom"
                  label={link.label}
                />
              ))}
            </div>
          </section>
        )}

        {/* Description */}
        {project.description && (
          <section className="flex flex-col gap-4">
            <h2 className="text-xs font-mono text-muted uppercase tracking-widest">
              Briefing
            </h2>
            <div className="rounded-xl border border-border bg-surface px-6 py-5">
              <p className="text-sm text-text font-mono leading-relaxed whitespace-pre-wrap">
                {project.description}
              </p>
            </div>
          </section>
        )}

      </main>

      {/* ── Área do Cliente ─────────────────────────────── */}
      {clientPortalSlug && (
        <div className="max-w-3xl w-full mx-auto px-6 pb-10">
          <div
            className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-xl border"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <span className="text-base mt-0.5" aria-hidden>🔒</span>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-sans font-semibold" style={{ color: 'var(--text)' }}>
                  Área do Cliente
                </span>
                <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
                  Acesse faturas, histórico e mais.
                </span>
              </div>
            </div>
            <a
              href={`/client-portal/${clientPortalSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-xs font-mono font-bold px-4 py-2 rounded-lg transition-opacity hover:opacity-80"
              style={{ background: 'var(--accent2)', color: '#fff' }}
            >
              Acessar Portal →
            </a>
          </div>
        </div>
      )}

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="border-t border-border py-6">
        <p className="text-center text-xs text-muted font-mono">
          Powered by{' '}
          <span className="text-accent">F&A WORKS - 2026 </span>
        </p>
      </footer>

    </div>
  )
}
