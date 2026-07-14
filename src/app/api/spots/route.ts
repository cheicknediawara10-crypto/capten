import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getAuthenticatedCaptainId } from '@/lib/auth-server';
import { Spot, MOCK_SPOTS } from '@/lib/spots';

export const dynamic = 'force-dynamic';

// GET /api/spots — Lister les commerces (filtrés par quartier)
export async function GET(request: Request) {
  const supabase = getSupabaseAdmin();
  const { searchParams } = new URL(request.url);
  const neighborhood = searchParams.get('neighborhood');
  
  if (!supabase) {
    let spots = MOCK_SPOTS;
    const captainId = await getAuthenticatedCaptainId();
    
    // Les visiteurs non identifiés ne voient que les spots actifs
    if (!captainId) {
      spots = spots.filter(s => s.status === 'active');
    }
    
    if (neighborhood && neighborhood !== 'Tous') {
      spots = spots.filter(s => s.neighborhood.toLowerCase().includes(neighborhood.toLowerCase()));
    }
    
    return NextResponse.json(spots);
  }

  try {
    const captainId = await getAuthenticatedCaptainId();
    let query = supabase.from('spots').select('*');
    
    // Si pas de session capitaine, filtrer uniquement les spots validés
    if (!captainId) {
      query = query.eq('status', 'active');
    }
    
    if (neighborhood && neighborhood !== 'Tous') {
      query = query.ilike('neighborhood', `%${neighborhood}%`);
    }
    
    const { data: spots, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(spots);
  } catch (err) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/spots — Enregistrement d'un nouveau commerce (Public / sans authentification)
export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  
  try {
    const body = await request.json().catch(() => ({}));
    const {
      name, address, neighborhood, contact_email, contact_phone,
      capacity, offer_description, offer_price_cents, availability
    } = body;
    
    if (!name || !address || !neighborhood || !contact_email || !capacity || !offer_description || offer_price_cents === undefined || !availability) {
      return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
    }
    
    if (!supabase) {
      return NextResponse.json({
        id: 'new-mock-spot-' + Math.random().toString(36).substring(2, 11),
        name, address, neighborhood, contact_email, contact_phone: contact_phone || null,
        capacity: parseInt(String(capacity), 10),
        offer_description,
        offer_price_cents: parseInt(String(offer_price_cents), 10),
        availability,
        status: 'pending',
        created_at: new Date().toISOString()
      });
    }
    
    const { data: newSpot, error } = await supabase
      .from('spots')
      .insert([{
        name, address, neighborhood, contact_email, contact_phone: contact_phone || null,
        capacity: parseInt(String(capacity), 10),
        offer_description,
        offer_price_cents: parseInt(String(offer_price_cents), 10),
        availability,
        status: 'pending'
      }])
      .select()
      .single();
      
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(newSpot);
  } catch (err) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
