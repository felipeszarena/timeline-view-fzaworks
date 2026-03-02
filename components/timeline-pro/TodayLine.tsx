import { differenceInCalendarDays, startOfDay } from 'date-fns'

interface TodayLineProps {
  viewStart: Date
  dayWidth: number
}

export default function TodayLine({ viewStart, dayWidth }: TodayLineProps) {
  const today  = startOfDay(new Date())
  const offset = differenceInCalendarDays(today, startOfDay(viewStart))

  // Only render if today is visible in the current view
  if (offset < 0) return null

  const left = offset * dayWidth + dayWidth / 2

  return (
    <div
      className="absolute top-0 bottom-0 pointer-events-none z-10"
      style={{ left }}
    >
      {/* Label "hoje" */}
      <span
        className="absolute top-0 -translate-x-1/2 text-[9px] font-mono px-1 py-0.5 rounded-sm select-none"
        style={{
          background: 'var(--accent)',
          color:      'var(--bg)',
          lineHeight: 1.2,
        }}
      >
        hoje
      </span>

      {/* Vertical line */}
      <div
        className="absolute top-0 bottom-0 w-px"
        style={{
          left:       0,
          background: 'var(--accent)',
          opacity:    0.4,
        }}
      />
    </div>
  )
}
