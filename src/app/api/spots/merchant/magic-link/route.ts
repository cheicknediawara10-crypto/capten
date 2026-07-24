import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { generateMerchantMagicLink, MOCK_SPOTS } from '@/lib/spots';
import { resend } from '@/lib/resend';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = body?.email?.toLowerCase()?.trim();

    if (!email) {
      return NextResponse.json({ error: 'Email obligatoire' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    let spotId: string | null = null;
    let spotName = 'Votre commerce';

    if (supabase) {
      const { data: spot, error } = await supabase
        .from('spots')
        .select('id, name, contact_email')
        .eq('contact_email', email)
        .maybeSingle();

      if (error) {
        console.error('[Magic Link API] Supabase query error:', error);
      }

      if (spot) {
        spotId = spot.id;
        spotName = spot.name;
      }
    }

    // Fallback simulation mode / Mock spots
    if (!spotId) {
      const mockMatch = MOCK_SPOTS.find(s => s.contact_email.toLowerCase() === email);
      if (mockMatch) {
        spotId = mockMatch.id;
        spotName = mockMatch.name;
      }
    }

    if (!spotId) {
      // Pour éviter le réénumération d'emails, on renvoie une réponse positive générique
      return NextResponse.json({
        success: true,
        message: 'Si cet email correspond à un commerce inscrit, un lien d\'accès magique vient de lui être envoyé.'
      });
    }

    const { link, token, expiresAt } = generateMerchantMagicLink(spotId, email);

    // Mettre à jour le token dans Supabase si connecté
    if (supabase) {
      await supabase
        .from('spots')
        .update({
          merchant_access_token: token,
          merchant_token_expires_at: expiresAt
        })
        .eq('id', spotId);
    }

    // Envoi de l'email via Resend
    if (resend) {
      try {
        await resend.emails.send({
          from: 'Capten Spots <spots@capten.app>',
          to: email,
          subject: `✨ Accès à votre Espace Commerce Capten Spots — ${spotName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 25px; border: 1px solid #e5e5e5; border-radius: 12px; background-color: #FDFCF8;">
              <div style="text-align: center; margin-bottom: 20px;">
                <span style="font-size: 10px; font-weight: bold; letter-spacing: 0.2em; color: #FF5C00; text-transform: uppercase;">Capten Spots</span>
                <h2 style="margin: 5px 0 0 0; text-transform: uppercase; color: #111;">Accès à votre espace</h2>
              </div>
              
              <p style="font-size: 14px; color: #333; line-height: 1.6;">Bonjour,</p>
              <p style="font-size: 14px; color: #333; line-height: 1.6;">Voici votre lien d'accès sécurisé sans mot de passe pour gérer vos offres exclusives et suivre vos virements chez <strong>${spotName}</strong>.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${link}" style="background-color: #FF5C00; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block; text-transform: uppercase; letter-spacing: 0.05em;">ACCÉDER À MON ESPACE</a>
              </div>
              
              <p style="font-size: 12px; color: #888; text-align: center;">Ce lien est valable 30 jours. Ne le partagez pas.</p>
            </div>
          `
        });
      } catch (emailErr) {
        console.error('[Magic Link API] Failed sending email:', emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Un lien d\'accès magique vient de vous être envoyé par email.',
      // In dev / mock mode, return link directly for easy testing
      demoLink: process.env.NODE_ENV === 'development' ? link : undefined
    });
  } catch (err: any) {
    console.error('[Magic Link API] Exception:', err);
    return NextResponse.json({ error: 'Erreur serveur lors de la génération du lien' }, { status: 500 });
  }
}
