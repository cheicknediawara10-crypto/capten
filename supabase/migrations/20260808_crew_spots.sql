-- crew_spots : lieux recommandés par le fondateur (café, shop, kiné, etc.)
-- Affichage d'informations uniquement — AUCUNE logique de paiement, commission, ou transaction.

CREATE TABLE IF NOT EXISTS crew_spots (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id      UUID         NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  nom          TEXT         NOT NULL,
  categorie    TEXT         NOT NULL DEFAULT 'autre'
                 CHECK (categorie IN ('cafe','shop','kine','osteo','autre')),
  adresse      TEXT,
  lien_maps    TEXT,
  mot_du_fondateur TEXT,
  avantage     TEXT,        -- texte libre ex: "-10% sur présentation Capten" — pas de calcul
  ordre        INT          NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE (club_id, nom)
);

CREATE INDEX IF NOT EXISTS idx_crew_spots_club ON crew_spots(club_id);
CREATE INDEX IF NOT EXISTS idx_crew_spots_ordre ON crew_spots(club_id, ordre);

ALTER TABLE crew_spots ENABLE ROW LEVEL SECURITY;

-- Lecture publique : page crew et micro-page coureur sont accessibles sans auth
CREATE POLICY "lecture publique des spots crew"
  ON crew_spots FOR SELECT
  USING (true);

-- Le fondateur gère les spots de son propre crew uniquement
CREATE POLICY "fondateur gere les spots de son crew"
  ON crew_spots FOR ALL
  USING  (club_id IN (SELECT id FROM clubs WHERE owner_id = auth.uid()))
  WITH CHECK (club_id IN (SELECT id FROM clubs WHERE owner_id = auth.uid()));
