-- ════════════════════════════════════════════════════════════════════════
--  CAPTEN — FEATURE RUN ÉVÉNEMENT (JAUGE, PAIEMENT EXTERNE, LISTE D'ATTENTE)
-- ════════════════════════════════════════════════════════════════════════

ALTER TABLE public.events 
  ADD COLUMN IF NOT EXISTS is_evenement BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS jauge_max INTEGER,
  ADD COLUMN IF NOT EXISTS prix NUMERIC(6,2),
  ADD COLUMN IF NOT EXISTS devise TEXT NOT NULL DEFAULT 'EUR',
  ADD COLUMN IF NOT EXISTS lien_paiement TEXT,
  ADD COLUMN IF NOT EXISTS description_evenement TEXT;

CREATE TABLE IF NOT EXISTS public.event_inscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  membre_id UUID REFERENCES public.membre_profiles(id) ON DELETE SET NULL,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT,
  telephone TEXT,
  statut_paiement TEXT NOT NULL DEFAULT 'en_attente' CHECK (statut_paiement IN ('en_attente', 'paye', 'rembourse')),
  position_liste_attente INTEGER,
  confirme_par_coureur BOOLEAN NOT NULL DEFAULT false,
  confirme_par_fondateur BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ,
  promoted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inscriptions_event ON public.event_inscriptions(event_id);
CREATE INDEX IF NOT EXISTS idx_inscriptions_waitlist ON public.event_inscriptions(event_id, position_liste_attente);
CREATE INDEX IF NOT EXISTS idx_inscriptions_statut ON public.event_inscriptions(event_id, statut_paiement);

ALTER TABLE public.event_inscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Captains can view and manage their event inscriptions" ON public.event_inscriptions;
CREATE POLICY "Captains can view and manage their event inscriptions" ON public.event_inscriptions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_inscriptions.event_id 
        AND (e.club_id = auth.uid() OR e.created_by = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Public can register to published events" ON public.event_inscriptions;
CREATE POLICY "Public can register to published events" ON public.event_inscriptions
  FOR INSERT TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_inscriptions.event_id 
        AND e.status IN ('published', 'completed')
    )
  );

DROP POLICY IF EXISTS "Public can update their payment confirmation" ON public.event_inscriptions;
CREATE POLICY "Public can update their payment confirmation" ON public.event_inscriptions
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read event inscriptions count" ON public.event_inscriptions;
CREATE POLICY "Public can read event inscriptions count" ON public.event_inscriptions
  FOR SELECT TO anon
  USING (true);

GRANT SELECT (
  id,
  club_id,
  title,
  description,
  event_date,
  meeting_point_address,
  meeting_point_lat,
  meeting_point_lng,
  max_participants,
  status,
  checkin_radius_meters,
  distance_km,
  photos_url,
  created_at,
  is_evenement,
  jauge_max,
  prix,
  devise,
  lien_paiement,
  description_evenement
) ON public.events TO anon;

GRANT ALL ON public.event_inscriptions TO anon;
GRANT ALL ON public.event_inscriptions TO authenticated;
GRANT ALL ON public.event_inscriptions TO service_role;
