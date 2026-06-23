"use server"

import { getSupabase } from '@/lib/supabase';
import { mockMembers } from '@/lib/broadcast';
import { getWeatherForecast } from '@/lib/weather';

export async function triggerTwilioWhatsAppReminder(run_id: string) {
  try {
    const supabase = getSupabase();
    
    // 1. Mode Démo / Fallback Local si Supabase n'est pas actif
    if (!supabase) {
      console.log(`[Mode Démo WhatsApp] Déclenchement de rappels pour le run ${run_id}`);
      
      const sentList: string[] = [];
      const weatherText = "☀️ 19°C, ciel dégagé, short idéal";

      for (const athlete of mockMembers) {
        const checkinToken = athlete.id;
        const cancelToken = `demo-cancel-${athlete.id}`;
        
        console.warn(`[Twilio WhatsApp Simulation (Meta Template HXaa...)]
          From: whatsapp:MG_CAPTEN_DEMO
          To: whatsapp:${athlete.phone}
          ContentSid: HXaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
          ContentVariables: ${JSON.stringify({
            "1": athlete.firstname,
            "2": "CAPTEN RUN CLUB",
            "3": weatherText,
            "4": checkinToken,
            "5": cancelToken
          })}
        `);
        sentList.push(athlete.phone);
      }

      return {
        success: true,
        demoMode: true,
        message: "[MODE DÉMO] Rappels WhatsApp Meta simulés avec succès.",
        sent_to: sentList
      };
    }

    // 2. Récupérer les détails du Run
    const { data: run, error: runError } = await supabase
      .from('runs')
      .select('*')
      .eq('id', run_id)
      .single();

    if (runError || !run) {
      return { error: `Run introuvable : ${runError?.message}` };
    }

    // 3. Récupérer la configuration du Club
    const { data: club, error: clubError } = await supabase
      .from('clubs')
      .select('*')
      .eq('id', run.club_id)
      .single();

    let whatsappDisplayName = "CAPTEN CLUB";
    let twilioServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID || "";
    let creditBalance = 15.00;
    let messagesSentThisMonth = 0;

    if (club) {
      whatsappDisplayName = club.whatsapp_display_name;
      twilioServiceSid = club.twilio_messaging_service_sid || twilioServiceSid;
      creditBalance = Number(club.credit_balance_euros);
      messagesSentThisMonth = Number(club.whatsapp_messages_sent_this_month || 0);
    } else {
      console.warn(`Aucun club trouvé dans la table clubs pour le club_id ${run.club_id}. Utilisation des configurations par défaut.`);
    }

    // Étape 1 : Vérifier le quota mensuel WhatsApp (200 messages max)
    if (messagesSentThisMonth >= 200) {
      const errorMsg = `Quota de 200 messages WhatsApp mensuels atteint pour le club ${whatsappDisplayName}. Envois suspendus.`;
      console.warn(`[Meta Quota Alert] ${errorMsg}`);
      return {
        error: "QUOTA_MENSUEL_ATTEINT",
        message: errorMsg,
        balance: creditBalance
      };
    }

    // Étape 1.5 : Vérifier le solde. Si crédit < 0.10€, bloquer l'envoi
    if (creditBalance < 0.10) {
      const errorMsg = `Solde de crédits insuffisant pour le club ${whatsappDisplayName} (Solde : ${creditBalance.toFixed(2)}€). Envois WhatsApp suspendus.`;
      console.error(`[Meta Billing Alert] ${errorMsg}`);
      return { 
        error: "CRÉDITS_INSUFFISANTS", 
        message: errorMsg,
        balance: creditBalance 
      };
    }

    // Étape 2 : Récupérer la météo locale
    const weatherText = await getWeatherForecast(run.start_latitude, run.start_longitude, run.scheduled_at);

    // Étape 3 : Récupérer les participants inscrits actifs
    const { data: participants, error: participantsError } = await supabase
      .from('run_participants')
      .select('*, members(*)')
      .eq('run_id', run.id)
      .eq('status', 'registered');

    if (participantsError || !participants || participants.length === 0) {
      return { success: true, processed: 0, message: "Aucun participant actif à notifier." };
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID || "";
    const authToken = process.env.TWILIO_AUTH_TOKEN || "";
    const contentSid = process.env.TWILIO_WHATSAPP_TEMPLATE_SID || "HXaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

    if (!accountSid || !authToken || !twilioServiceSid) {
      console.warn("[Twilio Credentials Missing] Utilisation du simulateur Twilio en production.");
    }

    const now = new Date();
    let processedCount = 0;
    let chargeTotal = 0;

    // Étape 4 : Appeler l'API Twilio WhatsApp
    for (const p of participants) {
      const member = p.members;
      if (!member || !member.phone) continue;

      const checkinToken = member.id;
      const cancelToken = p.cancel_token || 'demo-cancel';

      const contentVariables = {
        "1": member.firstname || "runner",
        "2": whatsappDisplayName,
        "3": weatherText,
        "4": checkinToken,
        "5": cancelToken
      };

      let twilioSent = true;

      if (accountSid && authToken && twilioServiceSid) {
        // Envoi réel via l'API Twilio
        const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
        const auth = btoa(`${accountSid}:${authToken}`);
        
        const params = new URLSearchParams();
        params.append('To', `whatsapp:${member.phone}`);
        params.append('From', `whatsapp:${twilioServiceSid}`);
        params.append('ContentSid', contentSid);
        params.append('ContentVariables', JSON.stringify(contentVariables));

        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString()
          });

          if (!res.ok) {
            const errText = await res.text();
            console.error(`[Twilio WhatsApp Failed] ${member.phone} : ${res.status} - ${errText}`);
            twilioSent = false;
          }
        } catch (err) {
          console.error(`[Twilio WhatsApp Exception] ${member.phone} :`, err);
          twilioSent = false;
        }
      } else {
        // Envoi simulé si clés manquantes
        console.warn(`[Twilio API Simulator] Envoi WhatsApp simulé à ${member.phone} avec variables ${JSON.stringify(contentVariables)}`);
      }

      if (twilioSent) {
        processedCount++;

        // Étape 5 : Tarification Meta (Utility Session 24h = 0,08€)
        const lastSession = p.whatsapp_session_opened_at ? new Date(p.whatsapp_session_opened_at).getTime() : 0;
        const nowMs = now.getTime();
        const diffHours = (nowMs - lastSession) / (1000 * 60 * 60);

        // Si aucune session active de moins de 24 heures, on facture et ouvre une session
        if (diffHours >= 24) {
          chargeTotal += 0.08;
          
          // Mettre à jour la date de session du participant
          await supabase
            .from('run_participants')
            .update({ whatsapp_session_opened_at: new Date().toISOString() })
            .eq('id', p.id);
        }
      }
    }

    // Déduire les crédits du club et incrémenter le compteur de messages
    if (club) {
      const newBalance = Math.max(-10.00, creditBalance - chargeTotal); // Seuil de tolérance léger
      const newSentCount = messagesSentThisMonth + processedCount;
      
      await supabase
        .from('clubs')
        .update({ 
          credit_balance_euros: newBalance,
          whatsapp_messages_sent_this_month: newSentCount
        })
        .eq('id', club.id);

      console.log(`[Meta Billing] Déduction de ${chargeTotal.toFixed(2)}€ du solde du club ${whatsappDisplayName}. Nouveau solde : ${newBalance.toFixed(2)}€`);
      console.log(`[Meta Quota] Compteur mensuel du club ${whatsappDisplayName} mis à jour : ${newSentCount}/200 messages.`);
    }

    return {
      success: true,
      processed: processedCount,
      charge_applied: chargeTotal,
      balance_remaining: club ? creditBalance - chargeTotal : creditBalance
    };

  } catch (error: any) {
    console.error('Exception in triggerTwilioWhatsAppReminder Action:', error);
    return { error: 'EXCEPTION', message: error.message || 'Erreur interne lors des envois WhatsApp.' };
  }
}
