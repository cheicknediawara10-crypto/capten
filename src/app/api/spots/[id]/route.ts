import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getAuthenticatedCaptainId } from '@/lib/auth-server';
import { MOCK_SPOTS } from '../route';

export const dynamic = 'force-dynamic';

// GET /api/spots/[id] — Récupérer les détails d'un commerce
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabaseAdmin();
  const id = params.id;

  if (!supabase) {
    const spot = MOCK_SPOTS.find(s => s.id === id);
    if (!spot) {
      return NextResponse.json({ error: 'Commerce non trouvé' }, { status: 404 });
    }
    return NextResponse.json(spot);
  }

  try {
    const { data: spot, error } = await supabase
      .from('spots')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!spot) {
      return NextResponse.json({ error: 'Commerce non trouvé' }, { status: 404 });
    }

    return NextResponse.json(spot);
  } catch (err) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PATCH /api/spots/[id] — Mettre à jour un commerce (validation admin, pause, etc.)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabaseAdmin();
  const id = params.id;

  try {
    const captainId = await getAuthenticatedCaptainId();
    if (!captainId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    
    if (!supabase) {
      const spot = MOCK_SPOTS.find(s => s.id === id);
      if (!spot) {
        return NextResponse.json({ error: 'Commerce non trouvé' }, { status: 404 });
      }
      const updatedSpot = { ...spot, ...body };
      return NextResponse.json(updatedSpot);
    }

    const { data: updatedSpot, error } = await supabase
      .from('spots')
      .update(body)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!updatedSpot) {
      return NextResponse.json({ error: 'Commerce non trouvé' }, { status: 404 });
    }

    return NextResponse.json(updatedSpot);
  } catch (err) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
