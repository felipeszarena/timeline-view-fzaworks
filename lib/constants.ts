// ── Status configs — importar em toda a app ───────────────────
// Evita CSS variables nos e-mails; use os campos `color` e `bg` com inline styles

export const TASK_STATUS = {
  todo:        { label: 'A fazer',      color: 'var(--muted)',   bg: 'rgba(107,107,128,0.12)', order: 0 },
  in_progress: { label: 'Em andamento', color: 'var(--warn)',    bg: 'rgba(240,193,75,0.12)',  order: 1 },
  review:      { label: 'Revisão',      color: 'var(--accent2)', bg: 'rgba(123,110,246,0.12)', order: 2 },
  done:        { label: 'Concluído',    color: 'var(--success)', bg: 'rgba(110,212,160,0.12)', order: 3 },
} as const

export const PROJECT_STATUS = {
  active:  { label: 'Ativo',     color: 'var(--success)', bg: 'rgba(110,212,160,0.12)' },
  review:  { label: 'Revisão',   color: 'var(--warn)',    bg: 'rgba(240,193,75,0.12)'  },
  planned: { label: 'Planejado', color: 'var(--accent2)', bg: 'rgba(123,110,246,0.12)' },
  done:    { label: 'Concluído', color: 'var(--muted)',   bg: 'rgba(107,107,128,0.12)' },
} as const

export const INVOICE_STATUS = {
  pending:   { label: 'Pendente',  color: 'var(--warn)'    },
  paid:      { label: 'Pago',      color: 'var(--success)' },
  overdue:   { label: 'Vencido',   color: 'var(--danger)'  },
  cancelled: { label: 'Cancelado', color: 'var(--muted)'   },
} as const

export const DELIVERABLE_STATUS = {
  pending:  { label: 'Aguardando aprovação', color: 'var(--warn)'    },
  approved: { label: 'Aprovado',             color: 'var(--success)' },
  rejected: { label: 'Revisão solicitada',   color: 'var(--danger)'  },
} as const

// Swatches de cor para tasks
export const TASK_COLORS = [
  { label: 'Verde',    value: '#6ed4a0' },
  { label: 'Amarelo',  value: '#f0c14b' },
  { label: 'Vermelho', value: '#ff6b6b' },
  { label: 'Lime',     value: '#c8f06e' },
  { label: 'Roxo',     value: '#7b6ef6' },
  { label: 'Cinza',    value: '#6b6b80' },
] as const
