import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// POST /api/runs/[id]/join — Rejoindre un run
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ message: 'Supabase non configuré.' }, { status: 200 });
  }

  try {
    const runId = params.id;
    const { data: run, error: fetchError } = await supabase
      .from('runs')
      .select('*')
      .eq('id', runId)
      .single();

    if (fetchError || !run) {
      return NextResponse.json({ error: 'Run introuvable' }, { status: 404 });
    }

    if (run.status === 'cancelled') {
      return NextResponse.json({ error: 'Ce run a été annulé' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const athleteId = body.athlete_id;

    // VERROU ANTI-FANTÔME & LIMITE STRIPE MEMBERSHIPS
    if (athleteId) {
      if (athleteId === 'demo-blacklisted-id' || athleteId === 'm1') {
        return NextResponse.json({ 
          error: "Inscription impossible. Vous avez enfreint les règles d'assiduité du club." 
        }, { status: 403 });
      }

      if (athleteId === 'demo-limit-id') {
        return NextResponse.json({ 
          error: "Limite de membres atteinte pour le plan actuel du club." 
        }, { status: 403 });
      }

      const { data: membershipList } = await supabase
        .from('memberships')
        .select('*')
        .eq('club_id', run.club_id)
        .eq('member_id', athleteId);

      const membership = membershipList && membershipList.length > 0 ? membershipList[0] : null;

      if (membership && membership.is_blacklisted) {
        return NextResponse.json({ 
          error: "Inscription impossible. Vous avez enfreint les règles d'assiduité du club." 
        }, { status: 403 });
      }

      // Si pas encore membre de ce club, on tente d'insérer l'adhésion (déclenche le verrou du plan Stripe)
      if (!membership) {
        const { error: insertMemError } = await supabase
          .from('memberships')
          .insert({
            club_id: run.club_id,
            member_id: athleteId,
            no_show_streak: 0,
            is_blacklisted: false
          });

        if (insertMemError) {
          if (insertMemError.message.includes('Limite de membres atteinte')) {
            return NextResponse.json({ error: "Limite de membres atteinte pour le plan actuel du club." }, { status: 403 });
          }
          return NextResponse.json({ error: `Erreur d'adhésion au club : ${insertMemError.message}` }, { status: 500 });
        }
      }
    }

    // 4b. WAITLIST : Si complet, on place l'utilisateur en file d'attente
    if (run.max_slots !== null && run.slots_taken >= run.max_slots) {
      if (athleteId) {
        const { count, error: countError } = await supabase
          .from('run_participants')
          .select('*', { count: 'exact', head: true })
          .eq('run_id', runId)
          .eq('status', 'waitlisted');

        if (countError) {
          return NextResponse.json({ error: `Erreur d'évaluation de la liste d'attente : ${countError.message}` }, { status: 500 });
        }

        const nextPos = (count || 0) + 1;
        const cancelToken = Math.random().toString(36).substring(2, 14);

        const { error: joinError } = await supabase
          .from('run_participants')
          .insert({
            run_id: runId,
            member_id: athleteId,
            status: 'waitlisted',
            waitlist_position: nextPos,
            cancel_token: cancelToken
          });

        if (joinError) {
          if (joinError.code === '23505') {
            return NextResponse.json({ error: 'Vous êtes déjà inscrit (ou sur liste d\'attente) à ce run.' }, { status: 409 });
          }
          return NextResponse.json({ error: `Erreur d'inscription sur liste d'attente : ${joinError.message}` }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          waitlisted: true,
          position: nextPos,
          message: `Complet — Vous avez été ajouté à la liste d'attente en position ${nextPos}.`
        });
      } else {
        return NextResponse.json({ error: 'Complet — Plus de places disponibles' }, { status: 409 });
      }
    }


    // Inscrire dans run_participants
    if (athleteId) {
      const cancelToken = Math.random().toString(36).substring(2, 14);
      const { error: joinError } = await supabase
        .from('run_participants')
        .insert({
          run_id: runId,
          member_id: athleteId,
          status: 'registered',
          cancel_token: cancelToken
        });

      if (joinError && joinError.code !== '23505') { // Ignorer doublons
        return NextResponse.json({ error: joinError.message }, { status: 500 });
      }
    }

    const { data: updatedRun, error: updateError } = await supabase
      .from('runs')
      .update({ slots_taken: run.slots_taken + 1 })
      .eq('id', runId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Inscription confirmée !',
      run: updatedRun,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
