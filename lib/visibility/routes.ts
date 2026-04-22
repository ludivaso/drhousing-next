// Registry of manageable routes. Paths are stored without the /en or /es
// language prefix — the middleware strips the prefix before matching.
//
// A registry entry matches the request path if either:
//   basePath === entry.path          (exact)
//   basePath.startsWith(entry.path + '/')   (any sub-path)
//
// Keep this list ordered by group for the admin UI.

export interface ManagedRoute {
  path: string
  label: string
  group: 'Content' | 'Sections' | 'Services' | 'Other'
  description?: string
}

export const MANAGED_ROUTES: ManagedRoute[] = [
  // Content
  { path: '/blog',            label: 'Blog (index + all posts)',   group: 'Content',  description: 'Blog index and every individual post' },
  { path: '/desarrollos',     label: 'Developments',               group: 'Content',  description: 'Developments index and detail pages' },
  { path: '/interior-design', label: 'Interior Design',            group: 'Content' },
  { path: '/guia-west-gam',   label: 'West GAM Guide',             group: 'Content' },

  // Sections
  { path: '/properties',      label: 'Properties catalog',         group: 'Sections', description: 'Full listings grid' },
  { path: '/property',        label: 'Property detail pages',      group: 'Sections' },
  { path: '/for',             label: 'Curated portfolios (/for/)', group: 'Sections' },

  // Services
  { path: '/services',        label: 'Services',                   group: 'Services' },
  { path: '/family-affairs',  label: 'Family Affairs',             group: 'Services' },
  { path: '/tools',           label: 'Tools & Calculators',        group: 'Services' },

  // Other
  { path: '/agents',          label: 'Agents / Advisors',          group: 'Other' },
  { path: '/contact',         label: 'Contact',                    group: 'Other' },
]

/** True if the incoming base path (no lang prefix) matches this entry. */
export function matchesRoute(basePath: string, entryPath: string): boolean {
  return basePath === entryPath || basePath.startsWith(entryPath + '/')
}
