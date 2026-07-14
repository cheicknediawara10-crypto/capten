import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getAuthenticatedCaptainId } from '@/lib/auth-server';
import { MOCK_SPOT_EVENTS } from '../route';

export const dynamic = 'force-dynamic';

// GET /api/spot-events/[id] — Récupérer les détails d'un événement
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabaseAdmin();
  const id = params.id;

  if (!supabase) {
    const event = MOCK_SPOT_EVENTS.find(e => e.id === id);
    if (!event) return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    return NextResponse.json(event);
  }

  try {
    const { data: event, error } = await supabase
      .from('spot_events')
      .select('*, spot:spots(*), club:clubs(whatsapp_display_name)')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!event) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (err) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PATCH /api/spot-events/[id] — Mettre à jour un événement (annulation par le club, etc.)
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
      const event = MOCK_SPOT_EVENTS.find(e => e.id === id);
      if (!event) return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
      const updatedEvent = { ...event, ...body };
      return NextResponse.json(updatedEvent);
    }

    // Sécurité additionnelle : s'assurer que l'événement appartient bien au capitaine connecté
    const { data: eventCheck } = await supabase
      .from('spot_events')
      .select('club_id')
      .eq('id', id)
      .maybeSingle();

    if (!eventCheck || eventCheck.club_id !== captainId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const { data: updatedEvent, error } = await supabase
      .from('spot_events')
      .update(body)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!updatedEvent) {
      return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    }

    return NextResponse.json(updatedEvent);
  } catch (err) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
