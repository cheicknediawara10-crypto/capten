import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { cancelParticipantAndPromote } from '@/app/actions/waitlist-actions';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let fromPhone = '';
    let body = '';
    let messageStatus = '';
    let messageSid = '';

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await request.text();
      const params = new URLSearchParams(text);
      fromPhone = params.get('From') || ''; // format: "whatsapp:+33612345678"
      body = params.get('Body') || '';
      messageStatus = params.get('MessageStatus') || '';
      messageSid = params.get('MessageSid') || '';
    } else {
      const json = await request.json().catch(() => ({}));
      fromPhone = json.From || '';
      body = json.Body || '';
      messageStatus = json.MessageStatus || '';
      messageSid = json.MessageSid || '';
    }

    console.log(`[Twilio Webhook] Incoming message/event from: ${fromPhone}, Body: "${body}", Status: ${messageStatus}, Sid: ${messageSid}`);

    // 1. Intercepter les rapports de distribution (MessageStatus Callback)
    if (messageStatus) {
      console.log(`[Twilio Webhook Callback] Message ${messageSid} de statut ${messageStatus}`);
      return NextResponse.json({ success: true, type: 'status_callback' });
    }

    // 2. Intercepter les réponses et clics de boutons
    if (fromPhone) {
      const cleanPhone = fromPhone.replace('whatsapp:', '').trim();
      const isCancelAction = body.toLowerCase().includes('annuler') || body.toLowerCase().includes('cancel');

      if (isCancelAction) {
        const supabase = getSupabase();
        
        if (!supabase) {
          console.warn("[Twilio Webhook Simulator] Supabase non configuré. Annulation simulée pour le téléphone:", cleanPhone);
          await cancelParticipantAndPromote(`demo-${cleanPhone}`);
          return NextResponse.json({ 
            success: true, 
            simulated: true, 
            message: `[Simulateur] Place libérée pour le numéro ${cleanPhone}.`
          });
        }

        // Étape 1 : Retrouver le membre par son téléphone
        const { data: member, error: memberError } = await supabase
          .from('members')
          .select('*')
          .or(`phone.eq.${cleanPhone},phone.eq.${cleanPhone.replace('+', '')}`)
          .single();

        if (memberError || !member) {
          console.error(`[Twilio Webhook Error] Impossible de retrouver le membre avec le numéro ${cleanPhone}:`, memberError);
          return NextResponse.json({ error: 'Membre introuvable' }, { status: 404 });
        }

        // Étape 2 : Retrouver la dernière inscription active (registered ou waitlisted)
        // Note: s'ils sont sur liste d'attente, ils peuvent aussi vouloir annuler via WhatsApp.
        // Donc on cherche 'registered' ou 'waitlisted'.
        const { data: registrations, error: regError } = await supabase
          .from('run_participants')
          .select('*, runs(*)')
          .eq('member_id', member.id)
          .in('status', ['registered', 'waitlisted'])
          .order('created_at', { ascending: false })
          .limit(1);

        if (regError || !registrations || registrations.length === 0) {
          console.log(`[Twilio Webhook Warning] Aucune inscription active trouvée pour ${member.firstname} (${member.id})`);
          return NextResponse.json({ message: 'Aucune place active trouvée à annuler pour ce membre' });
        }

        const activeReg = registrations[0];
        const run = activeReg.runs;

        if (!run) {
          return NextResponse.json({ error: 'Run associé introuvable' }, { status: 404 });
        }

        // Étape 3 : Exécuter l'annulation via le service centralisé
        await cancelParticipantAndPromote(activeReg.id);

        console.log(`[Twilio Webhook Success] Place de ${member.firstname} pour le run "${run.title}" libérée avec succès via WhatsApp.`);

        // Étape 4 : Confirmer au membre par WhatsApp (Message de service gratuit si dans les 24h de session)
        const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
        const authToken = process.env.TWILIO_AUTH_TOKEN || '';
        const twilioServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID || '';

        if (accountSid && authToken && twilioServiceSid) {
          const replyUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
          const auth = btoa(`${accountSid}:${authToken}`);
          
          const replyMsg = `CAPTEN : Salut ${member.firstname}, ta place pour le run *${run.title}* a bien été libérée. Merci d'avoir prévenu ! ton strike est évité.`;
          
          const replyParams = new URLSearchParams();
          replyParams.append('To', `whatsapp:${cleanPhone}`);
          replyParams.append('From', `whatsapp:${twilioServiceSid}`);
          replyParams.append('Body', replyMsg);

          try {
            await fetch(replyUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              body: replyParams.toString()
            });
          } catch (replyErr) {
            console.error('[Twilio Webhook Reply Error] Impossible d\'envoyer le message de confirmation:', replyErr);
          }
        }

        return NextResponse.json({ 
          success: true, 
          message: 'Annulation WhatsApp traitée', 
          run: run.title, 
          runner: member.firstname 
        });
      }
    }

    return NextResponse.json({ success: true, message: 'Événement ignoré' });
  } catch (err: any) {
    console.error('[Twilio Webhook Exception] Fatal error:', err);
    return NextResponse.json({ error: 'Internal Server Error', message: err.message }, { status: 500 });
  }
}
