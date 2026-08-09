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

    // Convention : clubs.id = id du fondateur authentifié.
    const clubId = captainId;

    // 1. Membres du crew : supprimer les membre_profiles rattachés (cascade ICE,
    //    décharges, check-ins, resets PIN via FK ON DELETE CASCADE), puis les liens.
    const { data: membreLinks } = await supabase
      .from('membre_club')
      .select('membre_id')
      .eq('club_id', clubId);
    const membreIds = (membreLinks || []).map((m: any) => m.membre_id).filter(Boolean);
    if (membreIds.length) {
      const { error: membresErr } = await supabase
        .from('membre_profiles')
        .delete()
        .in('id', membreIds);
      if (membresErr) {
        log('error', 'gdpr.delete.membres_failed', { club_id: clubId, error: membresErr.message });
      }
    }
    await supabase.from('membre_club').delete().eq('club_id', clubId);
    await supabase.from('membre_waivers').delete().eq('club_id', clubId);

    // 2. Spots du crew
    const { error: spotsErr } = await supabase.from('crew_spots').delete().eq('club_id', clubId);
    if (spotsErr) {
      log('error', 'gdpr.delete.spots_failed', { club_id: clubId, error: spotsErr.message });
    }

    // 3. Sorties (cascade event_registrations / checkins via FK)
    const { error: eventsErr } = await supabase.from('events').delete().eq('club_id', clubId);
    if (eventsErr) {
      log('error', 'gdpr.delete.events_failed', { club_id: clubId, error: eventsErr.message });
    }

    // 4. Supprimer le club et le profil fondateur
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
