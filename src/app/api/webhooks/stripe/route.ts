import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    const sigHeader = request.headers.get('stripe-signature') || '';
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    let event;

    try {
      if (webhookSecret && sigHeader) {
        event = stripe.webhooks.constructEvent(bodyText, sigHeader, webhookSecret);
      } else {
        // Fallback for local testing or if webhook secret is not set
        event = JSON.parse(bodyText);
      }
    } catch (err: any) {
      console.error(`[Stripe Webhook Signature Error]: ${err.message}`);
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    console.log(`[Stripe Webhook Received] Event Type: ${event.type}`);

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

      // If clubId is not in metadata, lookup in profiles table by stripe_customer_id
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

        // 1. Update public.profiles
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

        // 2. Update public.clubs to sync status for middleware trial check
        const isSubscriptionActive = status === 'active' || status === 'trialing';
        const { error: clubUpdateError } = await supabase
          .from('clubs')
          .update({
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

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[Stripe Webhook Exception]:', error);
    return NextResponse.json({ error: error.message || 'Webhook internal error' }, { status: 500 });
  }
}
