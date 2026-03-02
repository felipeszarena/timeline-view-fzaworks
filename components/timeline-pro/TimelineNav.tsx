'use client'

import { addDays, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Zoom } from '@/lib/timeline'
import { VISIBLE_DAYS, defaultViewStart } from '@/lib/timeline'

interface TimelineNavProps {
  viewStart: Date
  zoom: Zoom
  onViewStartChange: (d: Date) => void
  onZoomChange: (z: Zoom) => void
}

export default function TimelineNav({
  viewStart,
  zoom,
  onViewStartChange,
  onZoomChange,
}: TimelineNavProps) {
  const step = VISIBLE_DAYS[zoom]

  function prev() {
    onViewStartChange(addDays(viewStart, -step))
  }

  function next() {
    onViewStartChange(addDays(viewStart, step))
  }

  function goToday() {
    onViewStartChange(defaultViewStart())
  }

  // Label do período visível
  const viewEnd = addDays(viewStart, VISIBLE_DAYS[zoom] - 1)
  const startLabel = format(viewStart, 'dd MMM', { locale: ptBR })
  const endLabel   = format(viewEnd,   'dd MMM yyyy', { locale: ptBR })

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Navegação prev / hoje / next */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={prev}
          className="px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors hover:border-accent hover:text-accent"
          style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
        >
          ← Anterior
        </button>

        <button
          type="button"
          onClick={goToday}
          className="px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors hover:border-accent hover:text-accent"
          style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
        >
          Hoje
        </button>

        <button
          type="button"
          onClick={next}
          className="px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors hover:border-accent hover:text-accent"
          style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
        >
          Próxima →
        </button>
      </div>

      {/* Período visível */}
      <span className="text-xs font-mono text-muted">
        {startLabel} — {endLabel}
      </span>

      {/* Toggle zoom */}
      <div
        className="flex items-center gap-0.5 p-0.5 rounded-lg border ml-auto"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        {(['week', 'month'] as Zoom[]).map(z => (
          <button
            key={z}
            type="button"
            onClick={() => onZoomChange(z)}
            className="px-3 py-1 rounded-md text-xs font-mono transition-colors"
            style={{
              background: zoom === z ? 'var(--accent)' : 'transparent',
              color:      zoom === z ? 'var(--bg)'     : 'var(--muted)',
            }}
          >
            {z === 'week' ? 'Semana' : 'Mês'}
          </button>
        ))}
      </div>
    </div>
  )
}
