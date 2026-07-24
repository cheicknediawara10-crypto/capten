import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

if (!stripeSecretKey) {
  console.warn('[Stripe] STRIPE_SECRET_KEY non configurée dans les variables d\'environnement.');
}

export const stripe = new Stripe(stripeSecretKey || 'dummy_key_for_build');
