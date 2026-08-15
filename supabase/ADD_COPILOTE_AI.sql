-- ═══════════════════════════════════════════════════════════════════════════
-- COPILOTE — Phase 2 : compteur d'usage IA (garde-fou coût, ex: 14/20 par jour)
-- À exécuter dans le SQL Editor de Supabase (prod). Idempotent.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS copilot_ai_usage (
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  day     DATE NOT NULL DEFAULT CURRENT_DATE,
  count   INT  NOT NULL DEFAULT 0,
  PRIMARY KEY (club_id, day)
);

ALTER TABLE copilot_ai_usage ENABLE ROW LEVEL SECURITY;

-- Le fondateur peut LIRE son propre compteur (pour afficher "X/20").
-- L'écriture se fait côté serveur (service-role) via la route API.
DROP POLICY IF EXISTS "Founder reads own ai usage" ON copilot_ai_usage;
CREATE POLICY "Founder reads own ai usage" ON copilot_ai_usage FOR SELECT
  USING (club_id IN (SELECT id FROM clubs WHERE owner_id = auth.uid() OR id = auth.uid()));
