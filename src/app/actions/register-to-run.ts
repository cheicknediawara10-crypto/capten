"use server"

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('votre-projet');

export async function registerToRun(
  run_id: string,
  athlete_id: string,
  payment_confirmed?: boolean
) {
  try {
    // 1. Mode Démo / Fallback Local
    if (!isSupabaseConfigured) {
      if (athlete_id === 'demo-blacklisted-id' || athlete_id === 'm1') {
        return { 
          error: "Inscription impossible. Vous avez enfreint les règles d'assiduité du club." 
        };
      }
      if (athlete_id === 'demo-limit-id') {
        return {
          error: "Limite de membres atteinte pour le plan actuel du club."
        };
      }
      if (athlete_id === 'demo-waitlist-id') {
        return {
          success: true,
          waitlisted: true,
          position: 1,
          message: "Placé en liste d'attente (Mode Démo) !"
        };
      }
      return { 
        success: true, 
        message: "Inscription de démonstration confirmée !" 
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

    // 3. Récupérer les détails du run
    const { data: run, error: runError } = await supabase
      .from('runs')
      .select('*')
      .eq('id', run_id)
      .single();

    if (runError || !run) {
      return { error: 'Run introuvable.' };
    }

    if (run.status === 'cancelled' || run.status === 'completed') {
      return { error: `Ce run n'est plus ouvert aux inscriptions (Statut : ${run.status})` };
    }

    // 4. LE VERROU : Vérifier le statut de blacklist dans `memberships` ou créer le membership s'il n'existe pas
    const { data: membershipList, error: membershipFetchError } = await supabase
      .from('memberships')
      .select('*')
      .eq('club_id', run.club_id)
      .eq('member_id', athlete_id);

    const membership = membershipList && membershipList.length > 0 ? membershipList[0] : null;

    if (membership && membership.is_blacklisted) {
      return { 
        error: "Inscription impossible. Vous avez enfreint les règles d'assiduité du club." 
      };
    }

    // Si pas encore membre de ce club, on tente d'insérer l'adhésion (déclenche le verrou du plan Stripe)
    if (!membership) {
      const { error: insertMemError } = await supabase
        .from('memberships')
        .insert({
          club_id: run.club_id,
          member_id: athlete_id,
          no_show_streak: 0,
          is_blacklisted: false
        });

      if (insertMemError) {
        if (insertMemError.message.includes('Limite de membres atteinte')) {
          return { error: "Limite de membres atteinte pour le plan actuel du club." };
        }
        return { error: `Erreur d'adhésion au club : ${insertMemError.message}` };
      }
    }

    // 4b. WAITLIST : Si complet, on place l'utilisateur en file d'attente
    if (run.max_slots !== null && run.slots_taken >= run.max_slots) {
      const { count, error: countError } = await supabase
        .from('run_participants')
        .select('*', { count: 'exact', head: true })
        .eq('run_id', run.id)
        .eq('status', 'waitlisted');

      if (countError) {
        return { error: `Erreur d'évaluation de la liste d'attente : ${countError.message}` };
      }

      const nextPos = (count || 0) + 1;
      const cancelToken = Math.random().toString(36).substring(2, 14);

      const { error: joinError } = await supabase
        .from('run_participants')
        .insert({
          run_id: run.id,
          member_id: athlete_id,
          status: 'waitlisted',
          waitlist_position: nextPos,
          cancel_token: cancelToken
        });

      if (joinError) {
        if (joinError.code === '23505') {
          return { error: 'Vous êtes déjà inscrit (ou sur liste d\'attente) à ce run.' };
        }
        return { error: `Erreur d'inscription sur liste d'attente : ${joinError.message}` };
      }

      return {
        success: true,
        waitlisted: true,
        position: nextPos,
        message: `Complet — Vous avez été ajouté à la liste d'attente en position ${nextPos}.`
      };
    }


    const cancelToken = Math.random().toString(36).substring(2, 14);

    // 6. Inscrire le coureur dans `run_participants`
    const { error: joinError } = await supabase
      .from('run_participants')
      .insert({
        run_id: run.id,
        member_id: athlete_id,
        status: 'registered',
        cancel_token: cancelToken
      });

    if (joinError) {
      // Si déjà inscrit, renvoyer l'erreur correspondante
      if (joinError.code === '23505') {
        return { error: 'Vous êtes déjà inscrit à ce run.' };
      }
      return { error: `Erreur d'inscription : ${joinError.message}` };
    }

    // 7. Incrémenter les places occupées dans `runs`
    const { data: updatedRun, error: updateError } = await supabase
      .from('runs')
      .update({ slots_taken: run.slots_taken + 1 })
      .eq('id', run.id)
      .select()
      .single();

    if (updateError) {
      return { error: `Erreur de mise à jour des places : ${updateError.message}` };
    }

    return { 
      success: true, 
      message: 'Inscription validée avec succès !',
      run: updatedRun 
    };

  } catch (error: any) {
    console.error('Error in registerToRun Server Action:', error);
    return { error: error.message || 'Erreur serveur lors de l\'inscription.' };
  }
}
