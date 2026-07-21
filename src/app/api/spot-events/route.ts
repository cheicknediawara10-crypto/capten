import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getAuthenticatedCaptainId } from '@/lib/auth-server';
import { SpotEvent, generatePublicSlug, generateSignedLink, MOCK_SPOTS, MOCK_SPOT_EVENTS } from '@/lib/spots';
import { resend } from '@/lib/resend';

export const dynamic = 'force-dynamic';

// GET /api/spot-events — Liste des événements d'un club
export async function GET(request: Request) {
  const supabase = getSupabaseAdmin();
  const { searchParams } = new URL(request.url);
  const paramSlug = searchParams.get('slug');

  // Si on cherche par slug de page de vente publique
  if (paramSlug) {
    if (!supabase) {
      const event = MOCK_SPOT_EVENTS.find(e => e.public_slug === paramSlug);
      if (!event) return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
      return NextResponse.json(event);
    }
    const { data: event, error } = await supabase
      .from('spot_events')
      .select('*, spot:spots(name, address, offer_description, stripe_account_id), club:clubs(whatsapp_display_name)')
      .eq('public_slug', paramSlug)
      .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!event) return NextResponse.json({ error: 'Événement non trouvé' }, { status: 404 });
    return NextResponse.json(event);
  }

  // Sinon, on liste les événements du capitaine connecté
  const captainId = await getAuthenticatedCaptainId();
  if (!captainId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  if (!supabase) {
    return NextResponse.json(MOCK_SPOT_EVENTS.filter(e => e.club_id === captainId));
  }

  try {
    const { data: events, error } = await supabase
      .from('spot_events')
      .select('*, spot:spots(name, address, neighborhood, offer_description)')
      .eq('club_id', captainId)
      .order('event_date', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(events);
  } catch (err) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/spot-events — Proposer une date à un commerce (Créer un événement)
export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  
  try {
    const captainId = await getAuthenticatedCaptainId();
    if (!captainId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { spot_id, event_date, event_time, estimated_runners } = body;

    if (!spot_id || !event_date || !event_time || !estimated_runners) {
      return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
    }

    // Récupérer le club pour avoir son nom
    let clubName = 'Mon Run Club';
    if (supabase) {
      const { data: club } = await supabase
        .from('clubs')
        .select('whatsapp_display_name')
        .eq('id', captainId)
        .maybeSingle();
      if (club) clubName = club.whatsapp_display_name;
    }

    // Récupérer le spot pour avoir ses détails
    let spotName = 'Commerce';
    let contactEmail = '';
    let quota = 40;
    let priceCents = 600;

    if (!supabase) {
      const mockSpot = MOCK_SPOTS.find(s => s.id === spot_id);
      if (mockSpot) {
        spotName = mockSpot.name;
        contactEmail = mockSpot.contact_email;
        quota = mockSpot.capacity;
        priceCents = mockSpot.offer_price_cents;
      }
    } else {
      const { data: spot, error: spotError } = await supabase
        .from('spots')
        .select('*')
        .eq('id', spot_id)
        .maybeSingle();

      if (spotError || !spot) {
        return NextResponse.json({ error: 'Commerce non trouvé' }, { status: 404 });
      }

      spotName = spot.name;
      contactEmail = spot.contact_email;
      quota = spot.capacity;
      priceCents = spot.offer_price_cents;
    }

    const slug = generatePublicSlug(clubName, spotName, event_date);

    if (!supabase) {
      const newEvent: SpotEvent = {
        id: 'new-mock-event-' + Math.random().toString(36).substring(2, 11),
        spot_id,
        club_id: captainId,
        event_date,
        event_time,
        estimated_runners: parseInt(String(estimated_runners), 10),
        quota,
        offer_price_cents: priceCents,
        merchant_rate: 0.85,
        club_rate: 0.10,
        platform_rate: 0.05,
        public_slug: slug,
        status: 'proposed',
        checkin_count: 0,
        created_at: new Date().toISOString()
      };
      
      const acceptLink = generateSignedLink(newEvent.id, 'accept');
      const declineLink = generateSignedLink(newEvent.id, 'decline');
      console.log(`[MOCK EMAIL] Envoi proposition à ${contactEmail} pour ${clubName} chez ${spotName}. Accept: ${acceptLink}, Decline: ${declineLink}`);
      
      return NextResponse.json(newEvent);
    }

    // Insérer dans Supabase
    const { data: newEvent, error: insertError } = await supabase
      .from('spot_events')
      .insert([{
        spot_id,
        club_id: captainId,
        event_date,
        event_time,
        estimated_runners: parseInt(String(estimated_runners), 10),
        quota,
        offer_price_cents: priceCents,
        merchant_rate: 0.85,
        club_rate: 0.10,
        platform_rate: 0.05,
        public_slug: slug,
        status: 'proposed'
      }])
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Envoyer l'email au commerce via Resend
    const acceptLink = generateSignedLink(newEvent.id, 'accept');
    const declineLink = generateSignedLink(newEvent.id, 'decline');

    try {
      if (resend) {
        await resend.emails.send({
        from: 'Capten Spots <spots@capten.app>',
        to: contactEmail,
        subject: `Proposition de Run Club : ${clubName} souhaite venir chez ${spotName} !`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 8px;">
            <h2 style="color: #FF5C00; text-transform: uppercase;">Proposition de partenariat Spots</h2>
            <p>Bonjour,</p>
            <p>Le club de running <strong>${clubName}</strong> souhaite organiser la fin de sa sortie chez <strong>${spotName}</strong>.</p>
            
            <div style="background-color: #F4F5F7; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 5px 0;">📅 <strong>Date :</strong> ${new Date(event_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p style="margin: 5px 0;">⏰ <strong>Heure d'arrivée :</strong> ${event_time}</p>
              <p style="margin: 5px 0;">🏃‍♂️ <strong>Estimation :</strong> ~${estimated_runners} coureurs</p>
              <p style="margin: 5px 0;">☕️ <strong>Votre offre proposée :</strong> ${newEvent.quota} places max de "${newEvent.offer_price_cents / 100}€ : Café/Boisson + En-cas"</p>
            </div>

            <p>Pour chaque coureur qui prépaie son offre, vous encaissez immédiatement <strong>75% du prix (soit ${(priceCents * 0.75 / 100).toFixed(2)}€ net)</strong>. Aucun frais d'installation, aucune démarche de facturation.</p>
            
            <div style="margin: 30px 0; text-align: center;">
              <a href="${acceptLink}" style="background-color: #FF5C00; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 15px; display: inline-block;">ACCEPTER LA DATE</a>
              <a href="${declineLink}" style="background-color: #888888; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">REFUSER</a>
            </div>
            
            <p style="font-size: 12px; color: #888;">Ce lien expirera dans 72h. Si vous acceptez, l'événement s'ouvrira à la vente et vous recevrez un récapitulatif par email.</p>
          </div>
        `
      });
      }
    } catch (emailErr) {
      console.error("Failed to send proposal email via Resend:", emailErr);
    }

    return NextResponse.json(newEvent);
  } catch (err) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
