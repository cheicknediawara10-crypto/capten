-- CONTRAINTE DE SÉCURITÉ ANTI-DOUBLE TRANSACTION (SPOTS)
-- À exécuter dans l'éditeur SQL de Supabase

-- Ajoute une contrainte d'unicité sur stripe_payment_intent_id dans la table spot_tickets
ALTER TABLE spot_tickets
ADD CONSTRAINT unique_payment_intent
UNIQUE (stripe_payment_intent_id);
