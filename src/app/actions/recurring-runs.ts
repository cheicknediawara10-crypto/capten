"use server"

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('votre-projet');

export async function generateMonthlyRunsForSeries(
  series_id: string,
  start_date: string | Date,
  end_date: string | Date
) {
  try {
    const start = new Date(start_date);
    const end = new Date(end_date);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { error: 'Dates invalides fournies.' };
    }

    // 1. Fallback local / Mode Démo si Supabase n'est pas configuré
    if (!isSupabaseConfigured) {
      console.log(`[Mode Démo] Génération de runs récurrents pour la série ${series_id}`);
      
      const runsGenerated: any[] = [];
      const current = new Date(start);
      // Supposons que le jour choisi est le jour du start_date pour la démo, ou le mardi (2) par défaut
      const dayOfWeek = 2; // Mardi
      
      while (current <= end) {
        if (current.getDay() === dayOfWeek) {
          const dateStr = current.toISOString().split('T')[0];
          const scheduledAt = `${dateStr}T19:30:00`;
          
          runsGenerated.push({
            id: `demo-${Math.random().toString(36).substr(2, 9)}`,
            series_id: series_id,
            club_id: 'demo-captain-id',
            captain_id: 'demo-captain-id',
            title: "Speed Run & Intervals (Démo)",
            location_start: "Social Spot → Canal St Martin",
            scheduled_at: scheduledAt,
            date_start: scheduledAt,
            is_paid: false,
            price_cents: 0,
            max_slots: null,
            slots_taken: 0,
            vibe: "Social & Chill",
            coach: "Alex Rivière",
            status: "scheduled",
            sms_sent: false,
            reminder_offset_minutes: 30
          });
        }
        current.setDate(current.getDate() + 1);
      }
      
      return {
        success: true,
        demoMode: true,
        count: runsGenerated.length,
        runs: runsGenerated,
        message: `[MODE DÉMO] ${runsGenerated.length} runs ont été simulés avec succès.`
      };
    }

    // 2. Connexion à Supabase avec la session utilisateur (RLS)
    const cookieStore = cookies();
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Géré en environnement de Server Action
            }
          },
        },
      }
    );

    // Vérifier l'utilisateur connecté
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { error: 'Non authentifié. Impossible de générer des runs.' };
    }

    // 3. Récupérer la règle de récurrence (run_series)
    const { data: series, error: seriesError } = await supabase
      .from('run_series')
      .select('*')
      .eq('id', series_id)
      .single();

    if (seriesError || !series) {
      return { error: `Série de runs introuvable ou accès non autorisé : ${seriesError?.message}` };
    }

    // RLS garantit l'accès, mais double sécurité sur le propriétaire du club
    if (series.club_id !== user.id) {
      return { error: 'Accès refusé : vous n\'êtes pas le fondateur de ce club.' };
    }

    // 4. Boucler sur les dates et filtrer par jour de la semaine
    const runsToInsert: any[] = [];
    const current = new Date(start);

    // Extraction des coordonnées de location_gps (POINT de type Postgres)
    let lat = null;
    let lng = null;
    if (series.location_gps) {
      if (typeof series.location_gps === 'string') {
        // Format Postgres "(x,y)" -> "(longitude,latitude)"
        const clean = series.location_gps.replace(/[\(\)]/g, '');
        const parts = clean.split(',');
        lng = parseFloat(parts[0]);
        lat = parseFloat(parts[1]);
      } else if (typeof series.location_gps === 'object') {
        lng = series.location_gps.x;
        lat = series.location_gps.y;
      }
    }

    while (current <= end) {
      if (current.getDay() === series.day_of_week) {
        const year = current.getFullYear();
        const month = String(current.getMonth() + 1).padStart(2, '0');
        const day = String(current.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        
        // Assembler la date et l'heure exactes du run
        const scheduledAt = `${dateStr}T${series.start_time}`;

        runsToInsert.push({
          series_id: series.id,
          club_id: series.club_id,
          captain_id: series.club_id, // Rétrocompatibilité
          title: series.title,
          scheduled_at: scheduledAt,
          date_start: scheduledAt,    // Rétrocompatibilité
          location_start: 'Départ programmé',
          start_latitude: lat,
          start_longitude: lng,
          is_paid: false,
          price_cents: 0,
          max_slots: null,
          slots_taken: 0,
          vibe: 'Social & Chill',
          coach: 'Alex Rivière',
          status: 'scheduled',
          sms_sent: false,
          reminder_offset_minutes: series.reminder_offset_minutes || 30
        });
      }
      current.setDate(current.getDate() + 1);
    }

    // 5. Insertion en masse des runs générés
    if (runsToInsert.length > 0) {
      const { data, error: insertError } = await supabase
        .from('runs')
        .insert(runsToInsert)
        .select();

      if (insertError) {
        return { error: `Erreur d'insertion des runs : ${insertError.message}` };
      }

      return {
        success: true,
        demoMode: false,
        count: data.length,
        runs: data
      };
    }

    return { success: true, count: 0, message: 'Aucun run généré : aucun jour correspondant trouvé dans la période spécifiée.' };

  } catch (error: any) {
    console.error('Error in generateMonthlyRunsForSeries Server Action:', error);
    return { error: error.message || 'Erreur interne du serveur lors de la planification.' };
  }
}
