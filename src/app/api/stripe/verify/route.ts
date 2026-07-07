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
        const { error: updateError } = await supabase
          .from('clubs')
          .update({
            stripe_plan: planName,
            stripe_subscription_status: 'active'
          })
          .eq('id', clubId);

        if (updateError) {
          console.error('[Stripe Verify Hook Error] Failed updating club plan:', updateError);
        } else {
          console.log(`[Stripe Verify Hook Success] Club ${clubId} upgraded to ${planName}`);
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
