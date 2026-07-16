import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { stripe } from '@/lib/stripe';
import { getAuthenticatedCaptainId } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const supabase = getSupabaseAdmin();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://capten.app';

  try {
    const captainId = await getAuthenticatedCaptainId();
    if (!captainId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const isStripeMock = !stripeSecretKey || stripeSecretKey.includes('votre_');

    if (!supabase || isStripeMock) {
      // Mode simulation locale
      const redirectUrl = `${siteUrl}/spots/explorer?onboarding_success=true&mock_connect=true`;
      return NextResponse.redirect(redirectUrl);
    }

    // Récupérer le club
    const { data: club, error: fetchError } = await supabase
      .from('clubs')
      .select('*')
      .eq('id', captainId)
      .maybeSingle();

    if (fetchError || !club) {
      return NextResponse.json({ error: 'Club non trouvé' }, { status: 404 });
    }

    let stripeConnectId = club.stripe_connect_id;

    if (!stripeConnectId) {
      // Créer un compte Stripe Connect Express pour le club
      const account = await stripe.accounts.create({
        type: 'express',
        email: club.contact_email || 'contact@capten.app',
        capabilities: {
          transfers: { requested: true },
        },
        business_profile: {
          name: club.whatsapp_display_name || 'Mon Run Club',
        },
        metadata: {
          club_id: captainId,
          type: 'club_cagnotte'
        }
      });

      stripeConnectId = account.id;

      // Sauvegarder dans la base
      await supabase
        .from('clubs')
        .update({ stripe_connect_id: stripeConnectId })
        .eq('id', captainId);
    }

    // Créer le lien d'onboarding Stripe
    const accountLink = await stripe.accountLinks.create({
      account: stripeConnectId,
      refresh_url: `${siteUrl}/spots/explorer?onboarding_refresh=true`,
      return_url: `${siteUrl}/spots/explorer?onboarding_success=true`,
      type: 'account_onboarding',
    });

    return NextResponse.redirect(accountLink.url);
  } catch (err: any) {
    console.error("Stripe Connect club onboarding error:", err);
    return NextResponse.json({ error: err.message || 'Erreur serveur Stripe' }, { status: 500 });
  }
}
