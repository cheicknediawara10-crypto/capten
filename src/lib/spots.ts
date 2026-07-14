import crypto from 'crypto';

const SECRET = process.env.CRON_SECRET || 'capten-spots-secret-2026';

// Interfaces TypeScript pour le module Spots
export interface Spot {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  contact_email: string;
  contact_phone: string | null;
  capacity: number;
  offer_description: string;
  offer_price_cents: number;
  availability: Record<string, string[]>;
  stripe_account_id: string | null;
  status: 'pending' | 'active' | 'paused' | 'rejected';
  created_at: string;
}

export interface SpotEvent {
  id: string;
  spot_id: string;
  club_id: string;
  event_date: string;
  event_time: string;
  estimated_runners: number;
  quota: number;
  offer_price_cents: number;
  merchant_rate: number;
  club_rate: number;
  platform_rate: number;
  public_slug: string;
  status: 'proposed' | 'accepted' | 'declined' | 'expired' | 'on_sale' | 'completed' | 'cancelled';
  checkin_count: number;
  created_at: string;
}

export interface SpotTicket {
  id: string;
  spot_event_id: string;
  runner_email: string;
  runner_name: string | null;
  qr_token: string;
  amount_cents: number;
  stripe_payment_intent_id: string;
  status: 'paid' | 'redeemed' | 'refunded';
  redeemed_at: string | null;
  created_at: string;
}

/**
 * Génère un slug unique pour la page de vente publique d'un événement Spot.
 */
export function generatePublicSlug(clubName: string, spotName: string, date: string): string {
  const clean = (str: string) => str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  
  const formattedDate = date ? date.replace(/[^0-9]/g, '') : '';
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${clean(clubName)}-chez-${clean(spotName)}-${formattedDate}-${randomSuffix}`;
}

/**
 * Génère un token cryptographique aléatoire pour le QR Code du billet coureur.
 */
export function generateQrToken(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Calcule la répartition (split) des montants en centimes entre le commerce, le club et Capten.
 * Évite les erreurs d'arrondis en attribuant le reliquat à la plateforme.
 */
export function calculateSplit(
  amountCents: number,
  merchantRate: number = 0.75,
  clubRate: number = 0.125,
  platformRate: number = 0.125
) {
  const merchantAmount = Math.round(amountCents * merchantRate);
  const clubAmount = Math.round(amountCents * clubRate);
  const platformAmount = amountCents - merchantAmount - clubAmount;
  return {
    merchantAmount,
    clubAmount,
    platformAmount
  };
}

/**
 * Génère un lien signé HMAC pour l'acceptation ou le refus sans authentification d'une proposition par le commerce.
 */
export function generateSignedLink(eventId: string, action: 'accept' | 'decline'): string {
  const timestamp = Date.now();
  const data = `${timestamp}:${eventId}:${action}`;
  const signature = crypto.createHmac('sha256', SECRET).update(data).digest('hex');
  const token = `${timestamp}.${signature}`;
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://capten.app';
  return `${siteUrl}/api/spot-events/${eventId}/respond?action=${action}&token=${token}`;
}

/**
 * Vérifie un token signé HMAC reçu d'un commerce pour s'assurer de sa validité.
 * Expiration fixée à 7 jours.
 */
export function verifySignedToken(eventId: string, action: 'accept' | 'decline', token: string): boolean {
  try {
    const [timestampStr, signature] = token.split('.');
    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) return false;

    // Validation de l'âge du token (7 jours max)
    const age = Date.now() - timestamp;
    if (age < 0 || age > 7 * 24 * 60 * 60 * 1000) {
      return false;
    }

    const expectedData = `${timestamp}:${eventId}:${action}`;
    const expectedSignature = crypto.createHmac('sha256', SECRET).update(expectedData).digest('hex');

    // Comparaison en temps constant pour éviter les attaques temporelles (timing attacks)
    const sigBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    
    if (sigBuffer.length !== expectedBuffer.length) {
      return false;
    }
    
    return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
  } catch (e) {
    return false;
  }
}
