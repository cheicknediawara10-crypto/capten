-- ============================================================
-- CAPTEN — Migration SQL : Phase 2 WhatsApp Notifications
-- ============================================================

-- Table orchestrant l'envoi différé des DM individuels (Phase 2 à H-15m)
CREATE TABLE IF NOT EXISTS whatsapp_notification_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    run_id UUID REFERENCES runs(id) ON DELETE CASCADE,
    
    -- Destinataire
    user_id TEXT NOT NULL,           -- Identifiant de l'athlète / Numéro de téléphone
    recipient_name TEXT NOT NULL,    -- Prénom
    
    -- Contenu et planification
    message_content TEXT NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Cycle de vie
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'cancelled')) NOT NULL
);

-- Indexation pour maximiser la vitesse du cron job
CREATE INDEX IF NOT EXISTS idx_whatsapp_queue_scheduled_at_status ON whatsapp_notification_queue(scheduled_at, status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_queue_run_id ON whatsapp_notification_queue(run_id);
