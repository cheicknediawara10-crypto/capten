import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { mockMembers } from '@/lib/broadcast';
import { getWeatherForecast } from '@/lib/weather';

export const dynamic = 'force-dynamic';

// Helper pour l'envoi de SMS via l'API REST de Twilio
async function sendTwilioSMS(to: string, body: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
  const authToken = process.env.TWILIO_AUTH_TOKEN || '';
  const fromNumber = process.env.TWILIO_PHONE_NUMBER || '';

  // Simulation Twilio en mode démo / si clés manquantes
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

    if (res.ok) {
      console.log(`[Twilio API] SMS envoyé avec succès à ${to}`);
      return true;
    } else {
      const errText = await res.text();
      console.error(`[Twilio API] Échec d'envoi à ${to} (Status ${res.status}) : ${errText}`);
      return false;
    }
  } catch (err) {
    console.error(`[Twilio Exception] Échec d'envoi à ${to} :`, err);
    return false;
  }
}

export async function POST(request: Request) {
  return handleCron(request);
}

export async function GET(request: Request) {
  return handleCron(request);
}

async function handleCron(request: Request) {
  try {
    // 1. Sécurité : Vérification du token Secret Cron (ex: Vercel Cron, Upstash)
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get('authorization');
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const supabase = getSupabase();
    const now = new Date();
    
    // Fenêtres d'analyse élargie pour les offsets (analyse des runs dans les 2 prochaines heures et 10 dernières minutes)
    const tMin = new Date(now.getTime() - 10 * 60 * 1000).toISOString();
    const tMax = new Date(now.getTime() + 120 * 60 * 1000).toISOString();

    // 3. Mode Démo / Fallback Local si Supabase n'est pas actif
    if (!supabase) {
      console.log(`[Mode Démo Cron] Scan des runs...`);
      
      const sentList: string[] = [];
      const weatherText = "🌧️ 14°C, k-way requis, chaussures de route OK";

      for (const athlete of mockMembers) {
        const cancelUrl = `https://capten.app/api/runs/cancel?token=demo-cancel-${athlete.id}`;
        const checkinUrl = `https://capten.app/runs/demo-run/checkin?athleteId=${athlete.id}`;
        const message = `CAPTEN : Départ à 19h30. ${weatherText}.\n📍 Point de RDV et Check-in : ${checkinUrl}\n❌ Un imprévu ? Annule ici : ${cancelUrl}`;
        const ok = await sendTwilioSMS(athlete.phone, message);
        if (ok) sentList.push(athlete.phone);
      }

      return NextResponse.json({
        success: true,
        demoMode: true,
        message: "[MODE DÉMO] Notification SMS H-offset simulée avec succès.",
        sent_to: sentList
      });
    }

    // 4. Requête réelle des runs non notifiés prévus dans l'intervalle d'intérêt
    const { data: runs, error: fetchRunsError } = await supabase
      .from('runs')
      .select('*')
      .eq('sms_sent', false)
      .gte('scheduled_at', tMin)
      .lte('scheduled_at', tMax);

    if (fetchRunsError) {
      console.error('Error fetching runs for notifications:', fetchRunsError);
      return NextResponse.json({ error: fetchRunsError.message }, { status: 500 });
    }

    if (!runs || runs.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Aucun run en attente de notification dans l'intervalle d'intérêt.",
        processed: 0
      });
    }

    const processedRuns: string[] = [];
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://capten.app';

    // 5. Filtrage et traitement de chaque run selon son reminder_offset_minutes
    for (const run of runs) {
      const offset = run.reminder_offset_minutes !== undefined && run.reminder_offset_minutes !== null 
        ? run.reminder_offset_minutes 
        : 30;

      const runTime = new Date(run.scheduled_at).getTime();
      const notificationTime = runTime - offset * 60 * 1000;

      // On vérifie si l'heure actuelle a atteint ou dépassé le timing configuré pour le rappel
      if (now.getTime() < notificationTime) {
        // Trop tôt pour ce run en particulier, on le passe
        continue;
      }

      // Récupérer la liste des participants enregistrés (status = 'registered')
      const { data: participants, error: participantsError } = await supabase
        .from('run_participants')
        .select('member_id, cancel_token')
        .eq('run_id', run.id)
        .eq('status', 'registered');

      if (participantsError || !participants || participants.length === 0) {
        console.log(`Aucun participant actif à notifier pour le run ${run.id} (${run.title})`);
        // Marquer comme envoyé pour ne pas reboucler dessus
        await supabase.from('runs').update({ sms_sent: true }).eq('id', run.id);
        continue;
      }

      // Récupérer la météo locale en direct du point GPS
      const weatherText = await getWeatherForecast(run.start_latitude, run.start_longitude, run.scheduled_at);

      const memberIds = participants.map(p => p.member_id);

      // Récupérer les détails des profils
      const { data: members, error: membersError } = await supabase
        .from('members')
        .select('*')
        .in('id', memberIds);

      if (membersError || !members || members.length === 0) {
        console.warn(`Impossible de récupérer les détails des membres pour le run ${run.id}`);
        continue;
      }

      // Envoi des SMS personnalisés aux coureurs
      for (const participant of participants) {
        const member = members.find(m => m.id === participant.member_id);
        if (!member || !member.phone) continue;

        // Générer le lien d'annulation direct (sans authentification) avec le token unique
        const cancelToken = participant.cancel_token || 'demo-cancel';
        const cancelUrl = `${siteUrl}/api/runs/cancel?token=${cancelToken}`;
        const checkinUrl = `${siteUrl}/runs/${run.id}/checkin?athleteId=${member.id}`;

        // Formatage de l'heure du run en fuseau horaire français
        const dateObj = new Date(run.scheduled_at);
        const runHour = dateObj.toLocaleTimeString('fr-FR', {
          timeZone: 'Europe/Paris',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });

        // Copywriting d'élite approuvé par Reddit
        const smsMessage = `CAPTEN : Départ à ${runHour}. ${weatherText}.\n📍 Point de RDV et Check-in : ${checkinUrl}\n❌ Un imprévu ? Annule ici : ${cancelUrl}`;

        await sendTwilioSMS(member.phone, smsMessage);
      }

      // Marquer le run comme notifié
      await supabase
        .from('runs')
        .update({ sms_sent: true })
        .eq('id', run.id);

      processedRuns.push(run.id);
    }

    return NextResponse.json({
      success: true,
      processed: processedRuns.length,
      processed_runs: processedRuns
    });

  } catch (error: any) {
    console.error('SMS Cron Exception:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
