import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // 1. Authenticate user
    let clubId = 'demo-captain-id';
    let email = 'demo@capten.app';
    let clubName = 'Mon Run Club';

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    const supabaseAdmin = getSupabaseAdmin();

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
          email = user.email || '';
          
          if (supabaseAdmin) {
            const { data: club } = await supabaseAdmin
              .from('clubs')
              .select('whatsapp_display_name')
              .eq('id', clubId)
              .maybeSingle();
            if (club) {
              clubName = club.whatsapp_display_name;
            }
          }
        }
      } catch (err) {
        console.warn('Could not retrieve user session in setup-intent:', err);
      }
    }

    // 2. Check Stripe config
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      console.log('[Stripe SetupIntent] Secret key missing. Running in mock mode.');
      return NextResponse.json({
        mock: true,
        clientSecret: 'mock_setup_intent_secret_12345'
      });
    }

    // 3. Resolve customer
    let stripeCustomerId = '';
    if (supabaseAdmin && clubId !== 'demo-captain-id') {
      const { data: clubData } = await supabaseAdmin
        .from('clubs')
        .select('stripe_customer_id')
        .eq('id', clubId)
        .maybeSingle();

      if (clubData?.stripe_customer_id) {
        stripeCustomerId = clubData.stripe_customer_id;
      }
    }

    if (!stripeCustomerId) {
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: email,
        name: clubName,
        metadata: {
          clubId: clubId
        }
      });
      stripeCustomerId = customer.id;

      // Update in DB
      if (supabaseAdmin && clubId !== 'demo-captain-id') {
        await supabaseAdmin
          .from('clubs')
          .update({ stripe_customer_id: stripeCustomerId })
          .eq('id', clubId);
          
        await supabaseAdmin
          .from('profiles')
          .update({ stripe_customer_id: stripeCustomerId })
          .eq('id', clubId);
      }
    }

    // 4. Create SetupIntent
    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      metadata: {
        clubId: clubId
      }
    });

    return NextResponse.json({
      clientSecret: setupIntent.client_secret
    });

  } catch (error: any) {
    console.error('Stripe SetupIntent Exception:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
