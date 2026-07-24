-- ============================================
-- CAPTEN SPOTS — Migration Espace Commerce
-- ============================================

ALTER TABLE spots ADD COLUMN IF NOT EXISTS offer_name TEXT DEFAULT 'Le Pack Récup';
ALTER TABLE spots ADD COLUMN IF NOT EXISTS offers JSONB DEFAULT '[]'::jsonb;
ALTER TABLE spots ADD COLUMN IF NOT EXISTS merchant_access_token TEXT;
ALTER TABLE spots ADD COLUMN IF NOT EXISTS merchant_token_expires_at TIMESTAMPTZ;
ALTER TABLE spots ADD COLUMN IF NOT EXISTS total_earned_cents INT DEFAULT 0;
ALTER TABLE spots ADD COLUMN IF NOT EXISTS total_events INT DEFAULT 0;
ALTER TABLE spots ADD COLUMN IF NOT EXISTS total_runners INT DEFAULT 0;

-- Index pour accélérer la recherche par email de contact et token
CREATE INDEX IF NOT EXISTS idx_spots_contact_email ON spots(contact_email);
CREATE INDEX IF NOT EXISTS idx_spots_merchant_token ON spots(merchant_access_token);
