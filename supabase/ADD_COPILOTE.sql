-- ═══════════════════════════════════════════════════════════════════════════
-- COPILOTE — Phase 1 : table des alertes détectées (100% SQL, zéro IA)
-- À exécuter dans le SQL Editor de Supabase (prod). Idempotent.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS copilot_alerts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id     UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  category    TEXT NOT NULL,              -- accueil|logistique|visuels|celebration|securite|sante|admin
  priority    INT  NOT NULL DEFAULT 3,    -- 1 = haute, 2 = moyenne, 3 = agréable
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  cta_label   TEXT,
  cta_href    TEXT,
  dedup_key   TEXT NOT NULL,              -- clé anti-doublon (ex: affiche_<eventId>)
  status      TEXT NOT NULL DEFAULT 'new',-- new|done|dismissed
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at  TIMESTAMPTZ,
  UNIQUE(club_id, dedup_key)
);

CREATE INDEX IF NOT EXISTS idx_copilot_alerts_club ON copilot_alerts(club_id, status);

ALTER TABLE copilot_alerts ENABLE ROW LEVEL SECURITY;

-- Le fondateur gère uniquement les alertes de son propre crew.
DROP POLICY IF EXISTS "Founder manages own copilot alerts" ON copilot_alerts;
CREATE POLICY "Founder manages own copilot alerts" ON copilot_alerts FOR ALL
  USING (club_id IN (SELECT id FROM clubs WHERE owner_id = auth.uid() OR id = auth.uid()))
  WITH CHECK (club_id IN (SELECT id FROM clubs WHERE owner_id = auth.uid() OR id = auth.uid()));
