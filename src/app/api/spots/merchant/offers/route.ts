import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { verifyMerchantToken, SpotOffer, MOCK_SPOTS } from '@/lib/spots';

export const dynamic = 'force-dynamic';

// POST /api/spots/merchant/offers — Créer une nouvelle offre exclusive (max 3 actives)
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token') || request.headers.get('Authorization')?.replace('Bearer ', '') || '';

    const verification = verifyMerchantToken(token);
    if (!verification.valid || !verification.spotId) {
      return NextResponse.json({ error: 'UNAUTHORIZED', message: 'Accès non autorisé' }, { status: 401 });
    }

    const spotId = verification.spotId;
    const body = await request.json().catch(() => ({}));
    const { name, description, price_cents, quota, availability } = body;

    if (!name || !description || !price_cents || !quota) {
      return NextResponse.json({ error: 'Tous les champs (nom, description, prix, quota) sont obligatoires.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    let currentOffers: SpotOffer[] = [];

    if (supabase) {
      const { data: spot } = await supabase
        .from('spots')
        .select('offers, offer_description, offer_price_cents, capacity')
        .eq('id', spotId)
        .maybeSingle();

      if (spot && spot.offers && Array.isArray(spot.offers)) {
        currentOffers = spot.offers;
      }
    } else {
      const mockSpot = MOCK_SPOTS.find(s => s.id === spotId);
      if (mockSpot && mockSpot.offers) {
        currentOffers = mockSpot.offers;
      }
    }

    // Vérifier le quota de max 3 offres actives simultanément
    const activeOffersCount = currentOffers.filter(o => o.status === 'active').length;
    if (activeOffersCount >= 3) {
      return NextResponse.json({
        error: 'MAX_OFFERS_EXCEEDED',
        message: 'Vous ne pouvez pas avoir plus de 3 offres actives simultanément. Désactivez une offre existante pour en créer une nouvelle.'
      }, { status: 400 });
    }

    const newOffer: SpotOffer = {
      id: 'offer-' + Math.random().toString(36).substring(2, 11),
      name: name.substring(0, 50),
      description: description.substring(0, 120),
      price_cents: Math.round(Number(price_cents)),
      quota: Math.round(Number(quota)),
      availability: Array.isArray(availability) ? availability : ['sat_morning', 'sun_morning'],
      status: 'active',
      created_at: new Date().toISOString()
    };

    const updatedOffers = [...currentOffers, newOffer];

    if (supabase) {
      await supabase
        .from('spots')
        .update({
          offers: updatedOffers,
          offer_name: newOffer.name,
          offer_description: newOffer.description,
          offer_price_cents: newOffer.price_cents,
          capacity: newOffer.quota
        })
        .eq('id', spotId);
    }

    return NextResponse.json({ success: true, offer: newOffer, offers: updatedOffers });
  } catch (err: any) {
    console.error('[Offers API POST] Exception:', err);
    return NextResponse.json({ error: 'Erreur lors de la création de l\'offre' }, { status: 500 });
  }
}

// PATCH /api/spots/merchant/offers — Modifier une offre ou basculer son statut (active/paused)
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token') || request.headers.get('Authorization')?.replace('Bearer ', '') || '';

    const verification = verifyMerchantToken(token);
    if (!verification.valid || !verification.spotId) {
      return NextResponse.json({ error: 'UNAUTHORIZED', message: 'Accès non autorisé' }, { status: 401 });
    }

    const spotId = verification.spotId;
    const body = await request.json().catch(() => ({}));
    const { offer_id, name, description, price_cents, quota, availability, status } = body;

    if (!offer_id) {
      return NextResponse.json({ error: 'offer_id obligatoire' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    let currentOffers: SpotOffer[] = [];

    if (supabase) {
      const { data: spot } = await supabase
        .from('spots')
        .select('offers')
        .eq('id', spotId)
        .maybeSingle();

      if (spot && spot.offers && Array.isArray(spot.offers)) {
        currentOffers = spot.offers;
      }
    } else {
      const mockSpot = MOCK_SPOTS.find(s => s.id === spotId);
      if (mockSpot && mockSpot.offers) {
        currentOffers = mockSpot.offers;
      }
    }

    const offerIndex = currentOffers.findIndex(o => o.id === offer_id);
    if (offerIndex === -1) {
      return NextResponse.json({ error: 'Offre non trouvée' }, { status: 404 });
    }

    // Si réactivation, vérifier la limite des 3 offres actives
    if (status === 'active' && currentOffers[offerIndex].status !== 'active') {
      const activeCount = currentOffers.filter(o => o.status === 'active').length;
      if (activeCount >= 3) {
        return NextResponse.json({
          error: 'MAX_OFFERS_EXCEEDED',
          message: 'Vous avez déjà 3 offres actives. Veuillez en suspendre une avant d\'en réactiver une autre.'
        }, { status: 400 });
      }
    }

    const updatedOffer: SpotOffer = {
      ...currentOffers[offerIndex],
      ...(name && { name: String(name).substring(0, 50) }),
      ...(description && { description: String(description).substring(0, 120) }),
      ...(price_cents !== undefined && { price_cents: Math.round(Number(price_cents)) }),
      ...(quota !== undefined && { quota: Math.round(Number(quota)) }),
      ...(availability && { availability: Array.isArray(availability) ? availability : currentOffers[offerIndex].availability }),
      ...(status && { status: status === 'active' ? 'active' : 'paused' })
    };

    const updatedOffers = [...currentOffers];
    updatedOffers[offerIndex] = updatedOffer;

    if (supabase) {
      // Synchroniser la première offre active comme offre principale sur le spot
      const primaryActive = updatedOffers.find(o => o.status === 'active') || updatedOffer;
      await supabase
        .from('spots')
        .update({
          offers: updatedOffers,
          offer_name: primaryActive.name,
          offer_description: primaryActive.description,
          offer_price_cents: primaryActive.price_cents,
          capacity: primaryActive.quota
        })
        .eq('id', spotId);
    }

    return NextResponse.json({ success: true, offer: updatedOffer, offers: updatedOffers });
  } catch (err: any) {
    console.error('[Offers API PATCH] Exception:', err);
    return NextResponse.json({ error: 'Erreur lors de la modification de l\'offre' }, { status: 500 });
  }
}
