import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      type, 
      planName, 
      amount, 
      runId, 
      runName, 
      contributorName, 
      b2bPlanName, 
      connectedAccountId, 
      billingInterval,
      successUrl,
      cancelUrl
    } = body;

    const origin = request.headers.get('origin') || 'http://localhost:3000';

    if (!type) {
      return NextResponse.json({ error: 'Missing type parameter' }, { status: 400 });
    }

    // Récupérer le clubId (userId) via les cookies de session Supabase
    let clubId = 'demo-captain-id';
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('votre-projet')) {
      try {
        const cookieStore = cookies();
        const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) =>
                  cookieStore.set(name, value, options)
                );
              } catch {}
            },
          },
        });
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          clubId = user.id;
        }
      } catch (err) {
        console.warn('Could not retrieve user session in Stripe checkout:', err);
      }
    }

    let sessionParams: any = {
      payment_method_types: ['card'],
      metadata: {
        type,
        planName: planName || '',
        clubId: clubId,
        runId: String(runId || ''),
        contributorName: contributorName || '',
        b2bPlanName: b2bPlanName || '',
        amount: String(amount || ''),
      },
    };

    if (type === 'plan') {
      if (!planName || planName !== 'CAPTEN') {
        return NextResponse.json({ error: 'Invalid or missing planName' }, { status: 400 });
      }

      const isYearly = billingInterval === 'yearly';
      // CAPTEN: 49.99€/mois ou 499€/an
      const planAmount = isYearly ? 499.00 : 49.99;

      const intervalText = isYearly ? 'yearly' : 'monthly';
      const stripeInterval = isYearly ? 'year' : 'month';

      // 1. Get or create Product
      const products = await stripe.products.list({ active: true, limit: 100 });
      let product = products.data.find((p) => p.metadata.planName === planName);

      if (!product) {
        product = await stripe.products.create({
          name: `CAPTEN`,
          description: `Abonnement ${intervalText} au cockpit de pilotage CAPTEN pour ton social run club.`,
          metadata: { planName },
        });
      }

      // 2. Get or create Price
      const prices = await stripe.prices.list({ product: product.id, active: true, limit: 10 });
      const amountInCents = Math.round(planAmount * 100);
      let price = prices.data.find((p) => p.recurring?.interval === stripeInterval && p.unit_amount === amountInCents);

      if (!price) {
        price = await stripe.prices.create({
          product: product.id,
          unit_amount: amountInCents,
          currency: 'eur',
          recurring: { interval: stripeInterval },
        });
      }

      sessionParams.line_items = [
        {
          price: price.id,
          quantity: 1,
        },
      ];
      sessionParams.mode = 'subscription';
      if (!isYearly) {
        sessionParams.subscription_data = {
          trial_period_days: 21,
        };
      }
      sessionParams.success_url = `${origin}/plan?success=true&session_id={CHECKOUT_SESSION_ID}&planName=${planName}&billingInterval=${intervalText}`;
      sessionParams.cancel_url = `${origin}/plan?cancelled=true`;

    } else {
      return NextResponse.json({ error: 'Invalid checkout type' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
