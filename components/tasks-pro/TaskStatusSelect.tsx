'use client'

import { useState, useRef, useEffect } from 'react'
import type { Task } from '@/lib/types'
import { TASK_STATUS } from '@/lib/constants'

interface TaskStatusSelectProps {
  /** Current status value */
  status: Task['status']
  /** Called with the new status when changed */
  onChange: (status: Task['status']) => void
  /** If true, show a smaller compact badge style */
  compact?: boolean
  disabled?: boolean
}

const STATUSES = Object.entries(TASK_STATUS) as [
  Task['status'],
  (typeof TASK_STATUS)[Task['status']]
][]

export default function TaskStatusSelect({
  status,
  onChange,
  compact = false,
  disabled = false,
}: TaskStatusSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const current = TASK_STATUS[status]

  function select(s: Task['status']) {
    setOpen(false)
    if (s !== status) onChange(s)
  }

  return (
    <div ref={ref} className="relative inline-block">
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          padding: compact ? '2px 8px' : '5px 10px',
          background: current.bg,
          border: `1px solid ${current.color}40`,
          color: current.color,
        }}
      >
        {/* Colored dot */}
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: current.color }}
        />
        <span className="text-xs font-mono font-medium whitespace-nowrap">
          {current.label}
        </span>
        {!disabled && (
          <svg
            width="10" height="10" viewBox="0 0 10 10" fill="none"
            className="shrink-0 opacity-60"
            style={{ marginLeft: 2, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
          >
            <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute z-50 mt-1 min-w-[160px] rounded-lg border overflow-hidden shadow-xl"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          {STATUSES.map(([key, cfg]) => (
            <button
              key={key}
              type="button"
              onClick={() => select(key)}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors"
              style={{
                background: key === status ? cfg.bg : 'transparent',
                color: key === status ? cfg.color : 'var(--text)',
              }}
              onMouseEnter={e => {
                if (key !== status) (e.currentTarget as HTMLElement).style.background = 'var(--bg)'
              }}
              onMouseLeave={e => {
                if (key !== status) (e.currentTarget as HTMLElement).style.background = 'transparent'
              }}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: cfg.color }}
              />
              <span className="text-xs font-mono">{cfg.label}</span>
              {key === status && (
                <span className="ml-auto text-xs opacity-60">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
