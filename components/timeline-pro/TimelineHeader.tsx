import { addDays, format, startOfDay, isSameDay, getDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface TimelineHeaderProps {
  viewStart: Date
  totalDays: number
  dayWidth: number
}

// ── Month spans ───────────────────────────────────────────────
interface MonthSpan {
  label: string
  days: number
}

function buildMonthSpans(viewStart: Date, totalDays: number): MonthSpan[] {
  const spans: MonthSpan[] = []
  let cur = startOfDay(viewStart)
  let remaining = totalDays

  while (remaining > 0) {
    const month  = cur.getMonth()
    const year   = cur.getFullYear()
    const label  = format(cur, 'MMMM yyyy', { locale: ptBR })

    // Count days in this month-year from current position
    let count = 0
    let d = new Date(cur)
    while (remaining > 0 && d.getMonth() === month && d.getFullYear() === year) {
      count++
      remaining--
      d = addDays(d, 1)
    }

    spans.push({ label, days: count })
    cur = d
  }

  return spans
}

// Abbreviated weekday names in pt-BR (0=Sun)
const WEEKDAY_ABBR = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function TimelineHeader({
  viewStart,
  totalDays,
  dayWidth,
}: TimelineHeaderProps) {
  const today      = startOfDay(new Date())
  const monthSpans = buildMonthSpans(viewStart, totalDays)

  // Build day array once
  const days = Array.from({ length: totalDays }, (_, i) => addDays(startOfDay(viewStart), i))

  return (
    <div
      className="select-none"
      style={{ width: totalDays * dayWidth, fontFamily: 'var(--font-mono, monospace)' }}
    >
      {/* ── Row 1: Month labels ────────────────────────────── */}
      <div className="flex" style={{ height: 24 }}>
        {monthSpans.map((span, i) => (
          <div
            key={i}
            className="flex items-center px-2 border-b border-r text-xs font-mono capitalize truncate"
            style={{
              width:       span.days * dayWidth,
              borderColor: 'var(--border)',
              color:       'var(--muted)',
              background:  'var(--surface)',
              flexShrink:  0,
            }}
          >
            {span.label}
          </div>
        ))}
      </div>

      {/* ── Row 2: Weekday abbreviation ────────────────────── */}
      <div className="flex" style={{ height: 20 }}>
        {days.map((day, i) => {
          const dow      = getDay(day)
          const isToday  = isSameDay(day, today)
          const isWeekend = dow === 0 || dow === 6

          return (
            <div
              key={i}
              className="flex items-center justify-center border-b border-r text-[10px] font-mono"
              style={{
                width:       dayWidth,
                borderColor: 'var(--border)',
                background:  isToday ? 'var(--accent)' : 'var(--surface)',
                color:       isToday   ? 'var(--bg)'
                           : isWeekend ? 'var(--muted)'
                                       : 'var(--muted)',
                opacity:     isWeekend && !isToday ? 0.5 : 1,
                flexShrink:  0,
              }}
            >
              {dayWidth >= 20 ? WEEKDAY_ABBR[dow][0] : ''}
            </div>
          )
        })}
      </div>

      {/* ── Row 3: Day numbers ─────────────────────────────── */}
      <div className="flex" style={{ height: 24 }}>
        {days.map((day, i) => {
          const dow      = getDay(day)
          const isToday  = isSameDay(day, today)
          const isWeekend = dow === 0 || dow === 6

          return (
            <div
              key={i}
              className="flex items-center justify-center border-b border-r text-[11px] font-mono font-medium"
              style={{
                width:       dayWidth,
                borderColor: 'var(--border)',
                background:  isToday ? 'var(--accent)' : 'var(--bg)',
                color:       isToday   ? 'var(--bg)'
                           : isWeekend ? 'var(--muted)'
                                       : 'var(--text)',
                opacity:     isWeekend && !isToday ? 0.5 : 1,
                flexShrink:  0,
              }}
            >
              {format(day, 'd')}
            </div>
          )
        })}
      </div>
    </div>
  )
}
