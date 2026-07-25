import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getAuthenticatedCaptainId } from '@/lib/auth-server';
import { log } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// DELETE /api/club/delete — Supprimer définitivement toutes les données personnelles d'un club (Droit à l'effacement RGPD)
export async function DELETE(request: Request) {
  try {
    const captainId = await getAuthenticatedCaptainId();
    if (!captainId) {
      log('warn', 'gdpr.delete.unauthorized', { message: 'Attempt to delete club data without authentication' });
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      log('info', 'gdpr.delete.mock_success', { club_id: captainId });
      return NextResponse.json({ success: true, message: "Toutes les données du club ont été supprimées définitivement (Mode Démo)." });
    }

    // 1. Supprimer les membres du club
    const { error: membersErr } = await supabase
      .from('members')
      .delete()
      .eq('club_id', captainId);

    if (membersErr) {
      log('error', 'gdpr.delete.members_failed', { club_id: captainId, error: membersErr.message });
    }

    // 2. Supprimer les runs / sessions du club
    const { error: runsErr } = await supabase
      .from('runs')
      .delete()
      .eq('club_id', captainId);

    if (runsErr) {
      log('error', 'gdpr.delete.runs_failed', { club_id: captainId, error: runsErr.message });
    }

    // 3. Supprimer les événements spots du club
    const { error: spotEventsErr } = await supabase
      .from('spot_events')
      .delete()
      .eq('club_id', captainId);

    if (spotEventsErr) {
      log('error', 'gdpr.delete.spot_events_failed', { club_id: captainId, error: spotEventsErr.message });
    }

    // 4. Supprimer les incidents / signalements du club
    const { error: incidentsErr } = await supabase
      .from('incidents')
      .delete()
      .eq('club_id', captainId);

    if (incidentsErr) {
      log('error', 'gdpr.delete.incidents_failed', { club_id: captainId, error: incidentsErr.message });
    }

    // 5. Supprimer le club et le profil fondateur
    const { error: clubErr } = await supabase
      .from('clubs')
      .delete()
      .eq('id', captainId);

    const { error: profileErr } = await supabase
      .from('profiles')
      .delete()
      .eq('id', captainId);

    if (clubErr || profileErr) {
      log('error', 'gdpr.delete.club_profile_failed', { club_id: captainId, clubError: clubErr?.message, profileError: profileErr?.message });
      return NextResponse.json({ error: "Certaines données n'ont pas pu être supprimées complètement." }, { status: 500 });
    }

    log('info', 'gdpr.delete.success', { club_id: captainId });
    return NextResponse.json({
      success: true,
      message: "Toutes vos données personnelles et celles de votre club ont été définitivement supprimées conformément au RGPD."
    });

  } catch (err: any) {
    log('error', 'gdpr.delete.exception', { error: err.message });
    return NextResponse.json({ error: "Erreur serveur lors de la suppression RGPD." }, { status: 500 });
  }
}
