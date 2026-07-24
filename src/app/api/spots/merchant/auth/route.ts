import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { verifyMerchantToken, MOCK_SPOTS, MOCK_SPOT_EVENTS, Spot, SpotOffer } from '@/lib/spots';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token') || '';

    if (!token) {
      return NextResponse.json({ error: 'Token d\'accès manquant' }, { status: 400 });
    }

    const verification = verifyMerchantToken(token);
    if (!verification.valid) {
      if (verification.expired) {
        return NextResponse.json({ error: 'TOKEN_EXPIRED', message: 'Ce lien d\'accès a expiré (validité 30 jours).' }, { status: 401 });
      }
      return NextResponse.json({ error: 'TOKEN_INVALID', message: 'Token d\'accès invalide' }, { status: 401 });
    }

    const spotId = verification.spotId;
    const supabase = getSupabaseAdmin();

    let spot: Spot | null = null;
    let events: any[] = [];
    let tickets: any[] = [];

    if (supabase) {
      const { data: fetchedSpot, error: spotError } = await supabase
        .from('spots')
        .select('*')
        .eq('id', spotId)
        .maybeSingle();

      if (!spotError && fetchedSpot) {
        spot = fetchedSpot;

        // Fetch spot_events for this spot
        const { data: fetchedEvents } = await supabase
          .from('spot_events')
          .select('*, club:clubs(whatsapp_display_name)')
          .eq('spot_id', spotId)
          .order('event_date', { ascending: false });

        if (fetchedEvents) {
          events = fetchedEvents;

          // Fetch paid/redeemed tickets for these events
          const eventIds = fetchedEvents.map(e => e.id);
          if (eventIds.length > 0) {
            const { data: fetchedTickets } = await supabase
              .from('spot_tickets')
              .select('*')
              .in('spot_event_id', eventIds);

            if (fetchedTickets) {
              tickets = fetchedTickets;
            }
          }
        }
      }
    }

    // Fallback Mock Data if Supabase is unavailable or spot not found in DB
    if (!spot) {
      const mockSpot = MOCK_SPOTS.find(s => s.id === spotId) || MOCK_SPOTS[0];
      spot = mockSpot;
      events = MOCK_SPOT_EVENTS.filter(e => e.spot_id === spot.id).map(e => ({
        ...e,
        club: { whatsapp_display_name: 'Paris Run Club' }
      }));
    }

    // Parse offers array
    let offers: SpotOffer[] = [];
    if (spot.offers && Array.isArray(spot.offers)) {
      offers = spot.offers;
    } else if (spot.offer_description && spot.offer_price_cents) {
      // Fallback single offer if offers JSONB array is empty
      offers = [{
        id: 'default-offer',
        name: spot.offer_name || 'Le Pack Récup',
        description: spot.offer_description,
        price_cents: spot.offer_price_cents,
        quota: spot.capacity || 40,
        availability: ['sat_morning', 'sun_morning'],
        status: 'active',
        created_at: spot.created_at || new Date().toISOString()
      }];
    }

    // Separate upcoming vs past events
    const todayStr = new Date().toISOString().split('T')[0];
    const upcomingEvents = events.filter(e => e.event_date >= todayStr || e.status === 'proposed' || e.status === 'on_sale');
    const pastEvents = events.filter(e => e.event_date < todayStr || e.status === 'completed');

    // Monthly summary calculation
    const currentMonthPrefix = new Date().toISOString().slice(0, 7); // YYYY-MM
    const currentMonthEvents = events.filter(e => e.event_date.startsWith(currentMonthPrefix));

    let totalEncaisseCents = 0;
    let totalVireCents = 0;
    let totalCheckins = 0;

    events.forEach(e => {
      const eventTickets = tickets.filter(t => t.spot_event_id === e.id && t.status !== 'refunded');
      const salesCents = eventTickets.length * (e.offer_price_cents || 600);
      const merchantRate = e.merchant_rate ?? 0.85;
      const netPayoutCents = Math.round(salesCents * merchantRate);

      totalEncaisseCents += salesCents;
      totalVireCents += netPayoutCents;
      totalCheckins += e.checkin_count || eventTickets.filter(t => t.status === 'redeemed').length || eventTickets.length;
    });

    const monthlySummary = {
      monthLabel: new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
      eventsCount: currentMonthEvents.length,
      runnersCount: totalCheckins,
      encaisseEuros: (totalEncaisseCents / 100).toFixed(2),
      vireEuros: (totalVireCents / 100).toFixed(2)
    };

    return NextResponse.json({
      success: true,
      spot,
      offers,
      upcomingEvents,
      pastEvents,
      tickets,
      monthlySummary,
      stripeConnectStatus: spot.stripe_account_id ? 'complete' : 'pending'
    });

  } catch (err: any) {
    console.error('[Merchant Auth API] Exception:', err);
    return NextResponse.json({ error: 'Erreur serveur lors de la vérification de l\'accès' }, { status: 500 });
  }
}
