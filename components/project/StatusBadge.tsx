import type { Project } from '@/lib/types'

const STATUS_CONFIG: Record<Project['status'], { label: string; color: string; bg: string }> = {
  active:  { label: 'Ativo',     color: 'var(--success)', bg: 'rgba(110,212,160,0.12)' },
  review:  { label: 'Revisão',   color: 'var(--warn)',    bg: 'rgba(240,193,75,0.12)'  },
  planned: { label: 'Planejado', color: 'var(--accent2)', bg: 'rgba(123,110,246,0.12)' },
  done:    { label: 'Concluído', color: 'var(--muted)',   bg: 'rgba(107,107,128,0.12)' },
}

interface StatusBadgeProps {
  status: Project['status']
  className?: string
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-mono ${className}`}
      style={{ color: cfg.color, backgroundColor: cfg.bg }}
    >
      {cfg.label}
    </span>
  )
}
