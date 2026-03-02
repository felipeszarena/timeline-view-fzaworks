import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ADMIN_COOKIE } from '@/lib/auth'
import Sidebar    from '@/components/ui/Sidebar'
import MobileNav  from '@/components/ui/MobileNav'
import { getAllProjects, getAllInvoices } from '@/lib/db'
import { isOverdue } from '@/lib/utils'

export const dynamic = 'force-dynamic'

async function logout() {
  'use server'
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_COOKIE)
  redirect('/login')
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [projects, invoices] = await Promise.all([
    getAllProjects().catch(() => []),
    getAllInvoices().catch(() => []),
  ])

  const today = new Date().toISOString().split('T')[0]
  const overdueProjects = projects.filter(p => isOverdue(p)).length
  const overdueInvoices = invoices.filter(
    inv => inv.status === 'pending' && inv.due_date && inv.due_date < today
  ).length
  const alertCount = overdueProjects + overdueInvoices

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar alertCount={alertCount} onLogout={logout} />
      {/* pb-20 on mobile so content clears the fixed MobileNav; removed at lg */}
      <main className="flex-1 min-w-0 overflow-auto pb-20 lg:pb-0">{children}</main>
      <MobileNav alertCount={alertCount} />
    </div>
  )
}
