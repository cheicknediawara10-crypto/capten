-- ============================================================================
-- CAPTEN — Table des abonnements Web Push Notifications PWA
-- ============================================================================

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  membre_id UUID REFERENCES membre_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour recherche rapide par club ou membre
CREATE INDEX IF NOT EXISTS idx_push_club_id ON push_subscriptions(club_id);
CREATE INDEX IF NOT EXISTS idx_push_membre_id ON push_subscriptions(membre_id);
CREATE INDEX IF NOT EXISTS idx_push_user_id ON push_subscriptions(user_id);

-- RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lecture abonnements push" ON push_subscriptions;
CREATE POLICY "lecture abonnements push" ON push_subscriptions FOR SELECT USING (true);

DROP POLICY IF EXISTS "insertion abonnements push" ON push_subscriptions;
CREATE POLICY "insertion abonnements push" ON push_subscriptions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "suppression abonnements push" ON push_subscriptions;
CREATE POLICY "suppression abonnements push" ON push_subscriptions FOR DELETE USING (true);
