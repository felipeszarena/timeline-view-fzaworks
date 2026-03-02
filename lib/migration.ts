import { createAdminClient } from './supabase'
import type { Project, Client } from './types'

export interface MigrationGroup {
  /** The raw `project.client` text value shared by these projects */
  clientText: string
  /** Projects in this group (all have client_id === null) */
  projects: Project[]
  /** Existing client whose name matches clientText (case-insensitive), if any */
  suggestedClient?: Client
}

/**
 * Groups unlinked projects (client_id IS NULL) by their legacy `client` text field.
 * For each group, suggests an existing client record whose name matches.
 * Use this data to drive the bulk-link migration UI.
 */
export async function migrateProjectClients(): Promise<MigrationGroup[]> {
  const supabase = createAdminClient()

  const [{ data: projects, error: pErr }, { data: clients, error: cErr }] =
    await Promise.all([
      supabase
        .from('projects')
        .select('*')
        .is('client_id', null)
        .order('client', { ascending: true }),
      supabase
        .from('clients')
        .select('*')
        .order('name', { ascending: true }),
    ])

  if (pErr) throw new Error(`migrateProjectClients (projects): ${pErr.message}`)
  if (cErr) throw new Error(`migrateProjectClients (clients): ${cErr.message}`)

  // Group by client text (skip blank entries)
  const groupMap = new Map<string, Project[]>()
  for (const p of (projects ?? []) as Project[]) {
    const key = (p.client ?? '').trim()
    if (!key) continue
    if (!groupMap.has(key)) groupMap.set(key, [])
    groupMap.get(key)!.push(p)
  }

  // Suggest matching client for each group (name or company, case-insensitive)
  return Array.from(groupMap.entries()).map(([clientText, projectList]) => {
    const lower = clientText.toLowerCase()
    const suggested = (clients ?? [] as Client[]).find(
      (c: Client) =>
        c.name.toLowerCase() === lower ||
        (c.company ?? '').toLowerCase() === lower
    )
    return { clientText, projects: projectList, suggestedClient: suggested }
  })
}
