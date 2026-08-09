import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase';
import { log } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// Webhook Stripe — ABONNEMENT UNIQUEMENT.
// Synchronise le statut d'abonnement Captain Pro sur la table `clubs`.
// (L'activation initiale est aussi faite par /api/stripe/verify au retour du checkout.)
export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    const sigHeader = request.headers.get('stripe-signature') || '';
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    let event;

    try {
      if (!webhookSecret || !sigHeader) {
        if (process.env.NODE_ENV !== 'production') {
          log('warn', 'stripe.webhook.unverified_dev_mode', { message: 'Signature not verified in development mode' });
          event = JSON.parse(bodyText);
        } else {
          log('error', 'stripe.webhook.missing_secret_or_sig', { message: 'Missing STRIPE_WEBHOOK_SECRET or stripe-signature header in production' });
          return NextResponse.json({ error: 'Signature verification required' }, { status: 400 });
        }
      } else {
        event = stripe.webhooks.constructEvent(bodyText, sigHeader, webhookSecret);
      }
    } catch (err: any) {
      log('error', 'stripe.webhook.signature_failed', { error: err.message });
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    log('info', 'stripe.webhook.received', { event_type: event.type, event_id: event.id });

    // --- Abonnements Captain Pro ---
    const subscriptionEvents = [
      'customer.subscription.created',
      'customer.subscription.updated',
      'customer.subscription.deleted',
    ];

    if (subscriptionEvents.includes(event.type)) {
      const subscription = event.data.object;
      const customerId = subscription.customer as string;
      const status = subscription.status;
      const endsAt = subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null;

      const supabase = getSupabaseAdmin();
      if (!supabase) {
        console.error('[Stripe Webhook Error] Supabase Admin client not configured');
        return NextResponse.json({ error: 'Internal configuration error' }, { status: 500 });
      }

      // Résoudre le club : metadata.clubId (posé au checkout), sinon via stripe_customer_id
      let clubId = subscription.metadata?.clubId as string | undefined;
      if (!clubId) {
        const { data: clubRow } = await supabase
          .from('clubs')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle();
        if (clubRow) clubId = clubRow.id;
      }

      if (!clubId) {
        console.warn(`[Stripe Webhook Warning] Club introuvable pour le customer ${customerId}`);
        return NextResponse.json({ received: true });
      }

      const isActive = status === 'active' || status === 'trialing';
      const { error: clubUpdateError } = await supabase
        .from('clubs')
        .update({
          stripe_customer_id: customerId,
          stripe_plan: isActive ? 'CAPTEN' : 'GRATUIT',
          stripe_subscription_status: isActive ? 'active' : 'inactive',
          subscription_ends_at: endsAt,
          updated_at: new Date().toISOString(),
        })
        .eq('id', clubId);

      if (clubUpdateError) {
        console.error('[Stripe Webhook Error] Échec MAJ clubs:', clubUpdateError);
      } else {
        console.log(`[Stripe Webhook Success] Club ${clubId} → ${isActive ? 'CAPTEN/active' : 'GRATUIT/inactive'}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[Stripe Webhook Exception]:', error);
    return NextResponse.json({ error: error.message || 'Webhook internal error' }, { status: 500 });
  }
}
