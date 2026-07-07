import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getAuthenticatedCaptainId } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

// GET /api/runs — Lister les runs (scopés par club)
export async function GET(request: Request) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ message: 'Supabase non configuré. Utilisez le mode local.' }, { status: 200 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const paramClubId = searchParams.get('club_id');

    // Résoudre le club_id (soit via session capitaine, soit via paramètre public)
    let clubId = paramClubId;
    if (!clubId) {
      clubId = await getAuthenticatedCaptainId();
    }

    if (!clubId) {
      return NextResponse.json({ error: 'club_id manquant ou non authentifié' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('runs')
      .select('*')
      .eq('club_id', clubId)
      .order('date_start', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/runs — Créer un nouveau run (scopé par session capitaine)
export async function POST(request: Request) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ message: 'Supabase non configuré. Run sauvegardé localement.' }, { status: 200 });
  }

  try {
    const captainId = await getAuthenticatedCaptainId();
    if (!captainId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { title, description, date_start, location_start, gpx_route_url, max_slots, reminder_offset_minutes, vibe, coach } = body;

    if (!title || !date_start || !location_start) {
      return NextResponse.json({ error: 'Champs obligatoires : title, date_start, location_start' }, { status: 400 });
    }

    // Gating check
    let plan = 'GRATUIT';
    const { data: club } = await supabase
      .from('clubs')
      .select('stripe_plan')
      .eq('id', captainId)
      .maybeSingle();
    plan = club?.stripe_plan || 'GRATUIT';

    if (plan === 'GRATUIT') {
      const { getActiveRunsCount } = await import('@/lib/plan-access');
      const activeRunsCount = await getActiveRunsCount(captainId);
      if (activeRunsCount >= 1) {
        return NextResponse.json({ 
          error: 'LIMIT_EXCEEDED', 
          message: 'Le plan gratuit est limité à 1 run actif à la fois. Passe à Capten pour planifier des runs en illimité !' 
        }, { status: 403 });
      }
    }

    const { data, error } = await supabase
      .from('runs')
      .insert([{
        title,
        description: description || null,
        date_start,
        location_start,
        gpx_route_url: gpx_route_url || null,
        is_paid: false,
        price_cents: 0,
        stripe_product_id: null,
        max_slots: max_slots || null,
        slots_taken: 0,
        status: 'scheduled',
        scheduled_at: date_start,
        reminder_offset_minutes: reminder_offset_minutes !== undefined ? parseInt(String(reminder_offset_minutes)) : 30,
        club_id: captainId,
        captain_id: captainId,
        vibe: vibe || 'Social & Chill',
        coach: coach || 'Alex Rivière'
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
