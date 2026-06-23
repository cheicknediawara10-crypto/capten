import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = cookies()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseAnonKey) {
      const response = NextResponse.redirect(`${origin}${next}`)
      try {
        const supabase = createServerClient(
          supabaseUrl,
          supabaseAnonKey,
          {
            cookies: {
              getAll() {
                return cookieStore.getAll()
              },
              setAll(cookiesToSet) {
                try {
                  cookiesToSet.forEach(({ name, value, options }) =>
                    cookieStore.set(name, value, options)
                  )
                } catch {
                  // Fallback for read-only GET contexts: write directly to NextResponse
                  cookiesToSet.forEach(({ name, value, options }) =>
                    response.cookies.set(name, value, options)
                  )
                }
              },
            },
          }
        )
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
          return response
        }
        console.error('Callback auth code exchange error:', error)
      } catch (err) {
        console.error('Callback auth error:', err)
      }
    }
  }

  // Redirection de secours
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
