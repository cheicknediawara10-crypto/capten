import { NextResponse } from 'next/server';
import { getSupabase, getSupabaseAdmin } from '@/lib/supabase';
import { stripe } from '@/lib/stripe';
import { log } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  let supabaseStatus = 'ok';
  let stripeStatus = 'ok';
  let isHealthy = true;
  const errors: Record<string, string> = {};

  // 1. Check Supabase Connectivity
  try {
    const supabase = getSupabaseAdmin() || getSupabase();
    if (supabase) {
      const { error } = await supabase.from('clubs').select('id').limit(1);
      if (error && error.code !== 'PGRST116') {
        supabaseStatus = 'error';
        isHealthy = false;
        errors.supabase = error.message;
      }
    } else {
      supabaseStatus = 'mock_mode';
    }
  } catch (err: any) {
    supabaseStatus = 'error';
    isHealthy = false;
    errors.supabase = err?.message || 'Supabase connection exception';
  }

  // 2. Check Stripe Connectivity
  try {
    if (stripe) {
      await stripe.balance.retrieve();
    } else {
      stripeStatus = 'mock_mode';
    }
  } catch (err: any) {
    stripeStatus = 'error';
    isHealthy = false;
    errors.stripe = err?.message || 'Stripe API connection exception';
  }

  // Réponse PUBLIQUE : jamais de messages d'erreur internes (fuite d'infos).
  // Les détails (errors) restent uniquement dans les logs serveur.
  const responsePayload = {
    status: isHealthy ? 'ok' : 'error',
    timestamp: new Date().toISOString(),
    supabase: supabaseStatus,
    stripe: stripeStatus,
  };

  if (!isHealthy) {
    log('error', 'health.check.failed', { ...responsePayload, errors });
    return NextResponse.json(responsePayload, { status: 503 });
  }

  log('info', 'health.check.ok', { supabase: supabaseStatus, stripe: stripeStatus });
  return NextResponse.json(responsePayload, { status: 200 });
}
