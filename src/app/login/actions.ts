"use server"

import { cookies, headers } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { rateLimit } from '@/lib/rate-limit'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('votre-projet')

export async function loginWithPassword(formData: FormData) {
  const clientHeaders = headers()
  const ip = clientHeaders.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1'
  const limitRes = await rateLimit(`login_pass:${ip}`, 5, 60)
  if (!limitRes.success) {
    return { error: 'Trop de tentatives de connexion. Veuillez réessayer dans une minute.' }
  }

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
    return { error: 'Identifiants de connexion invalides. Veuillez vérifier votre adresse e-mail et votre mot de passe.' }
  }

  return { success: true }
}

export async function loginWithOtp(formData: FormData) {
  const clientHeaders = headers()
  const ip = clientHeaders.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1'
  const limitRes = await rateLimit(`login_otp:${ip}`, 3, 60)
  if (!limitRes.success) {
    return { error: 'Trop de demandes de Magic Link. Veuillez réessayer dans une minute.' }
  }

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

  await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/callback`,
      shouldCreateUser: false, // Prevents creating new random users via OTP
    },
  })

  return { success: true, message: "Si un compte correspond, un lien t'attend dans ta boîte mail." }
}

export async function resetPassword(formData: FormData) {
  const clientHeaders = headers()
  const ip = clientHeaders.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1'
  const limitRes = await rateLimit(`reset_pass:${ip}`, 3, 60)
  if (!limitRes.success) {
    return { error: 'Trop de demandes de réinitialisation. Veuillez réessayer dans une minute.' }
  }

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

  await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/callback?next=/reset-password`,
  })

  return { success: true, message: "Si un compte correspond, un lien t'attend dans ta boîte mail." }
}

export async function signUp(formData: FormData) {
  const clientHeaders = headers()
  const ip = clientHeaders.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1'
  const limitRes = await rateLimit(`signup:${ip}`, 5, 60)
  if (!limitRes.success) {
    return { error: 'Trop d\'inscriptions. Veuillez réessayer dans une minute.' }
  }

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const clubName = formData.get('clubName') as string
  const ville = formData.get('ville') as string
  const membersCount = formData.get('membersCount') as string
  const instagramLink = formData.get('instagramLink') as string
  const variant = formData.get('variant') as string
  const plan = formData.get('plan') as string

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
    return { 
      success: true, 
      isMock: true, 
      message: 'Compte créé avec succès (mode démo) ! Redirection...',
      mockUser: {
        email,
        clubName: clubName.trim(),
        ville: ville ? ville.trim() : '',
        membersCount: membersCount ? Number(membersCount) : 0,
        instagramLink: instagramLink ? instagramLink.trim() : '',
        variant: variant || 'A',
        plan: plan || 'free'
      }
    }
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
        ville: ville ? ville.trim() : '',
        members_count: membersCount ? Number(membersCount) : 0,
        instagram_link: instagramLink ? instagramLink.trim() : '',
        signup_variant: variant || 'A',
        plan: plan || 'free',
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
