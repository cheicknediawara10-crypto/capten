"use server"

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('votre-projet')

export async function loginWithPassword(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Veuillez saisir votre e-mail et votre mot de passe.' }
  }

  // Mode démonstration / fallback local si Supabase n'est pas configuré
  if (!isSupabaseConfigured) {
    if (email === 'admin@capten.club' || email === 'admin@capten.app' || email === 'test@test.com' || email.includes('admin')) {
      const cookieStore = cookies()
      cookieStore.set('capten_mock_session', 'active', {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 1 semaine
      })
      return { success: true }
    } else {
      return { error: 'Identifiant inconnu pour le mode démo. Utilisez admin@capten.club et n\'importe quel mot de passe.' }
    }
  }

  // Connexion réelle via Supabase Auth
  const cookieStore = cookies()
  const supabase = createServerClient(
    supabaseUrl!,
    supabaseAnonKey!,
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
            // Ignoré dans les server components
          }
        },
      },
    }
  )

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function loginWithOtp(formData: FormData) {
  const email = formData.get('email') as string

  if (!email) {
    return { error: 'Veuillez saisir une adresse e-mail.' }
  }

  // Mode démonstration / fallback local si Supabase n'est pas configuré
  if (!isSupabaseConfigured) {
    const cookieStore = cookies()
    cookieStore.set('capten_mock_session', 'active', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    })
    return { success: true, message: 'Magic link de démonstration simulé avec succès !' }
  }

  // Envoi du Magic Link réel via Supabase Auth
  const cookieStore = cookies()
  const supabase = createServerClient(
    supabaseUrl!,
    supabaseAnonKey!,
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
          } catch {}
        },
      },
    }
  )

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function resetPassword(formData: FormData) {
  const email = formData.get('email') as string

  if (!email) {
    return { error: 'Veuillez saisir une adresse e-mail.' }
  }

  // Mode démonstration / fallback local si Supabase n'est pas configuré
  if (!isSupabaseConfigured) {
    return { success: true, message: 'Un e-mail de réinitialisation vous a été envoyé (simulation).' }
  }

  const cookieStore = cookies()
  const supabase = createServerClient(
    supabaseUrl!,
    supabaseAnonKey!,
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
          } catch {}
        },
      },
    }
  )

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/callback?next=/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const clubName = formData.get('clubName') as string

  if (!email || !password) {
    return { error: 'Veuillez saisir votre e-mail et votre mot de passe.' }
  }

  if (password.length < 6) {
    return { error: 'Le mot de passe doit contenir au moins 6 caractères.' }
  }

  if (!clubName || clubName.trim().length < 2) {
    return { error: 'Veuillez saisir le nom de votre run club.' }
  }

  // Mode démonstration / fallback local si Supabase n'est pas configuré
  if (!isSupabaseConfigured) {
    const cookieStore = cookies()
    cookieStore.set('capten_mock_session', 'active', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    })
    return { success: true, message: 'Compte créé avec succès (mode démo) ! Redirection...' }
  }

  // Inscription réelle via Supabase Auth
  const cookieStore = cookies()
  const supabase = createServerClient(
    supabaseUrl!,
    supabaseAnonKey!,
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
          } catch {}
        },
      },
    }
  )

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        club_name: clubName.trim(),
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/callback`,
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'Un compte existe déjà avec cet e-mail. Connectez-vous plutôt.' }
    }
    return { error: error.message }
  }

  // Check if email confirmation is required
  if (data?.user?.identities?.length === 0) {
    return { error: 'Un compte existe déjà avec cet e-mail. Connectez-vous plutôt.' }
  }

  return { 
    success: true, 
    needsConfirmation: true,
    message: 'Compte créé ! Vérifiez vos e-mails pour confirmer votre inscription.' 
  }
}

export async function logout() {
  const cookieStore = cookies()
  
  // Suppression du cookie de simulation
  cookieStore.set('capten_mock_session', '', { maxAge: 0, path: '/' })

  if (isSupabaseConfigured) {
    const supabase = createServerClient(
      supabaseUrl!,
      supabaseAnonKey!,
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
            } catch {}
          },
        },
      }
    )
    await supabase.auth.signOut()
  }

  return { success: true }
}

export async function updatePassword(formData: FormData) {
  const password = formData.get('password') as string

  if (!password || password.length < 6) {
    return { error: 'Le mot de passe doit contenir au moins 6 caractères.' }
  }

  // Mode démo
  if (!isSupabaseConfigured) {
    return { success: true, message: 'Mot de passe mis à jour avec succès (mode démo) !' }
  }

  const cookieStore = cookies()
  const supabase = createServerClient(
    supabaseUrl!,
    supabaseAnonKey!,
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
          } catch {}
        },
      },
    }
  )

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true, message: 'Votre mot de passe a été mis à jour avec succès.' }
}
