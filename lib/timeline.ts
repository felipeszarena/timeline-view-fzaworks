import { differenceInDays, addDays, startOfDay } from 'date-fns'

// ── Zoom configs ──────────────────────────────────────────────
export type Zoom = 'week' | 'month'

export const DAY_WIDTH: Record<Zoom, { desktop: number; mobile: number }> = {
  week:  { desktop: 40, mobile: 20 },
  month: { desktop: 24, mobile: 14 },
}

export const VISIBLE_DAYS: Record<Zoom, number> = {
  week:  14,
  month: 30,
}

// ── Default view start: hoje − 7 dias ─────────────────────────
export function defaultViewStart(): Date {
  return addDays(startOfDay(new Date()), -7)
}

// ── Position helpers ──────────────────────────────────────────

/** Pixels from the left edge of the grid to a given date */
export function getLeft(date: Date, viewStart: Date, dayWidth: number): number {
  return differenceInDays(startOfDay(date), startOfDay(viewStart)) * dayWidth
}

/** Width in pixels for a bar spanning startDate → dueDate (inclusive) */
export function getWidth(start: Date, due: Date, dayWidth: number): number {
  const days = differenceInDays(startOfDay(due), startOfDay(start)) + 1
  return Math.max(days, 1) * dayWidth
}

/** Total canvas width for N days */
export function totalWidth(totalDays: number, dayWidth: number): number {
  return totalDays * dayWidth
}
