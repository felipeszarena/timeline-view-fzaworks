import type { ProjectUpdate } from '@/lib/types'

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function UpdateTimeline({ updates }: { updates: ProjectUpdate[] }) {
  if (updates.length === 0) return null

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xs font-mono text-muted uppercase tracking-widest">
        Atualizações do Projeto
      </h2>
      <div className="flex flex-col">
        {updates.map((update, i) => (
          <div key={update.id} className="flex gap-4">
            {/* Timeline column: dot + connector line */}
            <div className="flex flex-col items-center">
              <div
                className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                style={{ background: 'var(--accent2)' }}
              />
              {i < updates.length - 1 && (
                <div className="w-px flex-1 bg-border mt-1" />
              )}
            </div>
            {/* Content */}
            <div className="flex flex-col gap-1 pb-6">
              <span className="text-xs font-mono text-muted">
                {formatDate(update.created_at)}
              </span>
              <p className="text-sm font-mono text-text leading-relaxed whitespace-pre-wrap">
                {update.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
