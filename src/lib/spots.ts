import crypto from 'crypto';

const SECRET = process.env.CRON_SECRET || 'capten-spots-secret-2026';

// Interfaces TypeScript pour le module Spots
export interface SpotOffer {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  quota: number;
  availability: string[];
  status: 'active' | 'paused';
  created_at: string;
}

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
  offer_name?: string;
  offers?: SpotOffer[];
  availability: Record<string, string[]>;
  stripe_account_id: string | null;
  status: 'pending' | 'active' | 'paused' | 'rejected';
  merchant_access_token?: string | null;
  merchant_token_expires_at?: string | null;
  total_earned_cents?: number;
  total_events?: number;
  total_runners?: number;
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
  merchant_rate?: number;
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
  is_first_visit: boolean;
  commission_applied: boolean;
  stripe_payment_intent_id: string;
  status: 'paid' | 'redeemed' | 'refunded';
  redeemed_at: string | null;
  created_at: string;
}

export interface RunnerVisit {
  runner_email: string;
  spot_id: string;
  first_visit_at: string;
}

export interface SpotSuggestion {
  id: string;
  club_id: string;
  suggested_name: string;
  suggested_contact: string | null;
  suggested_address: string | null;
  notes: string | null;
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
  clubRate: number = 0.10,
  platformRate: number = 0.05,
  commissionApplied: boolean = true
) {
  if (!commissionApplied) {
    return {
      merchantAmount: amountCents,
      clubAmount: 0,
      platformAmount: 0
    };
  }
  const clubAmount = Math.round(amountCents * clubRate);
  const platformAmount = Math.round(amountCents * platformRate);
  const merchantAmount = amountCents - clubAmount - platformAmount;
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

/**
 * Génère un lien magique sécurisé pour l'Espace Commerce (durée de validité 30 jours).
 */
export function generateMerchantMagicLink(spotId: string, email: string): { link: string; token: string; expiresAt: string } {
  const timestamp = Date.now();
  const expiresInMs = 30 * 24 * 60 * 60 * 1000; // 30 jours
  const expiresAtMs = timestamp + expiresInMs;
  const data = `merchant:${spotId}:${email.toLowerCase()}:${expiresAtMs}`;
  const signature = crypto.createHmac('sha256', SECRET).update(data).digest('hex');
  const token = `${spotId}.${expiresAtMs}.${signature}`;
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://capten.app';
  const link = `${siteUrl}/spots/espace?token=${token}`;
  return {
    link,
    token,
    expiresAt: new Date(expiresAtMs).toISOString()
  };
}

/**
 * Vérifie la validité d'un token d'accès Espace Commerce (durée de validité 30 jours).
 */
export function verifyMerchantToken(token: string, email?: string): { valid: boolean; spotId?: string; expired?: boolean } {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return { valid: false };
    const [spotId, expiresAtStr, signature] = parts;
    const expiresAtMs = parseInt(expiresAtStr, 10);
    if (isNaN(expiresAtMs)) return { valid: false };

    if (Date.now() > expiresAtMs) {
      return { valid: false, spotId, expired: true };
    }

    if (email) {
      const expectedData = `merchant:${spotId}:${email.toLowerCase()}:${expiresAtMs}`;
      const expectedSignature = crypto.createHmac('sha256', SECRET).update(expectedData).digest('hex');
      const sigBuffer = Buffer.from(signature, 'hex');
      const expectedBuffer = Buffer.from(expectedSignature, 'hex');
      if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
        return { valid: false };
      }
    }

    return { valid: true, spotId };
  } catch (e) {
    return { valid: false };
  }
}

