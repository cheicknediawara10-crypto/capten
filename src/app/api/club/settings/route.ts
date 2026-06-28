import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getAuthenticatedCaptainId } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

// GET /api/club/settings — Get configurations for the captain's club
export async function GET() {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ message: 'Supabase non configuré. Mode local actif.' }, { status: 200 });
  }

  try {
    const captainId = await getAuthenticatedCaptainId();
    if (!captainId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { data: club, error } = await supabaseAdmin
      .from('clubs')
      .select('*')
      .eq('id', captainId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!club) {
      // Auto-create if not exists
      const { data: newClub, error: insertError } = await supabaseAdmin
        .from('clubs')
        .insert({
          id: captainId,
          whatsapp_display_name: 'MON RUN CLUB'
        })
        .select()
        .single();

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
      return NextResponse.json(newClub);
    }

    return NextResponse.json(club);
  } catch (err) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PATCH /api/club/settings — Update settings for the captain's club
export async function PATCH(request: Request) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ message: 'Supabase non configuré. Mode local actif.' }, { status: 200 });
  }

  try {
    const captainId = await getAuthenticatedCaptainId();
    if (!captainId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    
    // Whitelist columns to update
    const updates: any = {};
    if (body.whatsapp_display_name !== undefined) updates.whatsapp_display_name = body.whatsapp_display_name;
    if (body.cagnotte_url !== undefined) updates.cagnotte_url = body.cagnotte_url;
    if (body.spot_name !== undefined) updates.spot_name = body.spot_name;
    if (body.coaches !== undefined) updates.coaches = body.coaches;
    if (body.message_templates !== undefined) updates.message_templates = body.message_templates;
    if (body.cagnotte_data !== undefined) updates.cagnotte_data = body.cagnotte_data;
    if (body.branding !== undefined) updates.branding = body.branding;

    const { data: updatedClub, error } = await supabaseAdmin
      .from('clubs')
      .update(updates)
      .eq('id', captainId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(updatedClub);
  } catch (err) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
