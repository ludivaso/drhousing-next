import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import {
  createMiddlewareSupabase,
  getPinHash,
  getVisibilityMap,
  isPathPrivate,
} from '@/lib/visibility'
import { PREVIEW_COOKIE } from '@/lib/visibility/pin'
import {
  getVanityEntries,
  isUuid,
  resolveAgentSlugById,
  RESERVED_VANITY_PATHS,
} from '@/lib/agents/vanity'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Admin auth gate ──────────────────────────────────────────────────────────
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const response = NextResponse.next({
      request: { headers: request.headers },
    })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }

    return response
  }

  // ── Preview gate never gates itself ─────────────────────────────────────────
  if (pathname.startsWith('/preview-gate') || pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // ── Public-page visibility gate ─────────────────────────────────────────────
  // Strip /en or /es prefix to get the base path, then check the visibility map.
  const basePath =
    pathname.startsWith('/en/')
      ? pathname.slice(3)
      : pathname.startsWith('/es/')
      ? pathname.slice(3)
      : pathname === '/en' || pathname === '/es'
      ? '/'
      : pathname

  if (basePath && basePath !== '/') {
    try {
      const supabase = createMiddlewareSupabase(() => request.cookies.getAll())
      const visibilityMap = await getVisibilityMap(supabase)

      if (isPathPrivate(basePath, visibilityMap)) {
        // Authenticated admins skip the gate
        const adminSession = await supabase.auth.getSession()
        const isAdmin = Boolean(adminSession.data.session)

        if (!isAdmin) {
          const submittedHash = request.cookies.get(PREVIEW_COOKIE)?.value
          const currentHash = await getPinHash(supabase)

          if (!currentHash || submittedHash !== currentHash) {
            const gate = new URL('/preview-gate', request.url)
            gate.searchParams.set('next', pathname + request.nextUrl.search)
            return NextResponse.redirect(gate)
          }
        }
      }
    } catch {
      // Fail open: if Supabase is unreachable we'd rather show the page than
      // lock out everyone. Admin visibility toggles should be a soft guard.
    }
  }

  // ── Legacy UUID agent links → canonical slug (301) ──────────────────────────
  // Old links to /{lang}/agents/{uuid} must keep working. Published advisors only.
  const agentUuidMatch = pathname.match(/^\/(en|es)\/agents\/([^/]+)$/)
  if (agentUuidMatch && isUuid(agentUuidMatch[2])) {
    try {
      const supabase = createMiddlewareSupabase(() => request.cookies.getAll())
      const slug = await resolveAgentSlugById(supabase, agentUuidMatch[2])
      if (slug) {
        return NextResponse.redirect(new URL(`/${agentUuidMatch[1]}/agents/${slug}`, request.url), 301)
      }
    } catch {
      // Fail open — let the [slug] page 404 normally.
    }
  }

  // ── Lang-prefixed routes — pass through ──────────────────────────────────────
  if (
    pathname.startsWith('/en/') ||
    pathname.startsWith('/es/') ||
    pathname === '/en' ||
    pathname === '/es' ||
    pathname.startsWith('/for/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // ── Root: redirect to /en ────────────────────────────────────────────────────
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/en', request.url))
  }

  // ── Legacy Spanish URLs → /es/[English route] ───────────────────────────────
  const oldToNew: Record<string, string> = {
    '/propiedades':    '/es/properties',
    '/agentes':        '/es/agents',
    '/servicios':      '/es/services',
    '/contacto':       '/es/contact',
    '/herramientas':   '/es/tools',
    '/family-affairs': '/es/family-affairs',
    '/blog':           '/es/blog',
    '/desarrollos':    '/es/desarrollos',
    '/guia-west-gam':  '/es/guia-west-gam',
    '/favoritos':      '/es/favoritos',
    '/privacidad':     '/es/privacidad',
    '/terminos':       '/es/terminos',
  }

  if (oldToNew[pathname]) {
    return NextResponse.redirect(new URL(oldToNew[pathname], request.url))
  }

  // Legacy /blog/[slug] → /es/blog/[slug]
  if (pathname.startsWith('/blog/')) {
    return NextResponse.redirect(new URL(`/es${pathname}`, request.url))
  }

  // Legacy /property/[slug] → /en/property/[slug]
  if (pathname.startsWith('/property/')) {
    return NextResponse.redirect(new URL(`/en${pathname}`, request.url))
  }

  // ── Vanity URLs: /{firstName} → /es/agents/{slug} for published advisors ────
  // Only single, dot-free, non-reserved segments are considered — every real
  // site route wins over a same-named advisor slug.
  const vanitySegment = pathname.slice(1)
  if (
    vanitySegment &&
    !vanitySegment.includes('/') &&
    !vanitySegment.includes('.') &&
    !RESERVED_VANITY_PATHS.has(vanitySegment)
  ) {
    try {
      const supabase = createMiddlewareSupabase(() => request.cookies.getAll())
      const entries = await getVanityEntries(supabase)
      const match = entries.find((e) => e.firstNameSlug === vanitySegment.toLowerCase())
      if (match) {
        return NextResponse.redirect(new URL(`/es/agents/${match.slug}`, request.url), 301)
      }
    } catch {
      // Fail open — no vanity match, continue to normal 404 handling.
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all routes EXCEPT:
     * - _next/static, _next/image, favicon
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
