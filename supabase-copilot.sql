-- =========================================================================
-- CAPTEN COPILOTE SCHEMAS
-- =========================================================================

-- 1. Table copilote_alertes
CREATE TABLE IF NOT EXISTS public.copilote_alertes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    club_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Alert classification
    type TEXT NOT NULL CHECK (type IN (
        'nouveau_runner',           -- Nouveau runner inscrit, sans aucun run
        'regulier_decroche',        -- Runner régulier absent depuis 3 runs
        'baisse_frequentation',     -- Taux d'inscription en baisse vs la moyenne
        'aucun_run_prevu',          -- Aucun run planifié pour les 7 prochains jours
        'baisse_activite_mensuelle',-- Nombre de runs ce mois < 50% du mois précédent
        'milestone_runs',           -- Palier de runs collectifs atteint (50, 100, 250...)
        'record_affluence',         -- Record d'affluence battu
        'incident_non_resolu',      -- Signalements urgents/critiques non résolus
        'cagnotte_inactive',        -- Cagnotte non configurée
        'meteo_extreme',            -- Alerte météo pluie/orage sur un run prévu
        'belle_dynamique'           -- Croissance positive de nouveaux membres
    )),
    
    -- Priority for display order
    priority TEXT DEFAULT 'MOYENNE' CHECK (priority IN ('BASSE', 'MOYENNE', 'HAUTE', 'CRITIQUE')) NOT NULL,
    
    -- Alert status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'dismissed', 'actioned', 'expired')) NOT NULL,
    
    -- Metadata payload
    payload JSONB DEFAULT '{}' NOT NULL,
    
    -- Deduplication key
    dedup_key TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    dismissed_at TIMESTAMP WITH TIME ZONE,
    actioned_at TIMESTAMP WITH TIME ZONE,
    
    -- Contrainte d'unicité sur les alertes actives pour éviter les doublons
    CONSTRAINT unique_active_alert UNIQUE (club_id, dedup_key, status)
);

-- Index pour accélérer la lecture du Dashboard
CREATE INDEX IF NOT EXISTS idx_copilote_alertes_club_status ON copilote_alertes(club_id, status);
CREATE INDEX IF NOT EXISTS idx_copilote_alertes_priority ON copilote_alertes(priority);

-- 2. Table copilote_brief (Daily digest)
CREATE TABLE IF NOT EXISTS public.copilote_brief (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    club_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    brief_date DATE DEFAULT CURRENT_DATE NOT NULL,
    headline TEXT NOT NULL,               -- Briefing d'accroche (max 150 caractères)
    body TEXT,                            -- Synthèse complète en Markdown
    mood TEXT DEFAULT 'neutre' CHECK (mood IN ('celebrer', 'alerter', 'inspirer', 'neutre')) NOT NULL,
    
    alert_ids UUID[] DEFAULT '{}',
    context_snapshot JSONB DEFAULT '{}' NOT NULL,
    generated_by TEXT DEFAULT 'cron' CHECK (generated_by IN ('cron', 'manual', 'api')) NOT NULL,
    model_used TEXT,
    
    CONSTRAINT unique_daily_brief UNIQUE (club_id, brief_date)
);

CREATE INDEX IF NOT EXISTS idx_copilote_brief_club_date ON copilote_brief(club_id, brief_date DESC);

-- 3. Table message_variantes
CREATE TABLE IF NOT EXISTS public.message_variantes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    alert_type TEXT NOT NULL,
    variante_index INTEGER DEFAULT 0 NOT NULL,
    langue TEXT DEFAULT 'fr' NOT NULL,
    
    titre TEXT NOT NULL,
    corps TEXT NOT NULL,
    emoji TEXT,
    cta_label TEXT,
    cta_action TEXT,
    
    CONSTRAINT unique_variante UNIQUE (alert_type, variante_index, langue)
);

CREATE INDEX IF NOT EXISTS idx_message_variantes_type ON message_variantes(alert_type);

-- 4. Sécurité RLS
ALTER TABLE copilote_alertes ENABLE ROW LEVEL SECURITY;
ALTER TABLE copilote_brief ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_variantes ENABLE ROW LEVEL SECURITY;

-- Politiques copilote_alertes
DROP POLICY IF EXISTS "Captain read own alerts" ON copilote_alertes;
CREATE POLICY "Captain read own alerts" ON copilote_alertes
    FOR SELECT TO authenticated
    USING (club_id = auth.uid());

DROP POLICY IF EXISTS "Captain update own alerts" ON copilote_alertes;
CREATE POLICY "Captain update own alerts" ON copilote_alertes
    FOR UPDATE TO authenticated
    USING (club_id = auth.uid())
    WITH CHECK (club_id = auth.uid());

DROP POLICY IF EXISTS "Service role insert alerts" ON copilote_alertes;
CREATE POLICY "Service role insert alerts" ON copilote_alertes
    FOR INSERT TO service_role
    WITH CHECK (true);

DROP POLICY IF EXISTS "Service role delete alerts" ON copilote_alertes;
CREATE POLICY "Service role delete alerts" ON copilote_alertes
    FOR DELETE TO service_role
    USING (true);

-- Politiques copilote_brief
DROP POLICY IF EXISTS "Captain read own briefs" ON copilote_brief;
CREATE POLICY "Captain read own briefs" ON copilote_brief
    FOR SELECT TO authenticated
    USING (club_id = auth.uid());

