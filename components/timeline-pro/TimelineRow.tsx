import type { Task } from '@/lib/types'
import TimelineTask from './TimelineTask'

interface TimelineRowProps {
  task:       Task
  viewStart:  Date
  dayWidth:   number
  totalDays:  number
  onEdit:     (task: Task) => void
  index:      number
}

export default function TimelineRow({
  task,
  viewStart,
  dayWidth,
  totalDays,
  onEdit,
  index,
}: TimelineRowProps) {
  return (
    <div
      className="relative"
      style={{
        height:       52,
        width:        totalDays * dayWidth,
        background:   index % 2 === 1 ? 'rgba(255,255,255,0.015)' : 'transparent',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <TimelineTask
        task={task}
        viewStart={viewStart}
        dayWidth={dayWidth}
        onEdit={onEdit}
      />
    </div>
  )
}
