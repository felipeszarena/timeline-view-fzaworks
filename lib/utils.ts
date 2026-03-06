import type { Invoice, Project } from './types'
import {
  differenceInDays,
  startOfDay,
  isBefore,
  isAfter,
  format,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toZonedTime, fromZonedTime } from 'date-fns-tz'

// ── Timezone helpers ──────────────────────────────────────────

const TIMEZONE = 'America/Sao_Paulo'

/** Converte string local do input datetime-local para UTC antes de salvar */
export function toUTC(localDateString: string): string {
  return fromZonedTime(localDateString, TIMEZONE).toISOString()
}

/** Converte UTC do Supabase para horário local (SP) para exibição no input */
export function toLocal(utcString: string): string {
  const zonedDate = toZonedTime(new Date(utcString), TIMEZONE)
  return format(zonedDate, "yyyy-MM-dd'T'HH:mm")
}

/** Formata UTC para exibição legível em pt-BR: "15 mar 2026 às 09:30" */
export function formatLocalDateTime(utcString: string): string {
  const zonedDate = toZonedTime(new Date(utcString), TIMEZONE)
  return format(zonedDate, "dd MMM yyyy 'às' HH:mm", { locale: ptBR })
}

/** Retorna um Date no horário local de SP — usado no calendário */
export function toLocalDate(utcString: string): Date {
  return toZonedTime(new Date(utcString), TIMEZONE)
}

/** Converts a string to a URL-friendly slug */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/** Returns a short month name in pt-BR (e.g. "jan", "fev") */
export function monthName(month: number): string {
  return new Date(2024, month - 1).toLocaleString('pt-BR', { month: 'short' })
}

/** Returns the current month (1–12) */
export function currentMonth(): number {
  return new Date().getMonth() + 1
}

/** Returns the current year */
export function currentYear(): number {
  return new Date().getFullYear()
}

// ── Invoice helpers ───────────────────────────────────────────

/** Format a number as currency (default BRL) */
export function formatCurrency(amount: number, currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(amount)
}

/** Compute financial totals from an invoice list */
export function calcInvoiceTotals(invoices: Invoice[]) {
  const received = invoices
    .filter(i => i.type === 'client' && i.status === 'paid')
    .reduce((sum, i) => sum + i.amount, 0)

  const pending = invoices
    .filter(i => i.type === 'client' && i.status === 'pending')
    .reduce((sum, i) => sum + i.amount, 0)

  const paid_out = invoices
    .filter(i => i.type === 'team' && i.status === 'paid')
    .reduce((sum, i) => sum + i.amount, 0)

  const overdue = invoices
    .filter(i => i.status === 'overdue')
    .reduce((sum, i) => sum + i.amount, 0)

  return { received, pending, paid_out, overdue, balance: received - paid_out }
}

// ── Project helpers ───────────────────────────────────────────

/** Calculates project progress as a percentage (0–100).
 *  - status 'done' → always 100
 *  - today < start  → 0
 *  - today > end && not done → max 95 (never 100 without manual delivery)
 *  - otherwise → proportional by real date
 */
export function calcProgress(project: Project): number {
  if (project.status === 'done') return 100

  const now   = startOfDay(new Date())
  const start = startOfDay(new Date(project.year, project.start_month - 1, 1))
  const end   = startOfDay(new Date(project.year, project.end_month - 1, 28))

  if (isBefore(now, start)) return 0
  if (isAfter(now, end))    return 95

  const total   = differenceInDays(end, start)
  const elapsed = differenceInDays(now, start)
  return Math.min(95, Math.round((elapsed / total) * 100))
}

/** Returns the visual label and color for a project's progress status */
export function getProgressStatus(project: Project): { label: string; color: string } {
  if (project.status === 'done')
    return { label: 'Concluído', color: 'var(--success)' }

  const now   = new Date()
  const start = new Date(project.year, project.start_month - 1, 1)
  const end   = new Date(project.year, project.end_month - 1, 28)

  if (isBefore(now, start))
    return { label: 'Aguardando início', color: 'var(--muted)' }
  if (isAfter(now, end))
    return { label: 'Prazo encerrado', color: 'var(--danger)' }

  return { label: 'Em andamento', color: 'var(--warn)' }
}

/** Returns true if a project is past its end date and not done */
export function isOverdue(project: Project): boolean {
  const now = new Date()
  const end = new Date(project.year, project.end_month - 1, 28)
  return project.status !== 'done' && isAfter(now, end)
}

/** Returns true if a project ends this calendar month */
export function isEndingThisMonth(project: Project): boolean {
  const now = new Date()
  const cm  = now.getMonth() + 1
  const cy  = now.getFullYear()
  return project.status !== 'done' &&
    project.year === cy &&
    project.end_month === cm
}

/** Format a datetime string as pt-BR with time */
export function formatDateTime(date: string): string {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

/** Extract initials from a name (max 2 letters) */
export function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}
