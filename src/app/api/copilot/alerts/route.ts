import { NextResponse } from 'next/server';
import { getSupabase, getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseAdmin() || getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase non connecté' }, { status: 500 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { action, alertId } = body || {};

    if (action === 'dismiss' && alertId) {
      const { error } = await supabase
        .from('copilote_alertes')
        .update({ 
          status: 'dismissed', 
          dismissed_at: new Date().toISOString() 
        })
        .eq('id', alertId)
        .eq('club_id', user.id);

      if (error) {
        throw error;
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Action non valide.' }, { status: 400 });
  } catch (error: any) {
    console.error('[API /api/copilot/alerts Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
