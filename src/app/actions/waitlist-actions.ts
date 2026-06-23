"use server"

import { getSupabase } from '@/lib/supabase';
import { mockMembers } from '@/lib/broadcast';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('votre-projet');

export async function cancelParticipantAndPromote(participantId: string) {
  try {
    const supabase = getSupabase();

    // 1. Mode Démo / Fallback Local
    if (!isSupabaseConfigured || !supabase || participantId.startsWith('demo-')) {
      console.warn(`[MODE DÉMO] Annulation du participant ${participantId}`);
      
      // Simuler la promotion
      const mockPromoted = mockMembers[0] || { id: 'm1', name: 'Petit Noah', firstname: 'Noah', phone: '+33 6 78 90 12 34', streak: 9 };
      const cancelToken = `demo-cancel-${mockPromoted.id}`;
      
      console.warn(`[Twilio WhatsApp Simulation (Waitlist Promotion)]
        From: whatsapp:MG_CAPTEN_DEMO
        To: whatsapp:${mockPromoted.phone}
        ContentSid: HXpromotion_alert_sid
        ContentVariables: ${JSON.stringify({
          "1": mockPromoted.firstname,
          "2": "CAPTEN RUN CLUB",
          "3": "SPEED RUN & INTERVALS (Waitlist Promotion)",
          "4": cancelToken
        })}
      `);

      return {
        success: true,
        demoMode: true,
        message: "Annulation et promotion de démonstration simulées avec succès.",
        promoted: mockPromoted.firstname,
        shifted: 0
      };
    }

    // 2. Appeler la procédure stockée atomique pour éviter les conditions de concurrence
    const { data: rpcResult, error: rpcError } = await supabase.rpc('fn_cancel_and_promote', {
      p_participant_id: participantId
    });

    if (rpcError || !rpcResult) {
      return { error: rpcError?.message || 'Erreur lors du traitement de la promotion.' };
    }

    // Si la procédure stockée a renvoyé une erreur logique
    if ('error' in rpcResult && rpcResult.error) {
      return { error: rpcResult.error };
    }

    if (rpcResult.already_cancelled) {
      return { success: true, message: rpcResult.message };
    }

    if (rpcResult.type === 'waitlisted_cancelled') {
      return {
        success: true,
        promoted: null,
        message: rpcResult.message
      };
    }

    if (rpcResult.type === 'cancelled_no_promotion') {
      return {
        success: true,
        promoted: null,
        message: 'Place libérée, aucun membre sur la liste d\'attente.'
      };
    }

    // Cas d'une promotion ('promoted')
    const {
      promoted_id,
      promoted_firstname,
      promoted_phone,
      promoted_cancel_token,
      promoted_session_opened_at,
      club_id,
      club_display_name,
      twilio_service_sid,
      credit_balance_euros,
      run_title
    } = rpcResult;

    // d. Envoyer l'alerte WhatsApp de promotion
    if (promoted_phone) {
      const accountSid = process.env.TWILIO_ACCOUNT_SID || "";
      const authToken = process.env.TWILIO_AUTH_TOKEN || "";
      const contentSid = process.env.TWILIO_WHATSAPP_PROMOTION_TEMPLATE_SID || "HXpromotion_alert_sid";
      const cancelToken = promoted_cancel_token || "demo-cancel";

      const contentVariables = {
        "1": promoted_firstname || "runner",
        "2": club_display_name,
        "3": run_title,
        "4": cancelToken
      };

      let twilioSent = true;
      let actualServiceSid = twilio_service_sid || process.env.TWILIO_MESSAGING_SERVICE_SID || "";

      if (accountSid && authToken && actualServiceSid) {
        const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
        const auth = btoa(`${accountSid}:${authToken}`);
        
        const params = new URLSearchParams();
        params.append('To', `whatsapp:${promoted_phone}`);
        params.append('From', `whatsapp:${actualServiceSid}`);
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
            console.error(`[Twilio Promo Failed] ${promoted_phone} : ${res.status} - ${errText}`);
            twilioSent = false;
          }
        } catch (err) {
          console.error(`[Twilio Promo Exception] ${promoted_phone} :`, err);
          twilioSent = false;
        }
      } else {
        console.warn(`[Twilio API Simulator] Envoi WhatsApp promotionnel simulé à ${promoted_phone} avec variables ${JSON.stringify(contentVariables)}`);
      }

      if (twilioSent) {
        // e. Tarification Meta (0.08€)
        const lastSession = promoted_session_opened_at 
          ? new Date(promoted_session_opened_at).getTime() 
          : 0;
        const nowMs = new Date().getTime();
        const diffHours = (nowMs - lastSession) / (1000 * 60 * 60);

        if (diffHours >= 24) {
          if (club_id && credit_balance_euros !== null) {
            const newBalance = Math.max(-10.00, Number(credit_balance_euros) - 0.08);
            await supabase
              .from('clubs')
              .update({ credit_balance_euros: newBalance })
              .eq('id', club_id);
            
            console.log(`[Meta Billing] Waitlist Promotion - Déduction de 0.08€ du solde du club ${club_display_name}. Nouveau solde : ${newBalance.toFixed(2)}€`);
          }

          await supabase
            .from('run_participants')
            .update({ whatsapp_session_opened_at: new Date().toISOString() })
            .eq('id', promoted_id);
        }
      }
    }

    return {
      success: true,
      promoted: promoted_firstname || "Inconnu",
      shifted: 1
    };

  } catch (error: any) {
    console.error('Error in cancelParticipantAndPromote helper:', error);
    return { error: error.message || 'Erreur interne lors de l\'annulation / promotion.' };
  }
}