// Données de simulation pour le développement local ou en mode mock
export const MOCK_SPOTS: Spot[] = [
  {
    id: 'spot-1-mock',
    name: 'Blondy Coffee',
    address: '12 Rue de la Lune, 75002 Paris',
    neighborhood: 'Sentier / 2ème',
    contact_email: 'hello@blondy.cafe',
    contact_phone: '0142345678',
    capacity: 40,
    offer_name: 'Le Pack Récup',
    offer_description: 'Café filtre + Part de banana bread maison',
    offer_price_cents: 600,
    offers: [
      {
        id: 'offer-1',
        name: 'Le Pack Récup',
        description: 'Café filtre + Part de banana bread maison',
        price_cents: 600,
        quota: 40,
        availability: ['sat_morning', 'sun_morning'],
        status: 'active',
        created_at: new Date().toISOString()
      },
      {
        id: 'offer-2',
        name: 'Le Brunch Runner',
        description: 'Matcha Latte + Avocado toast + Granola bowl',
        price_cents: 1400,
        quota: 20,
        availability: ['sun_morning'],
        status: 'active',
        created_at: new Date().toISOString()
      }
    ],
    availability: { sat: ['morning'], sun: ['morning'], wed: ['afternoon'] },
    stripe_account_id: 'acct_1mock123',
    status: 'active',
    total_earned_cents: 62035,
    total_events: 4,
    total_runners: 143,
    created_at: new Date().toISOString()
  },
  {
    id: 'spot-2-mock',
    name: 'The French Bastards',
    address: '181 Rue Saint-Denis, 75002 Paris',
    neighborhood: 'Saint-Denis / 2ème',
    contact_email: 'contact@tfb.com',
    contact_phone: '0142348899',
    capacity: 30,
    offer_name: 'Le Pack Petit-Dej',
    offer_description: 'Double Espresso + Croissant au beurre AOP',
    offer_price_cents: 500,
    offers: [
      {
        id: 'offer-tfb-1',
        name: 'Le Pack Petit-Dej',
        description: 'Double Espresso + Croissant au beurre AOP',
        price_cents: 500,
        quota: 30,
        availability: ['sat_morning', 'sun_morning'],
        status: 'active',
        created_at: new Date().toISOString()
      }
    ],
    availability: { sat: ['morning'], sun: ['morning'] },
    stripe_account_id: null,
    status: 'active',
    total_earned_cents: 35000,
    total_events: 2,
    total_runners: 70,
    created_at: new Date().toISOString()
  },
  {
    id: 'spot-3-mock',
    name: 'Café de Flore',
    address: '172 Boulevard Saint-Germain, 75006 Paris',
    neighborhood: 'Saint-Germain / 6ème',
    contact_email: 'flore@cafe.fr',
    contact_phone: '0145485526',
    capacity: 50,
    offer_name: 'Formule Gourmande',
    offer_description: 'Chocolat chaud spécial + Viennoiserie au choix',
    offer_price_cents: 1200,
    offers: [
      {
        id: 'offer-flore-1',
        name: 'Formule Gourmande',
        description: 'Chocolat chaud spécial + Viennoiserie au choix',
        price_cents: 1200,
        quota: 50,
        availability: ['tue_morning', 'thu_morning'],
        status: 'active',
        created_at: new Date().toISOString()
      }
    ],
    availability: { tue: ['morning'], thu: ['morning'] },
    stripe_account_id: 'acct_2mock123',
    status: 'pending',
    total_earned_cents: 0,
    total_events: 0,
    total_runners: 0,
    created_at: new Date().toISOString()
  }
];

export const MOCK_SPOT_EVENTS: SpotEvent[] = [
  {
    id: 'event-1-mock',
    spot_id: 'spot-1-mock',
    club_id: 'mock-captain-uuid',
    event_date: '2026-07-18',
    event_time: '10:00:00',
    estimated_runners: 35,
    quota: 40,
    offer_price_cents: 600,
    club_rate: 0.10,
    platform_rate: 0.05,
    public_slug: 'paris-run-club-chez-blondy-coffee-20260718-abcd',
    status: 'on_sale',
    checkin_count: 0,
    created_at: new Date().toISOString()
  }
];
