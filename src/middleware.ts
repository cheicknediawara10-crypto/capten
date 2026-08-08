import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Cookie name must match src/lib/membre-session.ts
const MEMBRE_COOKIE = 'capten_membre'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Protection espace membre (fast-path: cookie presence only) ───────────
  // Full HMAC signature verification is done in requireMembreSession() inside
  // the Server Component — middleware only blocks obviously unauthenticated requests.
  if (pathname.startsWith('/mon-espace/profil') || pathname.startsWith('/mon-espace/decharge')) {
    const token = request.cookies.get(MEMBRE_COOKIE)?.value
    if (!token) {
      const url = request.nextUrl.clone()
      url.pathname = '/mon-espace'
      return NextResponse.redirect(url)
    }
  }
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const isSupabaseConfigured = 
    supabaseUrl && 
    supabaseAnonKey && 
    !supabaseUrl.includes('votre-projet')

  let isLoggedIn = false

  if (isSupabaseConfigured) {
    try {
      const supabase = createServerClient(
        supabaseUrl!,
        supabaseAnonKey!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
              response = NextResponse.next({
                request,
              })
              cookiesToSet.forEach(({ name, value, options }) =>
                response.cookies.set(name, value, options)
              )
            },
          },
        }
      )

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        isLoggedIn = true
      }
    } catch (e) {
      console.error('Erreur Middleware Supabase Auth:', e)
    }
  }

  // Fallback au cookie de session de simulation UNIQUEMENT en développement local
  if (!isLoggedIn && !isSupabaseConfigured && process.env.NODE_ENV === 'development') {
    const mockSession = request.cookies.get('capten_mock_session')
    if (mockSession && mockSession.value === 'active') {
      isLoggedIn = true
    }
  }

  const protectedPaths = [
    '/dashboard',
    '/runs',
    '/athletes',
    '/messages',
    '/plan',
    '/securite',
    '/settings',
    '/cagnotte',
    '/avantages',
    '/social-wall',
    '/spots/explorer',
    '/spots/events',
    '/spots/scan'
  ]

  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  ) && !pathname.includes('/debrief') && !pathname.includes('/checkin') && !pathname.includes('/cagnotte/contribuer') && !pathname.includes('/cagnotte/sponsor') && !pathname.includes('/securite/signaler')

  const isAuthPage = pathname.startsWith('/login')
  const isLandingPage = pathname === '/'

  if (isProtectedPath && !isLoggedIn) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectedFrom', pathname)
    return NextResponse.redirect(url)
  }



  if (isAuthPage && isLoggedIn) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Matcher pour toutes les requêtes sauf les assets statiques, favicon et API
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg|.*\\.jpg|.*\\.jpeg|.*\\.gpx|.*\\.html).*)',
  ],
}
