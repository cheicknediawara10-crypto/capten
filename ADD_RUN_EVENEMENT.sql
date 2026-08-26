-- ════════════════════════════════════════════════════════════════════════
--  CAPTEN — FEATURE RUN ÉVÉNEMENT (JAUGE, PAIEMENT EXTERNE, LISTE D'ATTENTE)
--  À exécuter dans Supabase → SQL Editor → Run.
-- ════════════════════════════════════════════════════════════════════════

-- 1. Ajout des colonnes événementielles sur la table `events`
ALTER TABLE public.events 
  ADD COLUMN IF NOT EXISTS is_evenement BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS jauge_max INTEGER,
  ADD COLUMN IF NOT EXISTS prix NUMERIC(6,2),
  ADD COLUMN IF NOT EXISTS devise TEXT NOT NULL DEFAULT 'EUR',
  ADD COLUMN IF NOT EXISTS lien_paiement TEXT,
  ADD COLUMN IF NOT EXISTS description_evenement TEXT;

-- 2. Création de la table des inscriptions aux runs / événements
CREATE TABLE IF NOT EXISTS public.event_inscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  membre_id UUID REFERENCES public.membre_profiles(id) ON DELETE SET NULL,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT,
  telephone TEXT,
  statut_paiement TEXT NOT NULL DEFAULT 'en_attente' CHECK (statut_paiement IN ('en_attente', 'paye', 'rembourse')),
  position_liste_attente INTEGER, -- NULL si inscrit dans la jauge, 1..N si en liste d'attente
  confirme_par_coureur BOOLEAN NOT NULL DEFAULT false,
  confirme_par_fondateur BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ, -- 48h après inscription pour paiement non confirmé
  promoted_at TIMESTAMPTZ, -- date de promotion depuis la liste d'attente
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour performances sur les calculs de jauge et liste d'attente
CREATE INDEX IF NOT EXISTS idx_inscriptions_event ON public.event_inscriptions(event_id);
CREATE INDEX IF NOT EXISTS idx_inscriptions_waitlist ON public.event_inscriptions(event_id, position_liste_attente);
CREATE INDEX IF NOT EXISTS idx_inscriptions_statut ON public.event_inscriptions(event_id, statut_paiement);

-- 3. Activation de RLS sur `event_inscriptions`
ALTER TABLE public.event_inscriptions ENABLE ROW LEVEL SECURITY;

-- Les capitaines voient les inscriptions de leur propre crew
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

-- Les coureurs publics (anon) peuvent insérer leur inscription
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

-- Les coureurs publics (anon) peuvent mettre à jour leur statut déclaratif de paiement
DROP POLICY IF EXISTS "Public can update their payment confirmation" ON public.event_inscriptions;
CREATE POLICY "Public can update their payment confirmation" ON public.event_inscriptions
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

-- Permettre la lecture publique anonyme pour afficher le compteur de jauge
DROP POLICY IF EXISTS "Public can read event inscriptions count" ON public.event_inscriptions;
CREATE POLICY "Public can read event inscriptions count" ON public.event_inscriptions
  FOR SELECT TO anon
  USING (true);

-- 4. Permissions sur les colonnes publiques de `events` (compatibilité sécurité anon)
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
