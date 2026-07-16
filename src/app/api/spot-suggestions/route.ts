import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getAuthenticatedCaptainId } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  try {
    const captainId = await getAuthenticatedCaptainId();
    if (!captainId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { name, contact, address, notes } = body;

    if (!name) {
      return NextResponse.json({ error: 'Le nom du commerce est requis' }, { status: 400 });
    }

    if (!supabase) {
      return NextResponse.json({
        success: true,
        message: 'Suggestion de simulation enregistrée.'
      });
    }

    const { data: suggestion, error } = await supabase
      .from('spot_suggestions')
      .insert([{
        club_id: captainId,
        suggested_name: name,
        suggested_contact: contact || null,
        suggested_address: address || null,
        notes: notes || null
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(suggestion);
  } catch (err: any) {
    console.error("Spot suggestion POST error:", err);
    return NextResponse.json({ error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
