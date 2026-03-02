import { currentMonth, monthName } from '@/lib/utils'

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

export default function MonthHeader() {
  const now = currentMonth()

  return (
    <div className="flex border-b border-border">
      {/* Info column spacer */}
      <div className="shrink-0 w-[140px] lg:w-[260px] px-3 lg:px-4 py-2 border-r border-border">
        <span className="text-xs text-muted font-mono uppercase tracking-widest">Projeto</span>
      </div>

      {/* Month columns */}
      {MONTHS.map((m) => (
        <div
          key={m}
          className="flex-1 min-w-[32px] py-2 text-center"
          style={{
            borderRight: '1px solid var(--border)',
          }}
        >
          <span
            className="text-xs font-mono uppercase"
            style={{
              color: m === now ? 'var(--accent)' : 'var(--muted)',
              fontWeight: m === now ? 700 : 400,
            }}
          >
            {monthName(m)}
          </span>
        </div>
      ))}
    </div>
  )
}
