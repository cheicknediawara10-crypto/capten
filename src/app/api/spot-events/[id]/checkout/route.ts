import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { stripe } from '@/lib/stripe';
import { MOCK_SPOT_EVENTS } from '../route';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabaseAdmin();
  const id = params.id;

  try {
    const body = await request.json().catch(() => ({}));
    const { runner_email, runner_name } = body;

    if (!runner_email || !runner_name) {
      return NextResponse.json({ error: 'Champs obligatoires manquants : runner_email, runner_name' }, { status: 400 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const isStripeMock = !stripeSecretKey || stripeSecretKey.includes('votre_');

    if (!supabase || isStripeMock) {
      // Mode simulation locale
      const event = MOCK_SPOT_EVENTS.find(e => e.id === id);
      if (!event) {
        return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
      }
      return NextResponse.json({
        clientSecret: 'pi_mock_secret_' + Math.random().toString(36).substring(2, 11),
        amount: event.offer_price_cents,
        eventId: id
      });
    }

    // Récupérer l'événement et son commerce associé
    const { data: event, error: fetchError } = await supabase
      .from('spot_events')
      .select('*, spot:spots(*)')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !event) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    if (event.status !== 'on_sale') {
      return NextResponse.json({ error: "Les ventes de cet événement ne sont pas ouvertes" }, { status: 400 });
    }

    // Récupérer le nombre de tickets déjà vendus
    const { count, error: countError } = await supabase
      .from('spot_tickets')
      .select('*', { count: 'exact', head: true })
      .eq('spot_event_id', id)
      .eq('status', 'paid');

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    const ticketsSold = count || 0;
    if (ticketsSold >= event.quota) {
      return NextResponse.json({ error: 'SOLD_OUT', message: 'Cet événement est complet !' }, { status: 400 });
    }

    const stripeAccountId = event.spot?.stripe_account_id;
    if (!stripeAccountId) {
      return NextResponse.json({ 
        error: 'PAYMENT_UNCONFIGURED', 
        message: 'Le commerce n\'a pas encore configuré ses paiements. Veuillez réessayer plus tard.' 
      }, { status: 400 });
    }

    const amountCents = event.offer_price_cents;
    // La commission totale prélevée (Part Club 12.5% + Part Capten 12.5% = 25% au total)
    const platformRate = Number(event.club_rate) + Number(event.platform_rate);
    const applicationFeeAmount = Math.round(amountCents * platformRate);

    // Créer le PaymentIntent Stripe avec transfert Direct Connect
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'eur',
      payment_method_types: ['card'],
      transfer_data: {
        destination: stripeAccountId,
      },
      application_fee_amount: applicationFeeAmount,
      metadata: {
        type: 'spot_ticket',
        spot_event_id: id,
        runner_email,
        runner_name,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: amountCents,
      eventId: id
    });
  } catch (err: any) {
    console.error("Stripe payment session error:", err);
    return NextResponse.json({ error: err.message || 'Erreur serveur de paiement' }, { status: 500 });
  }
}
