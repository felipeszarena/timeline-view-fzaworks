'use client'

interface TaskDatePickerProps {
  label: string
  value?: string | null
  onChange: (value: string) => void
  placeholder?: string
  /** Se true, a data em vermelho quando vencida e task não concluída */
  overdue?: boolean
}

/** Converte ISO string para datetime-local input value (YYYY-MM-DDTHH:mm) */
function toInputValue(iso: string | null | undefined): string {
  if (!iso) return ''
  return iso.slice(0, 16)   // "2026-03-15T14:00:00+00:00" → "2026-03-15T14:00"
}

/** Formata para exibição em pt-BR: "15 mar. 2026 às 14:00" */
function formatDisplay(iso: string | null | undefined): string | null {
  if (!iso) return null
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return null
  }
}

// ── Calendar icon (SVG inline) ─────────────────────────────────
function CalendarIcon() {
  return (
    <svg
      width="14" height="14" viewBox="0 0 14 14" fill="none"
      className="shrink-0 opacity-50"
    >
      <rect x="1" y="2.5" width="12" height="10.5" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M1 5.5h12" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4.5 1v3M9.5 1v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

export default function TaskDatePicker({
  label,
  value,
  onChange,
  placeholder = 'Selecionar…',
  overdue = false,
}: TaskDatePickerProps) {
  const display = formatDisplay(value)
  const isOverdue = overdue && value && new Date(value) < new Date()

  return (
    <div className="flex flex-col gap-1.5">
      {/* Label */}
      <label className="flex items-center gap-1.5 text-xs font-mono text-muted">
        <CalendarIcon />
        {label}
      </label>

      {/* Input wrapper */}
      <div className="relative">
        <input
          type="datetime-local"
          value={toInputValue(value)}
          onChange={e => onChange(e.target.value ? new Date(e.target.value).toISOString() : '')}
          className="w-full px-3 py-2 rounded-lg border text-sm font-mono outline-none transition-colors"
          style={{
            background: 'var(--bg)',
            borderColor: 'var(--border)',
            color: isOverdue ? 'var(--danger)' : display ? 'var(--text)' : 'var(--muted)',
            colorScheme: 'dark',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        />
      </div>

      {/* Formatted display */}
      {display && (
        <span
          className="text-xs font-mono"
          style={{ color: isOverdue ? 'var(--danger)' : 'var(--muted)' }}
        >
          {display}{isOverdue && ' · vencido'}
        </span>
      )}
      {!display && (
        <span className="text-xs font-mono text-muted opacity-60">{placeholder}</span>
      )}
    </div>
  )
}
