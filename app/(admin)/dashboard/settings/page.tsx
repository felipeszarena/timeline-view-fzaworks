import { getAllClients } from '@/lib/db'
import { migrateProjectClients } from '@/lib/migration'
import MigrationSection from '@/components/settings/MigrationSection'

export const dynamic = 'force-dynamic'

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col gap-1 pb-4 border-b border-border">
      <h2 className="text-base font-bold font-sans text-text">{title}</h2>
      {description && (
        <p className="text-xs font-mono text-muted">{description}</p>
      )}
    </div>
  )
}

export default async function SettingsPage() {
  const [groups, clients] = await Promise.all([
    migrateProjectClients().catch(() => []),
    getAllClients().catch(() => []),
  ])

  const unlinkedCount = groups.reduce((sum, g) => sum + g.projects.length, 0)

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-10">

      <div>
        <h1 className="text-2xl font-bold font-sans text-text">Configurações</h1>
        <p className="text-sm text-muted font-mono mt-0.5">Ferramentas administrativas</p>
      </div>

      {/* ── Migration section ──────────────────────────── */}
      <section className="flex flex-col gap-5">
        <SectionHeader
          title="Migração de Dados"
          description={
            unlinkedCount > 0
              ? `${unlinkedCount} projeto${unlinkedCount > 1 ? 's' : ''} sem cliente vinculado — agrupados pelo campo de texto legado.`
              : 'Vincule projetos legados aos registros de clientes.'
          }
        />
        <MigrationSection groups={groups} clients={clients} />
      </section>

    </div>
  )
}
