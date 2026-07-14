import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getAuthenticatedCaptainId } from '@/lib/auth-server';
import { SpotTicket } from '@/lib/spots';

export const dynamic = 'force-dynamic';

const MOCK_TICKETS: SpotTicket[] = [
  {
    id: 'ticket-1-mock',
    spot_event_id: 'event-1-mock',
    runner_email: 'clara.run@example.com',
    runner_name: 'Clara Martin',
    qr_token: 'mocktoken123',
    amount_cents: 600,
    stripe_payment_intent_id: 'pi_mock_1',
    status: 'paid',
    redeemed_at: null,
    created_at: new Date().toISOString()
  },
  {
    id: 'ticket-2-mock',
    spot_event_id: 'event-1-mock',
    runner_email: 'lucas.fast@example.com',
    runner_name: 'Lucas Bernard',
    qr_token: 'mocktoken456',
    amount_cents: 600,
    stripe_payment_intent_id: 'pi_mock_2',
    status: 'redeemed',
    redeemed_at: new Date(Date.now() - 3600 * 1000).toISOString(),
    created_at: new Date().toISOString()
  }
];

// GET /api/spot-events/[id]/tickets — Liste des billets vendus pour un événement
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabaseAdmin();
  const id = params.id; // spot_event_id

  try {
    const captainId = await getAuthenticatedCaptainId();
    if (!captainId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    if (!supabase) {
      return NextResponse.json(MOCK_TICKETS.filter(t => t.spot_event_id === id));
    }

    // S'assurer de la propriété de l'événement par le capitaine connecté
    const { data: event, error: eventError } = await supabase
      .from('spot_events')
      .select('club_id')
      .eq('id', id)
      .maybeSingle();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    if (event.club_id !== captainId) {
      return NextResponse.json({ error: 'Non autorisé à voir les billets de cet événement' }, { status: 403 });
    }

    const { data: tickets, error: ticketsError } = await supabase
      .from('spot_tickets')
      .select('id, runner_name, runner_email, status, redeemed_at, amount_cents, created_at')
      .eq('spot_event_id', id)
      .order('created_at', { ascending: false });

    if (ticketsError) {
      return NextResponse.json({ error: ticketsError.message }, { status: 500 });
    }

    return NextResponse.json(tickets);
  } catch (err) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
