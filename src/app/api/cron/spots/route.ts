import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { resend } from '@/lib/resend';
import { calculateSplit } from '@/lib/spots';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}

async function handleCron(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');

  // Protection par clé secrète en production
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.log('[Spots Cron Mock] Supabase non configuré. Cron exécuté en mode simulation.');
    return NextResponse.json({ 
      success: true, 
      message: 'Simulation locale du cron réussie (pas de base de données).' 
    });
  }

  const logs: string[] = [];

  try {
    const now = new Date();

    // ============================================================
    // JOB 1 : Expiration des propositions après 72h
    // ============================================================
    const cutoffExpired = new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString();
    const { data: expiredEvents, error: expireError } = await supabase
      .from('spot_events')
      .update({ status: 'expired' })
      .eq('status', 'proposed')
      .lt('created_at', cutoffExpired)
      .select('id');

    if (expireError) {
      logs.push(`Error expiring proposals: ${expireError.message}`);
    } else {
      logs.push(`Expired ${expiredEvents?.length || 0} older proposals.`);
    }

    // ============================================================
    // JOB 2 : Clôture des ventes (H-1 de l'événement) et transition vers 'completed'
    // ============================================================
    // Recherche des événements en vente ('on_sale') qui se déroulent dans moins d'une heure ou passés
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const tomorrowDate = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { data: eventsToClose, error: fetchCloseError } = await supabase
      .from('spot_events')
      .select('*, spot:spots(*), club:clubs(*)')
      .eq('status', 'on_sale')
      .lte('event_date', tomorrowDate); // Sécurité de date

    if (fetchCloseError) {
      logs.push(`Error fetching events to close: ${fetchCloseError.message}`);
    } else if (eventsToClose) {
      let closedCount = 0;

      for (const event of eventsToClose) {
        // Combiner date et heure pour comparaison précise
        const eventDateTime = new Date(`${event.event_date}T${event.event_time}`);
        
        if (eventDateTime.getTime() <= oneHourFromNow.getTime()) {
          // 1. Mettre à jour l'événement à completed
          await supabase
            .from('spot_events')
            .update({ status: 'completed' })
            .eq('id', event.id);

          closedCount++;

          // 2. Récupérer tous les billets vendus payés ('paid' ou 'redeemed')
          const { data: tickets } = await supabase
            .from('spot_tickets')
            .select('amount_cents, is_first_visit, commission_applied')
            .eq('spot_event_id', event.id)
            .in('status', ['paid', 'redeemed']);

          const totalSalesCents = (tickets || []).reduce((acc, t) => acc + t.amount_cents, 0);

          if (totalSalesCents > 0) {
            let merchantTotal = 0;
            let clubTotal = 0;
            let platformTotal = 0;

            if (tickets) {
              for (const ticket of tickets) {
                const ticketSplits = calculateSplit(
                  ticket.amount_cents,
                  event.club_rate,
                  event.platform_rate,
                  ticket.commission_applied
                );
                merchantTotal += ticketSplits.merchantAmount;
                clubTotal += ticketSplits.clubAmount;
                platformTotal += ticketSplits.platformAmount;
              }
            }

            // 3. Créditer la cagnotte du club
            const currentBalance = event.club?.spots_balance_cents || 0;
            await supabase
              .from('clubs')
              .update({ spots_balance_cents: currentBalance + clubTotal })
              .eq('id', event.club_id);

            // 4. Récupérer l'email du fondateur pour le récap
            const { data: founderProfile } = await supabase
              .from('profiles')
              .select('email')
              .eq('id', event.club_id)
              .maybeSingle();

            // 5. Envoyer les récapitulatifs par email
            const spotObj = Array.isArray(event.spot) ? event.spot[0] : event.spot;
            const clubObj = Array.isArray(event.club) ? event.club[0] : event.club;
            const merchantEmail = (spotObj as any)?.contact_email;
            const spotName = (spotObj as any)?.name || 'Commerce';
            const clubName = (clubObj as any)?.whatsapp_display_name || 'Club';
            
            // Email au commerce
            if (merchantEmail) {
              try {
                await resend.emails.send({
                  from: 'Capten Spots <spots@capten.app>',
                  to: merchantEmail,
                  subject: `📈 Rapport financier Capten Spots — Sortie ${clubName}`,
                  html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e5e5e5; border-radius: 8px;">
                      <h2 style="color: #FF5C00;">SORTIE TERMINÉE — MERCI !</h2>
                      <p>Bonjour,</p>
                      <p>Le run de <strong>${clubName}</strong> s'est achevé dans votre établissement <strong>${spotName}</strong>.</p>
                      
                      <div style="background-color: #F4F5F7; padding: 15px; border-radius: 6px; margin: 20px 0;">
                        <p style="margin: 5px 0;">🎫 <strong>Formules prépayées :</strong> ${(tickets || []).length} vendues</p>
                        <p style="margin: 5px 0;">💰 <strong>Volume total généré :</strong> ${(totalSalesCents / 100).toFixed(2)}€</p>
                        <p style="margin: 5px 0; font-size: 16px; color: #FF5C00;">💸 <strong>Votre reversement net :</strong> <strong>${(merchantTotal / 100).toFixed(2)}€</strong></p>
                      </div>
                      
                      <p>Ce virement automatique sera crédité directement sur le compte bancaire configuré sur votre dashboard Stripe Connect sous 2 à 3 jours ouvrés.</p>
                      <p style="font-size: 12px; color: #888;">Merci de faire partie de la communauté Capten Spots.</p>
                    </div>
                  `
                });
              } catch (e) {
                console.error('Failed sending merchant recap email:', e);
              }
            }

            // Email au fondateur
            if (founderProfile?.email) {
              try {
                await resend.emails.send({
                  from: 'Capten Spots <spots@capten.app>',
                  to: founderProfile.email,
                  subject: `🔥 Le Compteur Spots — Cagnotte Club créditée !`,
                  html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e5e5e5; border-radius: 8px;">
                      <h2 style="color: #FF5C00; text-transform: uppercase;">Vos gains du week-end</h2>
                      <p>Salut Captain !</p>
                      <p>Votre événement de running chez <strong>${spotName}</strong> est terminé.</p>
                      
                      <div style="background-color: #FDFCF8; border: 1px solid #E5E5E5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                        <span style="font-size: 12px; color: #888; text-transform: uppercase; font-weight: bold;">Ta part Club</span>
                        <h1 style="color: #111; font-size: 36px; margin: 10px 0;">+${(clubTotal / 100).toFixed(2)}€</h1>
                        <p style="margin: 0; font-size: 13px; color: #666;">Cagnotte Spots totale : <strong>${((currentBalance + clubTotal) / 100).toFixed(2)}€</strong></p>
                      </div>

                      <div style="font-size: 14px; color: #333; line-height: 1.5;">
                        <p style="margin: 5px 0;">🏃‍♂️ <strong>Coureurs inscrits :</strong> ${(tickets || []).length} participants</p>
                        <p style="margin: 5px 0;">🥤 <strong>Offre consommée :</strong> ${event.quota} places max de "${event.offer_price_cents / 100}€ : Café + En-cas"</p>
                      </div>

                      <p style="margin-top: 25px;">Votre cagnotte est disponible pour des virements manuels ou achats de matériel club. Continuez d'animer l'économie locale !</p>
                    </div>
                  `
                });
              } catch (e) {
                console.error('Failed sending club recap email:', e);
              }
            }
          }
        }
      }
      logs.push(`Closed sales for ${closedCount} events and processed payouts.`);
    }

    // ============================================================
    // JOB 3 : Rappels J-1 pour les billets coureurs
    // ============================================================
    // Recherche des événements de demain
    const tomorrowStr = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const { data: tomorrowEvents, error: fetchRemindError } = await supabase
      .from('spot_events')
      .select('*, spot:spots(*), club:clubs(*)')
      .eq('status', 'on_sale')
      .eq('event_date', tomorrowStr);

    if (fetchRemindError) {
      logs.push(`Error fetching tomorrow events: ${fetchRemindError.message}`);
    } else if (tomorrowEvents) {
      let remindersSent = 0;

      for (const event of tomorrowEvents) {
        // Récupérer les tickets 'paid' pour cet événement
        const { data: tickets } = await supabase
          .from('spot_tickets')
          .select('*')
          .eq('spot_event_id', event.id)
          .eq('status', 'paid');

        if (tickets) {
          for (const ticket of tickets) {
            const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${ticket.qr_token}`;
            const ticketUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://capten.app'}/spots/ticket/${ticket.id}`;
            const spotObj = Array.isArray(event.spot) ? event.spot[0] : event.spot;
            const spotName = (spotObj as any)?.name || 'Commerce';
            const spotAddress = (spotObj as any)?.address || '';
            const offerDesc = (spotObj as any)?.offer_description || '';

            try {
              await resend.emails.send({
                from: 'Capten Spots <spots@capten.app>',
                to: ticket.runner_email,
                subject: `⏰ Rappel J-1 : Votre billet Capten Spots pour demain chez ${spotName}`,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 25px; border: 1px solid #e5e5e5; border-radius: 12px; background-color: #FDFCF8;">
                    <div style="text-align: center; margin-bottom: 20px;">
                      <span style="font-size: 10px; font-weight: bold; letter-spacing: 0.2em; color: #FF5C00; text-transform: uppercase;">Capten Spots</span>
                      <h2 style="margin: 5px 0 0 0; text-transform: uppercase; color: #111;">C'est demain !</h2>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0; background: white; padding: 20px; border-radius: 8px; border: 1px dashed #FF5C00;">
                      <p style="margin: 0 0 10px 0; font-size: 12px; color: #888; text-transform: uppercase; font-weight: bold; letter-spacing: 0.05em;">Présentez ce QR Code au comptoir</p>
                      <img src="${qrCodeUrl}" width="200" height="200" style="display: block; margin: 0 auto;" alt="QR Code" />
                      <p style="margin: 15px 0 0 0; font-family: monospace; font-size: 14px; font-weight: bold; color: #111;">${ticket.runner_name}</p>
                    </div>
                    
                    <div style="background-color: #F4F5F7; padding: 15px; border-radius: 8px; font-size: 14px; line-height: 1.6; color: #333;">
                      <p style="margin: 5px 0;">📍 <strong>Lieu :</strong> ${spotName} (${spotAddress})</p>
                      <p style="margin: 5px 0;">📅 <strong>Date :</strong> Demain (${new Date(event.event_date).toLocaleDateString('fr-FR')}) à ${event.event_time}</p>
                      <p style="margin: 5px 0;">☕️ <strong>Offre incluse :</strong> ${offerDesc}</p>
                    </div>
                    
                    <p style="text-align: center; margin-top: 25px; font-size: 12px; color: #888;">
                      Préparez votre QR Code à l'avance pour accélérer le service au comptoir.<br>
                      <a href="${ticketUrl}" style="color: #FF5C00; font-weight: bold; text-decoration: none;">Voir sur le web</a>
                    </p>
                  </div>
                `
              });
              remindersSent++;
            } catch (e) {
              console.error('Failed sending runner reminder email:', e);
            }
          }
        }
      }
      logs.push(`Sent J-1 reminders to ${remindersSent} runners.`);
    }

    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    console.error('[Spots Cron Exception]:', error);
    return NextResponse.json({ error: error.message || 'Cron execution failure' }, { status: 500 });
  }
}
