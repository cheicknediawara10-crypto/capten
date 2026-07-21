import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function getAuthenticatedCaptainId(): Promise<string | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // Mock Fallback — uniquement en développement local
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('votre-projet')) {
    if (process.env.NODE_ENV === 'development') {
      return 'mock-captain-uuid';
    }
    return null;
  }

  try {
    const cookieStore = cookies();
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        }
      }
    });
    const { data: { user } } = await supabase.auth.getUser();
    return user ? user.id : null;
  } catch (err) {
    console.error("Authentication error in server API helper:", err);
    return null;
  }
}
