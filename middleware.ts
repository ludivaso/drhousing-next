import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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

    // Refresh session — required for Server Components to read auth state
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

  // ── Lang-prefixed routes — pass through ──────────────────────────────────────
  if (
    pathname.startsWith('/en/') ||
    pathname.startsWith('/es/') ||
    pathname === '/en' ||
    pathname === '/es' ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/for/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // ── Root: redirect to /en ────────────────────────────────────────────────────
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/en', request.url))
  }

  // ── Legacy Spanish URLs → /es/... ────────────────────────────────────────────
  const oldToNew: Record<string, string> = {
    '/propiedades':    '/es/propiedades',
    '/agentes':        '/es/agents',
    '/servicios':      '/es/servicios',
    '/contacto':       '/es/contacto',
    '/herramientas':   '/es/herramientas',
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

  // Legacy /property/[slug] → /en/property/[slug]
  if (pathname.startsWith('/property/')) {
    return NextResponse.redirect(new URL(`/en${pathname}`, request.url))
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