DROP POLICY IF EXISTS "Service role manage briefs" ON copilote_brief;
CREATE POLICY "Service role manage briefs" ON copilote_brief
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- Politiques message_variantes
DROP POLICY IF EXISTS "Everyone read message variantes" ON message_variantes;
CREATE POLICY "Everyone read message variantes" ON message_variantes
    FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Service role manage message_variantes" ON message_variantes;
CREATE POLICY "Service role manage message_variantes" ON message_variantes
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- =========================================================================
-- SEED DATA - VARIANTES DE MESSAGES PAR TYPE
-- =========================================================================

DELETE FROM message_variantes;

-- Variantes pour nouveau_runner
INSERT INTO message_variantes (alert_type, variante_index, titre, corps, emoji, cta_label, cta_action) VALUES
('nouveau_runner', 0, 'Nouveau coureur dans le crew !', '{{runner_name}} a rejoint ton crew il y a moins de 3 jours mais ne s''est inscrit à aucune session. Écris-lui pour l''inviter à son premier run.', '👋', 'Accueillir sur WhatsApp', 'send_whatsapp'),
('nouveau_runner', 1, 'Intégration d''un nouveau', '{{runner_name}} est dans le crew depuis 3 jours sans aucun run. Envoie-lui un petit mot d''accueil sympa.', '🆕', 'Lancer la discussion', 'send_whatsapp'),
('nouveau_runner', 2, 'Brise la glace avec {{runner_name}}', 'Nouveau membre détecté ! Un message de bienvenue pour son premier run fait souvent toute la différence.', '🏃‍♂️', 'Briser la glace', 'send_whatsapp');

-- Variantes pour regulier_decroche
INSERT INTO message_variantes (alert_type, variante_index, titre, corps, emoji, cta_label, cta_action) VALUES
('regulier_decroche', 0, 'Un régulier décroche ?', '{{runner_name}} ({{count}} runs) a raté les 3 dernières sessions. Prends de ses nouvelles pour t''assurer que tout va bien.', '📉', 'Prendre des nouvelles', 'send_whatsapp'),
('regulier_decroche', 1, 'Manque à l''appel', '{{runner_name}} n''est pas venu depuis 3 runs. Envoie-lui un message d''encouragement amical.', '😟', 'Envoyer un mot', 'send_whatsapp'),
('regulier_decroche', 2, 'Besoin de motivation ?', 'Ton régulier {{runner_name}} a sauté les 3 derniers runs. Relance-le pour la prochaine session.', '💪', 'Relancer', 'send_whatsapp');

-- Variantes pour aucun_run_prevu
INSERT INTO message_variantes (alert_type, variante_index, titre, corps, emoji, cta_label, cta_action) VALUES
('aucun_run_prevu', 0, 'Aucun run planifié', 'Ton agenda est vide pour les 7 prochains jours. Lance une nouvelle session pour garder le crew motivé !', '📅', 'Créer un run', 'create_run'),
('aucun_run_prevu', 1, 'Le crew attend le prochain run', 'Rien de programmé cette semaine. Ne laisse pas le crew refroidir, planifie un run !', '⏰', 'Planifier une session', 'create_run');

-- Variantes pour baisse_frequentation
INSERT INTO message_variantes (alert_type, variante_index, titre, corps, emoji, cta_label, cta_action) VALUES
('baisse_frequentation', 0, 'Baisse de forme sur {{run_title}}', 'Seulement {{count}} inscrits pour la session dans moins de 48h. C''est moins de 30% de ta moyenne habituelle. Un petit rappel WhatsApp ?', '📢', 'Rappeler le crew', 'send_whatsapp'),
('baisse_frequentation', 1, 'Run sous-rempli', '{{run_title}} a un taux d''inscriptions assez bas. Relance le canal WhatsApp pour motiver le crew.', '🔥', 'Envoyer un rappel', 'send_whatsapp');

-- Variantes pour cagnotte_inactive
INSERT INTO message_variantes (alert_type, variante_index, titre, corps, emoji, cta_label, cta_action) VALUES
('cagnotte_inactive', 0, 'Cagnotte non configurée', 'Tu n''as pas configuré ta cagnotte d''après-run. Cela prend 2 minutes dans les réglages et facilite le café post-run !', '💰', 'Configurer ma cagnotte', 'settings_cagnotte');

-- Variantes pour meteo_extreme
INSERT INTO message_variantes (alert_type, variante_index, titre, corps, emoji, cta_label, cta_action) VALUES
('meteo_extreme', 0, 'Météo capricieuse prévue', 'De la pluie ou de l''orage est annoncé pendant le run "{{run_title}}". Prévins le crew ou adapte le parcours.', '⛈️', 'Alerter le crew', 'send_whatsapp');

-- Variantes pour record_affluence
INSERT INTO message_variantes (alert_type, variante_index, titre, corps, emoji, cta_label, cta_action) VALUES
('record_affluence', 0, 'Record d''affluence battu !', 'Incroyable ! Le run "{{run_title}}" a réuni {{count}} coureurs. Partage cette victoire et remercie le crew.', '🎉', 'Féliciter le crew', 'send_whatsapp');

-- Variantes pour belle_dynamique
INSERT INTO message_variantes (alert_type, variante_index, titre, corps, emoji, cta_label, cta_action) VALUES
('belle_dynamique', 0, 'Le crew grandit !', 'De nombreux nouveaux coureurs ont rejoint le crew cette semaine. Félicitations pour cette belle dynamique 🔥', '🚀', 'Célébrer la croissance', 'send_whatsapp');
