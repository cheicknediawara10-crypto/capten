-- ============================================================
-- CAPTEN — Migration SQL de la Table `broadcast_queue`
-- ============================================================

-- Table pour la file d'attente des messages WhatsApp (Undo & Buffer)
CREATE TABLE IF NOT EXISTS broadcast_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    run_id UUID REFERENCES runs(id) ON DELETE CASCADE,
    
    -- Destinataire
    recipient_id TEXT NOT NULL,       -- Numéro de téléphone, ID de membre, ou ID de groupe WhatsApp
    recipient_name TEXT NOT NULL,     -- Prénom / Nom du coureur, ou Nom du groupe
    
    -- Typologie d'envoi
    target_type TEXT CHECK (target_type IN ('group_broadcast', 'individual_dm')) NOT NULL,
    
    -- Contenu et planification
    message_content TEXT NOT NULL,
    send_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Cycle de vie
    status TEXT DEFAULT 'hold' CHECK (status IN ('hold', 'pending', 'processing', 'sent', 'cancelled')) NOT NULL
);

-- Index pour doper les performances du worker de fond
CREATE INDEX IF NOT EXISTS idx_broadcast_queue_send_at_status ON broadcast_queue(send_at, status);
CREATE INDEX IF NOT EXISTS idx_broadcast_queue_run_id ON broadcast_queue(run_id);
