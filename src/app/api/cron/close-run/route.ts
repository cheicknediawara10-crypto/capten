import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { mockMembers } from '@/lib/broadcast';

export const dynamic = 'force-dynamic';

// Helper pour l'envoi de SMS via Twilio
async function sendTwilioSMS(to: string, body: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
  const authToken = process.env.TWILIO_AUTH_TOKEN || '';
  const fromNumber = process.env.TWILIO_PHONE_NUMBER || '';

  if (!accountSid || !authToken || !fromNumber || accountSid.includes('votre_') || authToken.includes('votre_')) {
    console.warn(`[Twilio Simulation] SMS à ${to} : "${body}"`);
    return true;
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    
    const params = new URLSearchParams();
    params.append('To', to);
    params.append('From', fromNumber);
    params.append('Body', body);

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    return res.ok;
  } catch (err) {
    console.error(`Error sending Twilio SMS to ${to}:`, err);
    return false;
  }
}

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
      const mockRunTitle = "Interval Session (Démo)";
      
      const smsMessage = `Hey ${mockAthlete.firstname} ! 🔴 Vous avez manqué 2 runs du club sans annuler. Vos inscriptions sont temporairement bloquées pour laisser la place aux autres. Contactez le Captain pour réactiver votre profil.`;
      await sendTwilioSMS(mockAthlete.phone, smsMessage);

      return NextResponse.json({
        success: true,
        demoMode: true,
        message: "[MODE DÉMO] Clôture et calcul de pénalités simulés. Noah Petit a été bloqué pour 2 absences consécutives.",
        banned_member: mockAthlete.name,
        sms_sent: mockAthlete.phone
      });
    }

    // 3. Récupérer les runs terminés à clôturer
    const { data: runs, error: runsError } = await supabase
      .from('runs')
      .select('*')
      .eq('status', 'scheduled')
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

        // Si blacklisté, envoyer une notification par SMS
        if (isBlacklisted) {
          blacklistedMembers.push(memberId);
          
          // Récupérer le numéro de téléphone de l'athlète
          const { data: member } = await supabase
            .from('members')
            .select('*')
            .eq('id', memberId)
            .single();

          if (member && member.phone) {
            const smsMsg = `Hey ${member.firstname || 'runner'} ! 🔴 Vous avez manqué 2 runs sans annuler votre inscription. Vos réservations sont maintenant suspendues. Veuillez contacter le Captain de votre club.`;
            await sendTwilioSMS(member.phone, smsMsg);
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
