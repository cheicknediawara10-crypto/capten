import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET /api/spot-tickets — Récupérer un billet par son ID (Public)
export async function GET(request: Request) {
  const supabase = getSupabaseAdmin();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID de billet manquant' }, { status: 400 });
  }

  if (!supabase) {
    // Mode mock
    return NextResponse.json({
      id,
      runner_name: 'Clara Martin (Simulation)',
      runner_email: 'clara.martin@gmail.com',
      amount_cents: 600,
      qr_token: 'mocktoken123_' + id.slice(0, 4),
      status: id.includes('redeemed') ? 'redeemed' : 'paid',
      redeemed_at: id.includes('redeemed') ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
      spot_events: {
        event_date: new Date().toISOString().split('T')[0],
        event_time: '10:00:00',
        spot: {
          name: 'Blondy Coffee',
          address: '12 Rue de la Lune, 75002 Paris',
          offer_description: 'Café filtre + Part de banana bread maison'
        },
        club: {
          whatsapp_display_name: 'PARIS RUN CLUB'
        }
      }
    });
  }

  try {
    const { data: ticket, error } = await supabase
      .from('spot_tickets')
      .select('*, spot_events(*, spot:spots(*), club:clubs(*))')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!ticket) {
      return NextResponse.json({ error: 'Billet non trouvé' }, { status: 404 });
    }

    return NextResponse.json(ticket);
  } catch (err) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
