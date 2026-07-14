import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { stripe } from '@/lib/stripe';
import { MOCK_SPOTS } from '@/lib/spots';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabaseAdmin();
  const id = params.id;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://capten.app';

  // Vérification de Stripe
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const isStripeMock = !stripeSecretKey || stripeSecretKey.includes('votre_');

  if (!supabase || isStripeMock) {
    // Mode local/mock
    const spot = MOCK_SPOTS.find(s => s.id === id);
    const mockUrl = `${siteUrl}/spots/onboarding?spotId=${id}&mock=true&stripe_account_id=acct_mock_${id}`;
    return NextResponse.json({ url: mockUrl });
  }

  try {
    // Récupérer le commerce
    const { data: spot, error: fetchError } = await supabase
      .from('spots')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !spot) {
      return NextResponse.json({ error: 'Commerce non trouvé' }, { status: 404 });
    }

    let stripeAccountId = spot.stripe_account_id;

    // Si pas de compte Stripe encore créé pour ce commerce
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: spot.contact_email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_profile: {
          name: spot.name,
          url: `${siteUrl}/spots/${id}`,
        },
        metadata: {
          spot_id: id,
        }
      });

      stripeAccountId = account.id;

      // Sauvegarder dans la base de données
      const { error: updateError } = await supabase
        .from('spots')
        .update({ stripe_account_id: stripeAccountId })
        .eq('id', id);

      if (updateError) {
        return NextResponse.json({ error: "Impossible de lier le compte Stripe" }, { status: 500 });
      }
    }

    // Créer le lien d'onboarding Stripe
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${siteUrl}/spots/onboarding?spotId=${id}&refresh=true`,
      return_url: `${siteUrl}/spots/onboarding?spotId=${id}&success=true`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (err: any) {
    console.error("Stripe Connect onboarding error:", err);
    return NextResponse.json({ error: err.message || 'Erreur serveur Stripe' }, { status: 500 });
  }
}
