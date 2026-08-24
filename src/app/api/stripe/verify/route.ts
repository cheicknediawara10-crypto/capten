import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

/**
 * Route de vérification en lecture seule de la session de paiement Stripe.
 * N'effectue aucune écriture en base de données.
 * Les écritures et l'activation des abonnements sont exclusivement gérées
 * par le webhook cryptographiquement signé (/api/webhooks/stripe).
 */
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
