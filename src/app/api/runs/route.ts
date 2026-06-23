import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// GET /api/runs — Lister tous les runs
export async function GET() {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ message: 'Supabase non configuré. Utilisez le mode local.' }, { status: 200 });
  }

  try {
    const { data, error } = await supabase
      .from('runs')
      .select('*')
      .order('date_start', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/runs — Créer un nouveau run
export async function POST(request: Request) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ message: 'Supabase non configuré. Run sauvegardé localement.' }, { status: 200 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { title, description, date_start, location_start, gpx_route_url, max_slots, reminder_offset_minutes } = body;

    if (!title || !date_start || !location_start) {
      return NextResponse.json({ error: 'Champs obligatoires : title, date_start, location_start' }, { status: 400 });
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
