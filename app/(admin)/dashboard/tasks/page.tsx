import { getAllTasksForCalendar, getAllProjects } from '@/lib/db'
import GlobalCalendar from '@/components/tasks-pro/GlobalCalendar'

export default async function TasksCalendarPage() {
  let tasks: Awaited<ReturnType<typeof getAllTasksForCalendar>> = []
  let projects: Awaited<ReturnType<typeof getAllProjects>> = []

  try {
    ;[tasks, projects] = await Promise.all([
      getAllTasksForCalendar(),
      getAllProjects(),
    ])
  } catch {
    // Supabase not configured
  }

  const projectList = projects.map(p => ({
    id:    p.id,
    name:  p.name,
    color: p.color ?? null,
  }))

  return (
    <div className="px-6 py-8 max-w-[1200px] mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-sans text-text">Calendário de Tarefas</h1>
          <p className="text-sm text-muted font-mono mt-0.5">
            Todas as tarefas com prazo definido
          </p>
        </div>
      </div>

      <GlobalCalendar tasks={tasks} projects={projectList} />
    </div>
  )
}
