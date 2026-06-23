import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Pour les abonnements avec période d'essai, payment_status = 'no_payment_required'
    // Pour les paiements classiques, payment_status = 'paid'
    const verified = session.payment_status === 'paid' || session.payment_status === 'no_payment_required';

    // Si le paiement est vérifié et concerne un plan, on met à jour le profil du club
    if (verified && session.metadata?.type === 'plan' && session.metadata?.planName) {
      const planName = session.metadata.planName;
      const clubId = session.metadata.clubId;
      
      const supabase = getSupabaseAdmin();
      if (supabase && clubId && clubId !== 'demo-captain-id') {
        // Calculer trial_ends_at : 14 jours à partir de maintenant (ou étendre si déjà actif)
        const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

        const { error: upsertError } = await supabase
          .from('clubs')
          .upsert({
            id: clubId,
            stripe_plan: planName,
            stripe_subscription_status: 'active',
            trial_ends_at: trialEndsAt,
            whatsapp_display_name: 'CAPTEN RUN CLUB' // Valeur requise par défaut
          }, { onConflict: 'id' });

        if (upsertError) {
          console.error('[Stripe Verify Hook Error] Failed upserting club plan:', upsertError);
        } else {
          console.log(`[Stripe Verify Hook Success] Club ${clubId} upgraded to ${planName}, trial_ends_at: ${trialEndsAt}`);
        }
      }
    }

    return NextResponse.json({
      verified,
      id: session.id,
      payment_status: session.payment_status,
      customer_email: session.customer_details?.email || null,
      metadata: session.metadata || {},
      amount_total: session.amount_total ? session.amount_total / 100 : 0,
    });
  } catch (error: any) {
    console.error('Stripe Session Verification Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('[Stripe Webhook Received]', body);

    if (body.type === 'checkout.session.completed') {
      const session = body.data.object;
      const sessionId = session.id;

      // Retrieve full session with Stripe SDK to verify and extract metadata
      const fullSession = await stripe.checkout.sessions.retrieve(sessionId);

      if (fullSession) {
        const verified = fullSession.payment_status === 'paid' || fullSession.payment_status === 'no_payment_required';

        if (verified && fullSession.metadata?.type === 'plan' && fullSession.metadata?.planName) {
          const planName = fullSession.metadata.planName;
          const clubId = fullSession.metadata.clubId;
          
          const supabase = getSupabaseAdmin();
          if (supabase && clubId && clubId !== 'demo-captain-id') {
            const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

            const { error: upsertError } = await supabase
              .from('clubs')
              .upsert({
                id: clubId,
                stripe_plan: planName,
                stripe_subscription_status: 'active',
                trial_ends_at: trialEndsAt,
                whatsapp_display_name: 'CAPTEN RUN CLUB'
              }, { onConflict: 'id' });

            if (upsertError) {
              console.error('[Stripe Webhook Error] Failed upserting club plan:', upsertError);
            } else {
              console.log(`[Stripe Webhook Success] Club ${clubId} upgraded to ${planName}, trial_ends_at: ${trialEndsAt}`);
            }
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Stripe Webhook Handler Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
