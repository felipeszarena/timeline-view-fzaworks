import { differenceInDays, startOfDay } from 'date-fns'
import type { Milestone } from '@/lib/types'

interface MilestoneMarkerProps {
  milestone: Milestone
  viewStart: Date
  dayWidth: number
}

export default function MilestoneMarker({ milestone, viewStart, dayWidth }: MilestoneMarkerProps) {
  if (!milestone.date) return null

  const date   = startOfDay(new Date(milestone.date))
  const vStart = startOfDay(viewStart)
  const offset = differenceInDays(date, vStart)

  // Don't render if today is before the visible range
  if (offset < 0) return null

  const left = offset * dayWidth + dayWidth / 2

  return (
    <div
      className="absolute top-0 bottom-0 pointer-events-none"
      style={{ left, zIndex: 5 }}
      title={milestone.title}
    >
      {/* Diamond marker */}
      <div
        className="absolute"
        style={{
          top:       6,
          left:      0,
          width:     8,
          height:    8,
          background: 'var(--accent)',
          transform:  'translateX(-50%) rotate(45deg)',
        }}
      />

      {/* Label to the right of the diamond */}
      <span
        className="absolute font-mono"
        style={{
          top:          3,
          left:         8,
          fontSize:     9,
          color:        'var(--accent)',
          whiteSpace:   'nowrap',
          maxWidth:     80,
          overflow:     'hidden',
          textOverflow: 'ellipsis',
          display:      'block',
        }}
      >
        {milestone.title}
      </span>

      {/* Dashed vertical line */}
      <div
        className="absolute top-0 bottom-0"
        style={{
          left:        0,
          width:       1,
          borderLeft:  '1px dashed var(--accent)',
          opacity:     0.35,
          transform:   'translateX(-50%)',
        }}
      />
    </div>
  )
}
