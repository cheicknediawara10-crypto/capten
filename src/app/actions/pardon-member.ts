"use server"

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getSupabaseAdmin } from '@/lib/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('votre-projet');

export async function pardonMember(club_id: string, member_id: string) {
  try {
    // 1. Mode Démo / Fallback Local
    if (!isSupabaseConfigured) {
      console.log(`[Mode Démo] Grâce accordée au membre ${member_id} par le club ${club_id}`);
      return { 
        success: true, 
        message: "Grâce accordée avec succès (Mode Démo)." 
      };
    }

    // 2. Client Supabase Server
    const cookieStore = cookies();
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
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
          },
        },
      }
    );

    // 3. Sécurité RLS : Vérifier l'utilisateur connecté (le Captain)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { error: 'Non authentifié. Impossible d\'accorder la grâce.' };
    }

    // Seul le Captain/club_id peut pardonner
    if (user.id !== club_id) {
      return { error: 'Accès refusé : vous n\'êtes pas le Captain fondateur de ce club.' };
    }

    // 4. Remise à zéro du streak et de la blacklist en base (memberships)
    const { data, error } = await supabase
      .from('memberships')
      .update({
        no_show_streak: 0,
        is_blacklisted: false,
        blacklisted_until: null
      })
      .eq('club_id', club_id)
      .eq('member_id', member_id)
      .select()
      .single();

    if (error) {
      return { error: `Erreur lors de la grâce du membre : ${error.message}` };
    }

    // 5. Harmoniser le débannissement dans la table runners (coureurs externes/anonymes)
    const supabaseAdmin = getSupabaseAdmin();
    if (supabaseAdmin) {
      const { error: runnerError } = await supabaseAdmin
        .from('runners')
        .update({
          is_blacklisted: false,
          blacklisted_until: null
        })
        .eq('id', member_id);

      if (runnerError) {
        console.error("Error unbanning runner profile in pardon action:", runnerError);
      }
    }

    return { 
      success: true, 
      message: 'Le membre a été gracié et réintégré avec succès !',
      membership: data 
    };

  } catch (error: any) {
    console.error('Error in pardonMember Server Action:', error);
    return { error: error.message || 'Erreur serveur lors de la grâce.' };
  }
}
