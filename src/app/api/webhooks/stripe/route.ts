import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase';
import { generateQrToken } from '@/lib/spots';
import { resend } from '@/lib/resend';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    const sigHeader = request.headers.get('stripe-signature') || '';
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    let event;

    try {
      if (!webhookSecret || !sigHeader) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[Stripe Webhook Warning] Signature not verified in development mode');
          event = JSON.parse(bodyText);
        } else {
          console.error('[Stripe Webhook Error] Missing STRIPE_WEBHOOK_SECRET or stripe-signature header in production');
          return NextResponse.json({ error: 'Signature verification required' }, { status: 400 });
        }
      } else {
        event = stripe.webhooks.constructEvent(bodyText, sigHeader, webhookSecret);
      }
    } catch (err: any) {
      console.error(`[Stripe Webhook Signature Error]: ${err.message}`);
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    console.log(`[Stripe Webhook Received] Event Type: ${event.type}`);

    // --- 1. Gestion des Abonnements CAPTEN Plan ---
    const subscriptionEvents = [
      'customer.subscription.created',
      'customer.subscription.updated',
      'customer.subscription.deleted'
    ];

    if (subscriptionEvents.includes(event.type)) {
      const subscription = event.data.object;
      const customerId = subscription.customer as string;
      const status = subscription.status;
      const endsAt = new Date(subscription.current_period_end * 1000).toISOString();
      
      let clubId = subscription.metadata?.clubId;

      const supabase = getSupabaseAdmin();
      if (!supabase) {
        console.error('[Stripe Webhook Error] Supabase Admin client not configured');
        return NextResponse.json({ error: 'Internal configuration error' }, { status: 500 });
      }

      if (!clubId) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle();

        if (profileError) {
          console.error('[Stripe Webhook Error] Failed to query profile by customer_id:', profileError);
        }

        if (profile) {
          clubId = profile.id;
        }
      }

      if (clubId) {
        console.log(`[Stripe Webhook Processing] Club: ${clubId}, Status: ${status}, Customer: ${customerId}`);

        // Update public.profiles
        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .upsert({
            id: clubId,
            stripe_customer_id: customerId,
            stripe_subscription_status: status,
            subscription_ends_at: endsAt,
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });

        if (profileUpdateError) {
          console.error('[Stripe Webhook Error] Failed updating profiles table:', profileUpdateError);
        }

        // Update public.clubs to sync status and plan name
        const isSubscriptionActive = status === 'active' || status === 'trialing';
        const { error: clubUpdateError } = await supabase
          .from('clubs')
          .update({
            stripe_plan: isSubscriptionActive ? 'CAPTEN' : 'GRATUIT',
            stripe_subscription_status: isSubscriptionActive ? 'active' : 'inactive'
          })
          .eq('id', clubId);

        if (clubUpdateError) {
          console.error('[Stripe Webhook Error] Failed updating clubs table subscription status:', clubUpdateError);
        }

        console.log(`[Stripe Webhook Success] Successfully updated subscription details for Club ${clubId}`);
      } else {
        console.warn(`[Stripe Webhook Warning] Could not resolve clubId for customer: ${customerId}`);
      }
    }

    // --- 2. Gestion des Billets Spots (payment_intent.succeeded) ---
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      
      if (paymentIntent.metadata?.type === 'spot_ticket') {
        const spotEventId = paymentIntent.metadata.spot_event_id;
        const runnerEmail = paymentIntent.metadata.runner_email;
        const runnerName = paymentIntent.metadata.runner_name;
        const amountCents = paymentIntent.amount;
        const paymentIntentId = paymentIntent.id;
        const isFirstVisit = paymentIntent.metadata?.is_first_visit !== 'false';
        const commissionApplied = paymentIntent.metadata?.commission_applied !== 'false';

        const supabase = getSupabaseAdmin();
        if (supabase) {
          const qrToken = generateQrToken();

          const { data: ticket, error: ticketError } = await supabase
            .from('spot_tickets')
            .insert([{
              spot_event_id: spotEventId,
              runner_email: runnerEmail,
              runner_name: runnerName,
              qr_token: qrToken,
              amount_cents: amountCents,
              stripe_payment_intent_id: paymentIntentId,
              status: 'paid',
              is_first_visit: isFirstVisit,
              commission_applied: commissionApplied
            }])
            .select('*, spot_events(*, spot:spots(*), club:clubs(*))')
            .maybeSingle();

          if (ticketError) {
            console.error('[Webhook Error] Failed to create spot ticket:', ticketError);
          } else if (ticket) {
            console.log(`[Webhook Success] Ticket created: ${ticket.id} for runner: ${runnerEmail}`);
            
            // Si c'est une première visite, on l'enregistre dans l'historique
            if (isFirstVisit) {
              const spotId = ticket.spot_events?.spot_id;
              if (spotId) {
                const { error: visitError } = await supabase
                  .from('runner_visits')
                  .insert([{
                    runner_email: runnerEmail,
                    spot_id: spotId
                  }]);
                if (visitError) {
                  console.error('[Webhook Error] Failed to register runner visit:', visitError);
                } else {
                  console.log(`[Webhook Success] Registered first visit of ${runnerEmail} at spot ${spotId}`);
                }
              }
            }
            
            // Envoyer l'email avec le QR Code
            const spotName = ticket.spot_events?.spot?.name || 'Commerce';
            const spotAddress = ticket.spot_events?.spot?.address || '';
            const offerDesc = ticket.spot_events?.spot?.offer_description || '';
            const clubName = ticket.spot_events?.club?.whatsapp_display_name || 'Capten';
            
            const eventDateStr = ticket.spot_events?.event_date 
              ? new Date(ticket.spot_events.event_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
              : '';
            const eventTimeStr = ticket.spot_events?.event_time || '';
            
            const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrToken}`;
            const ticketUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://capten.app'}/spots/ticket/${ticket.id}`;
            
            try {
              await resend.emails.send({
                from: 'Capten Spots <spots@capten.app>',
                to: runnerEmail,
                subject: `🎟️ Votre billet Capten Spots chez ${spotName}`,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 25px; border: 1px solid #e5e5e5; border-radius: 12px; background-color: #FDFCF8;">
                    <div style="text-align: center; margin-bottom: 20px;">
                      <span style="font-size: 10px; font-weight: bold; letter-spacing: 0.2em; color: #FF5C00; text-transform: uppercase;">Capten Spots</span>
                      <h2 style="margin: 5px 0 0 0; text-transform: uppercase; color: #111;">Votre Formule Spot</h2>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0; background: white; padding: 20px; border-radius: 8px; border: 1px dashed #FF5C00;">
                      <p style="margin: 0 0 10px 0; font-size: 12px; color: #888; text-transform: uppercase; font-weight: bold; letter-spacing: 0.05em;">Présentez ce QR Code au comptoir</p>
                      <img src="${qrCodeUrl}" width="200" height="200" style="display: block; margin: 0 auto;" alt="QR Code" />
                      <p style="margin: 15px 0 0 0; font-family: monospace; font-size: 14px; font-weight: bold; color: #111;">${runnerName}</p>
                    </div>
                    
                    <div style="background-color: #F4F5F7; padding: 15px; border-radius: 8px; font-size: 14px; line-height: 1.6; color: #333;">
                      <p style="margin: 5px 0;">📍 <strong>Lieu :</strong> ${spotName} (${spotAddress})</p>
                      <p style="margin: 5px 0;">📅 <strong>Date :</strong> ${eventDateStr} à ${eventTimeStr}</p>
                      <p style="margin: 5px 0;">☕️ <strong>Offre incluse :</strong> ${offerDesc}</p>
                      <p style="margin: 5px 0;">💰 <strong>Prix payé :</strong> ${(amountCents / 100).toFixed(2)}€</p>
                      <p style="margin: 5px 0;">🏃‍♂️ <strong>Club :</strong> ${clubName}</p>
                    </div>
                    
                    <p style="text-align: center; margin-top: 25px; font-size: 12px; color: #888;">
                      Des consommations supplémentaires ? Réglez-les simplement sur place.<br>
                      <a href="${ticketUrl}" style="color: #FF5C00; font-weight: bold; text-decoration: none; display: inline-block; margin-top: 10px;">Visualiser mon billet sur le web</a>
                    </p>
                  </div>
                `
              });
            } catch (emailErr) {
              console.error('[Webhook Error] Failed to send ticket email:', emailErr);
            }
          }
        }
      }
    }

    // --- 3. Gestion des Remboursements (charge.refunded) ---
    if (event.type === 'charge.refunded') {
      const charge = event.data.object;
      const paymentIntentId = charge.payment_intent as string;
      const supabase = getSupabaseAdmin();
      
      if (supabase && paymentIntentId) {
        const { error: refundError } = await supabase
          .from('spot_tickets')
          .update({ status: 'refunded' })
          .eq('stripe_payment_intent_id', paymentIntentId);
        
        if (refundError) {
          console.error('[Webhook Error] Failed to update ticket to refunded:', refundError);
        } else {
          console.log(`[Webhook Success] Refunded ticket with PI: ${paymentIntentId}`);
        }
      }
    }

    // --- 4. Validation KYC Stripe Connect Express (account.updated) ---
    if (event.type === 'account.updated') {
      const account = event.data.object;
      const stripeAccountId = account.id;

      if (account.details_submitted && account.charges_enabled) {
        const supabase = getSupabaseAdmin();
        if (supabase) {
          const { error: accountError } = await supabase
            .from('spots')
            .update({ status: 'active' })
            .eq('stripe_account_id', stripeAccountId)
            .eq('status', 'pending');

          if (accountError) {
            console.error('[Webhook Error] Failed to update spot status on KYC completion:', accountError);
          } else {
            console.log(`[Webhook Success] Activated merchant spot with Stripe account ID: ${stripeAccountId}`);
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[Stripe Webhook Exception]:', error);
    return NextResponse.json({ error: error.message || 'Webhook internal error' }, { status: 500 });
  }
}
