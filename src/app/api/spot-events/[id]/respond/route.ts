import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { verifySignedToken } from '@/lib/spots';
import { resend } from '@/lib/resend';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabaseAdmin();
  const id = params.id;
  
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') as 'accept' | 'decline';
  const token = searchParams.get('token') || '';

  if (!action || !['accept', 'decline'].includes(action)) {
    return new NextResponse('Action invalide', { status: 400 });
  }

  // Vérification de la signature du lien (protection contre les modifications d'URL)
  const isValid = verifySignedToken(id, action, token);
  if (!isValid) {
    return new NextResponse(
      `<html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, sans-serif; text-align: center; padding: 50px; background-color: #F4F5F7; color: #111; }
            .card { background: white; padding: 40px; border-radius: 12px; max-width: 500px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
            h1 { color: #dc2626; font-size: 24px; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Lien Expiré ou Invalide</h1>
            <p>Ce lien de confirmation a expiré (validité de 7 jours) ou sa signature est incorrecte. Veuillez contacter le club.</p>
          </div>
        </body>
      </html>`,
      { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  const newStatus = action === 'accept' ? 'on_sale' : 'declined';
  let spotName = 'Votre commerce';
  let clubName = 'Un Run Club';
  let eventDate = '';
  let contactFounderEmail = '';

  if (supabase) {
    try {
      // Charger l'événement
      const { data: event, error: fetchError } = await supabase
        .from('spot_events')
        .select('*, spot:spots(name, contact_email), club:clubs(id, whatsapp_display_name)')
        .eq('id', id)
        .maybeSingle();

      if (fetchError || !event) {
        return new NextResponse('Événement non trouvé', { status: 404 });
      }

      spotName = event.spot?.name || spotName;
      clubName = event.club?.whatsapp_display_name || clubName;
      eventDate = event.event_date;

      // Chercher l'email du fondateur
      const { data: founderProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', event.club_id)
        .maybeSingle();
      
      contactFounderEmail = founderProfile?.email || '';

      // Mettre à jour le statut
      const { error: updateError } = await supabase
        .from('spot_events')
        .update({ status: newStatus })
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      // Envoyer un email de confirmation au fondateur
      if (contactFounderEmail) {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://capten.app';
        const eventUrl = `${siteUrl}/spots/${event.public_slug}`;
        
        if (resend) {
          await resend.emails.send({
          from: 'Capten Spots <spots@capten.app>',
          to: contactFounderEmail,
          subject: action === 'accept' 
            ? `🎉 Proposition acceptée ! Votre événement chez ${spotName} est ouvert.`
            : `😢 Proposition refusée par ${spotName}`,
          html: action === 'accept'
            ? `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 8px;">
                <h2 style="color: #FF5C00; text-transform: uppercase;">Bonne nouvelle !</h2>
                <p>Le commerce <strong>${spotName}</strong> a accepté votre proposition pour le <strong>${new Date(eventDate).toLocaleDateString('fr-FR')}</strong>.</p>
                <p>Les inscriptions sont ouvertes ! Partagez dès maintenant le lien de paiement public à vos membres :</p>
                <div style="background-color: #F4F5F7; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0;">
                  <a href="${eventUrl}" style="color: #FF5C00; font-weight: bold; text-decoration: none; font-size: 16px;">${eventUrl}</a>
                </div>
                <p>Vos coureurs pourront réserver leur formule en 1 clic (sans création de compte) et recevront leur QR Code par email.</p>
              </div>
            `
            : `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 8px;">
                <h2 style="color: #888; text-transform: uppercase;">Proposition déclinée</h2>
                <p>Le commerce <strong>${spotName}</strong> a décliné votre proposition pour la date du <strong>${new Date(eventDate).toLocaleDateString('fr-FR')}</strong>.</p>
                <p>Vous pouvez explorer d'autres commerces disponibles dans votre quartier depuis votre application Capten.</p>
              </div>
            `
        });
        }
      }
    } catch (dbErr: any) {
      console.error("Database update error on respond:", dbErr);
      return new NextResponse('Erreur serveur lors de la mise à jour', { status: 500 });
    }
  }

  // Rendu de la page de succès/refus pour le commerce
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Capten Spots — Confirmation</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            text-align: center;
            background-color: #F4F5F7;
            color: #111111;
            margin: 0;
            padding: 40px 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            min-h-screen: 100vh;
          }
          .card {
            background: white;
            padding: 40px;
            border-radius: 12px;
            max-width: 480px;
            width: 100%;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
            border: 1px solid #E5E5E5;
          }
          .icon {
            font-size: 48px;
            margin-bottom: 20px;
          }
          h1 {
            font-size: 22px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: -0.02em;
            margin-bottom: 10px;
            color: ${action === 'accept' ? '#FF5C00' : '#111'};
          }
          p {
            font-size: 14px;
            color: #666;
            line-height: 1.5;
            margin-bottom: 24px;
          }
          .footer {
            font-size: 10px;
            color: #A3A3A3;
            text-transform: uppercase;
            font-weight: bold;
            letter-spacing: 0.1em;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">${action === 'accept' ? '🎉' : '✉️'}</div>
          <h1>${action === 'accept' ? 'Proposition Acceptée !' : 'Proposition Déclinée'}</h1>
          <p>
            ${action === 'accept' 
              ? `Merci ! Vous avez accepté la venue de <strong>${clubName}</strong>. L'événement est désormais disponible à la vente pour les coureurs.<br><br>Vous recevrez un récapitulatif des commandes par email avant leur arrivée.`
              : `Vous avez refusé la venue de <strong>${clubName}</strong>. Le club a été informé de votre décision.<br><br>À bientôt !`
            }
          </p>
          <div class="footer">Capten Spots</div>
        </div>
      </body>
    </html>
  `;

  return new NextResponse(htmlContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8'
    }
  });
}
