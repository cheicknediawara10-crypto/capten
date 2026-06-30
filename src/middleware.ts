import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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

  // Fallback au cookie de session de simulation si Supabase n'est pas configuré
  if (!isLoggedIn && !isSupabaseConfigured) {
    const mockSession = request.cookies.get('capten_mock_session')
    if (mockSession && mockSession.value === 'active') {
      isLoggedIn = true
    }
  }

  const { pathname } = request.nextUrl

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
    '/social-wall'
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

  // Verification of 14-day free trial session lock
  if (isLoggedIn && isProtectedPath && pathname !== '/plan' && pathname !== '/settings' && !pathname.startsWith('/api')) {
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
                // Read-only check, cookies not modified
              },
            },
          }
        )
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: club } = await supabase
            .from('clubs')
            .select('trial_ends_at, stripe_subscription_status')
            .eq('id', user.id)
            .single()
          if (club) {
            const now = new Date()
            const trialEnds = new Date(club.trial_ends_at)
            const isSubscribed = club.stripe_subscription_status === 'active' || club.stripe_subscription_status === 'trialing';
            const isTrialExpired = !isSubscribed && (now > trialEnds);

            if (isTrialExpired) {
              const url = request.nextUrl.clone()
              url.pathname = '/plan'
              url.searchParams.set('trial_expired', 'true')
              return NextResponse.redirect(url)
            }
          }
        }
      } catch (e) {
        console.error('Middleware trial verification error:', e)
      }
    } else {
      // Mock demonstration trial check
      const mockTrialExpired = request.cookies.get('capten_mock_trial_expired')
      if (mockTrialExpired && mockTrialExpired.value === 'true') {
        const url = request.nextUrl.clone()
        url.pathname = '/plan'
        url.searchParams.set('trial_expired', 'true')
        return NextResponse.redirect(url)
      }
    }
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
