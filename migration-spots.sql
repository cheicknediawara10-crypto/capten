-- ============================================================
-- CAPTEN SPOTS — SCHEMA & MIGRATION SQL
-- Module: Spots (Marketplace Commerces <=> Run Clubs)
-- ============================================================

-- 1. Ajout de la cagnotte Spots au club
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS spots_balance_cents INTEGER DEFAULT 0 NOT NULL;

-- 2. Création de la table 'spots' (Commerces)
CREATE TABLE IF NOT EXISTS public.spots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  offer_description TEXT NOT NULL,          -- Ex: "café filtre + part de banana bread"
  offer_price_cents INTEGER NOT NULL CHECK (offer_price_cents >= 0), -- Prix payé par le coureur
  availability JSONB NOT NULL,              -- Ex: {"sat":["morning"],"tue":["evening"]}
  stripe_account_id TEXT,                   -- Compte Stripe Connect Express du commerce
  status TEXT NOT NULL DEFAULT 'pending',   -- pending | active | paused | rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT spots_status_check CHECK (status IN ('pending', 'active', 'paused', 'rejected'))
);

-- 3. Création de la table 'spot_events' (Événements vendables à une date précise)
CREATE TABLE IF NOT EXISTS public.spot_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id UUID REFERENCES public.spots(id) ON DELETE CASCADE NOT NULL,
  club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME WITHOUT TIME ZONE NOT NULL,
  estimated_runners INTEGER NOT NULL CHECK (estimated_runners > 0),
  quota INTEGER NOT NULL CHECK (quota >= 0), -- Places max vendables (capacity du spot par défaut)
  offer_price_cents INTEGER NOT NULL CHECK (offer_price_cents >= 0),
  merchant_rate NUMERIC NOT NULL DEFAULT 0.75,
  club_rate NUMERIC NOT NULL DEFAULT 0.125,
  platform_rate NUMERIC NOT NULL DEFAULT 0.125,
  public_slug TEXT UNIQUE NOT NULL,         -- URL /spots/[slug] de la page de vente
  status TEXT NOT NULL DEFAULT 'proposed',  -- proposed | accepted | declined | expired | on_sale | completed | cancelled
  checkin_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT spot_events_status_check CHECK (status IN ('proposed', 'accepted', 'declined', 'expired', 'on_sale', 'completed', 'cancelled'))
);

-- 4. Création de la table 'spot_tickets' (Billets achetés par les coureurs)
CREATE TABLE IF NOT EXISTS public.spot_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_event_id UUID REFERENCES public.spot_events(id) ON DELETE CASCADE NOT NULL,
  runner_email TEXT NOT NULL,
  runner_name TEXT,
  qr_token TEXT UNIQUE NOT NULL,
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
  stripe_payment_intent_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'paid',      -- paid | redeemed | refunded
  redeemed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT spot_tickets_status_check CHECK (status IN ('paid', 'redeemed', 'refunded'))
);

-- 5. Création des Index pour optimiser les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_spot_events_spot_date ON public.spot_events (spot_id, event_date);
CREATE INDEX IF NOT EXISTS idx_spot_events_club_status ON public.spot_events (club_id, status);
CREATE INDEX IF NOT EXISTS idx_spot_tickets_event_status ON public.spot_tickets (spot_event_id, status);
CREATE INDEX IF NOT EXISTS idx_spots_status ON public.spots (status);

-- 6. Activation de la Sécurité Row Level Security (RLS)
ALTER TABLE public.spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spot_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spot_tickets ENABLE ROW LEVEL SECURITY;

-- 7. Politiques de Sécurité pour 'spots'
DROP POLICY IF EXISTS "Public can view active spots" ON public.spots;
CREATE POLICY "Public can view active spots" ON public.spots
  FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Captains can view all spots" ON public.spots;
CREATE POLICY "Captains can view all spots" ON public.spots
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can register a spot" ON public.spots;
CREATE POLICY "Anyone can register a spot" ON public.spots
  FOR INSERT WITH CHECK (status = 'pending');

-- 8. Politiques de Sécurité pour 'spot_events'
DROP POLICY IF EXISTS "Public can view active spot events" ON public.spot_events;
CREATE POLICY "Public can view active spot events" ON public.spot_events
  FOR SELECT USING (status IN ('accepted', 'on_sale', 'completed'));

DROP POLICY IF EXISTS "Captains can manage their own events" ON public.spot_events;
CREATE POLICY "Captains can manage their own events" ON public.spot_events
  FOR ALL TO authenticated
  USING (club_id = auth.uid())
  WITH CHECK (club_id = auth.uid());

-- 9. Politiques de Sécurité pour 'spot_tickets'
DROP POLICY IF EXISTS "Captains can view tickets for their events" ON public.spot_tickets;
CREATE POLICY "Captains can view tickets for their events" ON public.spot_tickets
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.spot_events e
      WHERE e.id = spot_tickets.spot_event_id
      AND e.club_id = auth.uid()
    )
  );
