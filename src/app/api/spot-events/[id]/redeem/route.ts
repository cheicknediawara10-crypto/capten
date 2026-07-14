import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getAuthenticatedCaptainId } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabaseAdmin();
  const id = params.id; // spot_event_id

  try {
    const captainId = await getAuthenticatedCaptainId();
    if (!captainId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { qr_token } = body;

    if (!qr_token) {
      return NextResponse.json({ error: 'Token QR manquant' }, { status: 400 });
    }

    if (!supabase) {
      // Simulation en mode mock
      if (qr_token.includes('invalid')) {
        return NextResponse.json({ error: 'Billet invalide ou inexistant' }, { status: 404 });
      }
      if (qr_token.includes('already')) {
        return NextResponse.json({ 
          error: 'ALREADY_REDEEMED', 
          message: 'Ce billet a déjà été validé le ' + new Date().toLocaleString('fr-FR') 
        }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        runner_name: 'Coureur Sympa (Simulé)',
        runner_email: 'coureur@exemple.com',
        amount_cents: 600,
        status: 'redeemed',
        redeemed_at: new Date().toISOString()
      });
    }

    // Récupérer le ticket et vérifier qu'il appartient bien à cet événement
    const { data: ticket, error: ticketError } = await supabase
      .from('spot_tickets')
      .select('*, spot_events(*)')
      .eq('qr_token', qr_token)
      .eq('spot_event_id', id)
      .maybeSingle();

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'Billet invalide ou introuvable pour cet événement' }, { status: 404 });
    }

    // S'assurer que l'événement appartient au club du capitaine connecté
    if (ticket.spot_events?.club_id !== captainId) {
      return NextResponse.json({ error: 'Non autorisé à scanner pour ce club' }, { status: 403 });
    }

    if (ticket.status === 'redeemed') {
      const dateRedeemed = new Date(ticket.redeemed_at).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
      return NextResponse.json({ 
        error: 'ALREADY_REDEEMED', 
        message: `Ce billet a déjà été validé le ${dateRedeemed}` 
      }, { status: 400 });
    }

    if (ticket.status === 'refunded') {
      return NextResponse.json({ error: 'REFUNDED', message: 'Ce billet a été remboursé et est invalide' }, { status: 400 });
    }

    // Mettre à jour le ticket à 'redeemed'
    const { data: updatedTicket, error: updateError } = await supabase
      .from('spot_tickets')
      .update({
        status: 'redeemed',
        redeemed_at: new Date().toISOString()
      })
      .eq('id', ticket.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Incrémenter le checkin_count de l'événement
    await supabase.rpc('increment_event_checkin', { event_id: id }).catch(() => {
      // Fallback simple si la fonction RPC n'est pas encore créée
      supabase.from('spot_events')
        .update({ checkin_count: (ticket.spot_events?.checkin_count || 0) + 1 })
        .eq('id', id)
        .then();
    });

    return NextResponse.json({
      success: true,
      runner_name: updatedTicket.runner_name,
      runner_email: updatedTicket.runner_email,
      amount_cents: updatedTicket.amount_cents,
      status: updatedTicket.status,
      redeemed_at: updatedTicket.redeemed_at
    });
  } catch (err) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
