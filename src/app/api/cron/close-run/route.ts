import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { mockMembers } from '@/lib/broadcast';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  return handleCloseRun(request);
}

export async function GET(request: Request) {
  return handleCloseRun(request);
}

async function handleCloseRun(request: Request) {
  try {
    // 1. Sécurité : Vérification du token Secret Cron
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get('authorization');
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const supabase = getSupabase();
    const now = new Date();
    // Seuil : runs commencés il y a plus de 3 heures (durée moyenne run 2h + 1h d'attente après clôture)
    const cutoff = new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString();

    // 2. Mode Démo / Fallback Local
    if (!supabase) {
      console.log(`[Mode Démo Cron] Clôture des runs démarrés avant le ${cutoff}`);
      
      // Simulation pour un athlète fictif qui fait son 2ème no-show
      const mockAthlete = mockMembers[0] || { id: 'm1', name: 'Petit Noah', firstname: 'Noah', phone: '+33 6 78 90 12 34', streak: 9 };
      
      return NextResponse.json({
        success: true,
        demoMode: true,
        message: "[MODE DÉMO] Clôture et calcul de pénalités simulés. Noah Petit a été bloqué pour 2 absences consécutives.",
        banned_member: mockAthlete.name,
        sms_sent: false
      });
    }

    // 3. Récupérer les runs terminés à clôturer (statuts 'scheduled' ou 'planned')
    const { data: runs, error: runsError } = await supabase
      .from('runs')
      .select('*')
      .in('status', ['scheduled', 'planned'])
      .lte('scheduled_at', cutoff);

    if (runsError) {
      console.error('Error fetching runs to close:', runsError);
      return NextResponse.json({ error: runsError.message }, { status: 500 });
    }

    if (!runs || runs.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Aucun run en attente de clôture pour le moment.",
        processed: 0
      });
    }

    const processedRuns: string[] = [];
    const blacklistedMembers: string[] = [];

    for (const run of runs) {
      // Étape 1 : Mettre au statut 'no_show' les participants 'registered'
      const { data: updatedParticipants, error: updatePartError } = await supabase
        .from('run_participants')
        .update({ status: 'no_show' })
        .eq('run_id', run.id)
        .eq('status', 'registered')
        .select();

      if (updatePartError) {
        console.error(`Error updating participants for run ${run.id}:`, updatePartError);
        continue;
      }

      // Récupérer tous les participants pour ce run
      const { data: allParticipants, error: allPartError } = await supabase
        .from('run_participants')
        .select('*')
        .eq('run_id', run.id);

      if (allPartError || !allParticipants) {
        console.error('Error fetching participants:', allPartError);
        continue;
      }

      const noShows = allParticipants.filter(p => p.status === 'no_show');
      const attended = allParticipants.filter(p => p.status === 'attended' || p.status === 'checked_in');

      // Étape 2 : Traiter les absents (No-Shows)
      for (const noShow of noShows) {
        const memberId = noShow.member_id;

        // Récupérer le membership du membre pour ce club
        const { data: membership, error: memError } = await supabase
          .from('memberships')
          .select('*')
          .eq('club_id', run.club_id)
          .eq('member_id', memberId)
          .single();

        let streak = 1;
        if (membership) {
          streak = membership.no_show_streak + 1;
        }

        const isBlacklisted = streak >= 2;

        const { error: upsertError } = await supabase
          .from('memberships')
          .upsert({
            club_id: run.club_id,
            member_id: memberId,
            no_show_streak: streak,
            is_blacklisted: isBlacklisted
          }, { onConflict: 'club_id,member_id' });

        if (upsertError) {
          console.error(`Error upserting membership for member ${memberId}:`, upsertError);
          continue;
        }

        // Si blacklisté, ajouter à la liste et mettre à jour également la table public.runners
        if (isBlacklisted) {
          blacklistedMembers.push(memberId);

          const { error: runnerError } = await supabase
            .from('runners')
            .update({
              is_blacklisted: true,
              blacklisted_until: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString()
            })
            .eq('id', memberId);

          if (runnerError) {
            console.error(`Error blacklisting runner ${memberId} in runners table:`, runnerError);
          }
        }
      }

      // Étape 3 : Réinitialiser la streak des personnes présentes
      const presentMemberIds = attended.map(p => p.member_id);
      if (presentMemberIds.length > 0) {
        const { error: resetError } = await supabase
          .from('memberships')
          .update({ no_show_streak: 0 })
          .eq('club_id', run.club_id)
          .in('member_id', presentMemberIds);

        if (resetError) {
          console.error('Error resetting streak for active members:', resetError);
        }
      }

      // Clôturer le run en base
      await supabase
        .from('runs')
        .update({ status: 'completed' })
        .eq('id', run.id);

      processedRuns.push(run.id);
    }

    // Purger les anciennes confirmations de retour de plus de 30 jours (RGPD / Rétention minimale)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { error: purgeError } = await supabase
      .from('check_retour')
      .delete()
      .lt('confirmed_at', thirtyDaysAgo);

    if (purgeError) {
      console.error('Erreur lors de la purge des fiches check_retour de +30 jours :', purgeError);
    }

    return NextResponse.json({
      success: true,
      processed: processedRuns.length,
      runs: processedRuns,
      blacklisted_count: blacklistedMembers.length,
      blacklisted_ids: blacklistedMembers
    });

  } catch (error: any) {
    console.error('Error in close-run cron route:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
