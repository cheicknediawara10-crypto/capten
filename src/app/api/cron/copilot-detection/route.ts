import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getOrCreateDailyBrief } from '@/lib/ai/copilote';
import { getWeatherForecast } from '@/lib/weather';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return handleDetection(request);
}

export async function POST(request: Request) {
  return handleDetection(request);
}

async function handleDetection(request: Request) {
  try {
    // 1. Authentification simple du Cron
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'votre_cron_secret_ici';
    
    // Si CRON_SECRET est configuré et non-défaut, on le valide
    if (process.env.CRON_SECRET && cronSecret !== 'votre_cron_secret_ici') {
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
      }
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase admin non disponible' }, { status: 500 });
    }

    // 2. Récupérer tous les clubs
    const { data: clubs, error: clubsError } = await supabase
      .from('clubs')
      .select('id, stripe_plan, cagnotte_url, branding');

    if (clubsError || !clubs) {
      throw new Error(`Erreur lors de la récupération des clubs : ${clubsError?.message}`);
    }

    const results: any[] = [];

    for (const club of clubs) {
      const clubId = club.id;
      const stripePlan = club.stripe_plan || 'GRATUIT';
      const activeAlertsToUpsert: any[] = [];
      const now = new Date();

      try {
        // --- DÉTECTION 1 : ACCUEIL (Nouveau runner sans aucun run depuis 3j) ---
        const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
        const { data: newRunners } = await supabase
          .from('runners')
          .select('id, name, created_at')
          .eq('club_id', clubId)
          .gte('created_at', threeDaysAgo);

        if (newRunners) {
          for (const runner of newRunners) {
            // Compter ses participations
            const { count: regCount } = await supabase
              .from('registrations')
              .select('*', { count: 'exact', head: true })
              .eq('runner_id', runner.id);

            if (regCount === 0) {
              const diffDays = Math.ceil((now.getTime() - new Date(runner.created_at).getTime()) / (1000 * 3600 * 24));
              activeAlertsToUpsert.push({
                club_id: clubId,
                type: 'nouveau_runner',
                priority: 'MOYENNE',
                payload: { runner_id: runner.id, runner_name: runner.name, days: diffDays },
                dedup_key: `nouveau_runner:${runner.id}`,
                status: 'active'
              });
            }
          }
        }

        // --- DÉTECTION 2 : RÉTENTION (Régulier absent depuis 3 runs) ---
        const { data: lastRuns } = await supabase
          .from('runs')
          .select('id')
          .eq('club_id', clubId)
          .eq('status', 'completed')
          .order('date_start', { ascending: false })
          .limit(3);

        if (lastRuns && lastRuns.length === 3) {
          // Trouver les runners ayant participé à >= 3 runs en tout
          const { data: regulars } = await supabase
            .from('runners')
            .select('id, name, runs_count')
            .eq('club_id', clubId)
            .gte('runs_count', 3);

          if (regulars) {
            // Trouver les inscriptions des 3 derniers runs
            const runIds = lastRuns.map(r => r.id);
            const { data: recentRegs } = await supabase
              .from('registrations')
              .select('runner_id')
              .in('run_id', runIds)
              .eq('status', 'checked_in');

            const presentRunnerIds = new Set((recentRegs || []).map(r => r.runner_id));

            for (const r of regulars) {
              if (!presentRunnerIds.has(r.id)) {
                activeAlertsToUpsert.push({
                  club_id: clubId,
                  type: 'regulier_decroche',
                  priority: 'HAUTE',
                  payload: { runner_id: r.id, runner_name: r.name, count: r.runs_count },
                  dedup_key: `regulier_decroche:${r.id}`,
                  status: 'active'
                });
              }
            }
          }
        }

        // --- DÉTECTION 3 : LOGISTIQUE (Run < 48h sous-rempli) ---
        const fortyEightHoursLater = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString();
        const { data: nextRuns } = await supabase
          .from('runs')
          .select('id, title, date_start')
          .eq('club_id', clubId)
          .eq('status', 'scheduled')
          .gte('date_start', now.toISOString())
          .lte('date_start', fortyEightHoursLater);

        if (nextRuns && nextRuns.length > 0) {
          // Calculer la moyenne d'inscrits sur les runs passés
          const { data: pastRuns } = await supabase
            .from('runs')
            .select('id')
            .eq('club_id', clubId)
            .eq('status', 'completed');

          let avgInscrits = 10; // Fallback par défaut si pas d'historique
          if (pastRuns && pastRuns.length > 0) {
            const { data: regsCountData } = await supabase
              .from('registrations')
              .select('id')
              .in('run_id', pastRuns.map(r => r.id));
            avgInscrits = (regsCountData?.length || 0) / pastRuns.length;
          }

          for (const nextRun of nextRuns) {
            const { count: currentRegs } = await supabase
              .from('registrations')
              .select('*', { count: 'exact', head: true })
              .eq('run_id', nextRun.id)
              .in('status', ['registered', 'checked_in']);

            const regs = currentRegs || 0;
            if (regs < 0.3 * avgInscrits) {
              activeAlertsToUpsert.push({
                club_id: clubId,
                type: 'baisse_frequentation',
                priority: 'HAUTE',
                payload: { run_id: nextRun.id, run_title: nextRun.title, count: regs, average: Math.round(avgInscrits) },
                dedup_key: `baisse_frequentation:${nextRun.id}`,
                status: 'active'
              });
            }
          }
        }

        // --- DÉTECTION 4 : LOGISTIQUE (Aucun run programmé dans les 7 prochains jours) ---
        const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
        const { count: runsInNext7Days } = await supabase
          .from('runs')
          .select('*', { count: 'exact', head: true })
          .eq('club_id', clubId)
          .eq('status', 'scheduled')
          .gte('date_start', now.toISOString())
          .lte('date_start', sevenDaysLater);

        if ((runsInNext7Days || 0) === 0) {
          activeAlertsToUpsert.push({
            club_id: clubId,
            type: 'aucun_run_prevu',
            priority: 'MOYENNE',
            payload: {},
            dedup_key: 'aucun_run_prevu:7j',
            status: 'active'
          });
        }

        // --- DÉTECTION 5 : MÉTÉO (Pluie ou orage sur run prévu) ---
        const { data: upcomingRunsForWeather } = await supabase
          .from('runs')
          .select('id, title, date_start, start_latitude, start_longitude')
          .eq('club_id', clubId)
          .eq('status', 'scheduled')
          .gte('date_start', now.toISOString())
          .lte('date_start', fortyEightHoursLater);

        if (upcomingRunsForWeather) {
          for (const run of upcomingRunsForWeather) {
            const lat = run.start_latitude || 48.8566;
            const lon = run.start_longitude || 2.3522;
            const forecast = await getWeatherForecast(lat, lon, run.date_start);
            const lowerForecast = forecast.toLowerCase();
            
            if (lowerForecast.includes('pluie') || lowerForecast.includes('orage') || lowerForecast.includes('averse') || lowerForecast.includes('tempête')) {
              activeAlertsToUpsert.push({
                club_id: clubId,
                type: 'meteo_extreme',
                priority: 'HAUTE',
                payload: { run_id: run.id, run_title: run.title, condition: forecast },
                dedup_key: `meteo_extreme:${run.id}`,
                status: 'active'
              });
            }
          }
        }

        // --- DÉTECTION 6 : ADMIN (Cagnotte non configurée) ---
        if (!club.cagnotte_url) {
          activeAlertsToUpsert.push({
            club_id: clubId,
            type: 'cagnotte_inactive',
            priority: 'BASSE',
            payload: {},
            dedup_key: 'cagnotte_inactive:config',
            status: 'active'
          });
        }

        // --- DÉTECTION 7 : CÉLÉBRATION (Caps de runs collectifs complétés) ---
        const { count: completedRunsCount } = await supabase
          .from('runs')
          .select('*', { count: 'exact', head: true })
          .eq('club_id', clubId)
          .eq('status', 'completed');

        const totalRuns = completedRunsCount || 0;
        const milestones = [50, 100, 250, 500, 1000];
        
        for (const mile of milestones) {
          if (totalRuns === mile) {
            activeAlertsToUpsert.push({
              club_id: clubId,
              type: 'milestone_runs',
              priority: 'MOYENNE',
              payload: { milestone: mile },
              dedup_key: `milestone_runs:${mile}`,
              status: 'active'
            });
          }
        }

        // --- DÉTECTION 8 : CÉLÉBRATION (Record d'affluence battu) ---
        const { data: lastCompletedRun } = await supabase
          .from('runs')
          .select('id, title')
          .eq('club_id', clubId)
          .eq('status', 'completed')
          .order('date_start', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (lastCompletedRun) {
          const { count: lastAttendance } = await supabase
            .from('registrations')
            .select('*', { count: 'exact', head: true })
            .eq('run_id', lastCompletedRun.id)
            .eq('status', 'checked_in');

          const attendance = lastAttendance || 0;

          // Récupérer les runs passés différents de celui-ci
          const { data: otherPastRuns } = await supabase
            .from('runs')
            .select('id')
            .eq('club_id', clubId)
            .eq('status', 'completed')
            .neq('id', lastCompletedRun.id);

          if (otherPastRuns && otherPastRuns.length > 0) {
            // Trouver le max de présence sur les autres runs
            let maxPastAttendance = 0;
            for (const r of otherPastRuns) {
              const { count: c } = await supabase
                .from('registrations')
                .select('*', { count: 'exact', head: true })
                .eq('run_id', r.id)
                .eq('status', 'checked_in');
              if ((c || 0) > maxPastAttendance) maxPastAttendance = c || 0;
            }

            if (attendance > maxPastAttendance && attendance >= 5) {
              activeAlertsToUpsert.push({
                club_id: clubId,
                type: 'record_affluence',
                priority: 'MOYENNE',
                payload: { run_title: lastCompletedRun.title, count: attendance, previous_record: maxPastAttendance },
                dedup_key: `record_affluence:${lastCompletedRun.id}`,
                status: 'active'
              });
            }
          }
        }

        // 3. Écrire les alertes détectées dans la DB
        let addedCount = 0;
        for (const alert of activeAlertsToUpsert) {
          const { error: upsertErr } = await supabase
            .from('copilote_alertes')
            .upsert(alert, { onConflict: 'club_id, dedup_key, status' });
          
          if (!upsertErr) addedCount++;
        }

        // 4. Générer le briefing quotidien pour les membres payants CAPTEN
        let briefOutput = null;
        if (stripePlan === 'CAPTEN') {
          briefOutput = await getOrCreateDailyBrief(supabase, clubId, true);

          // 5. Gérer l'email Resend si configuré
          const branding = club.branding as any;
          const emailFreq = branding?.copilot_email_freq || 'quotidien';

          if (emailFreq === 'quotidien' && process.env.RESEND_API_KEY && briefOutput.count > 0) {
            const { data: userAuthData } = await supabase.auth.admin.getUserById(clubId);
            const email = userAuthData?.user?.email;

            if (email) {
              const resend = new Resend(process.env.RESEND_API_KEY);
              await resend.emails.send({
                from: 'Capten Copilot <copilot@capten.app>',
                to: email,
                subject: `🧑‍✈️ Ton Briefing Copilote : ${briefOutput.headline}`,
                html: `
                  <div style="font-family: 'DM Sans', sans-serif; color: #171717; max-width: 600px; margin: 0 auto; border: 1px solid #FF5C00; border-radius: 12px; padding: 24px;">
                    <div style="background-color: #FF5C00; color: white; padding: 12px 20px; border-radius: 8px; font-weight: bold; margin-bottom: 20px;">
                      🧑‍✈️ COPILOTE CAPTEN
                    </div>
                    <h2 style="font-style: italic; font-weight: 900; text-transform: uppercase;">${briefOutput.headline}</h2>
                    <div style="background-color: #FDFCF8; padding: 16px; border-left: 4px solid #FF5C00; margin: 20px 0; white-space: pre-wrap;">
                      ${briefOutput.body}
                    </div>
                    <p style="font-size: 13px; color: #737373;">
                      Tu reçois ce brief quotidien car tu es abonné au plan Capten. Tu peux modifier tes préférences de notification à tout moment dans tes Réglages.
                    </p>
                    <a href="https://capten.app/dashboard" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 12px; text-transform: uppercase; margin-top: 15px;">
                      Accéder à mon Crew
                    </a>
                  </div>
                `
              });
            }
          }
        }

        results.push({
          club_id: clubId,
          stripe_plan: stripePlan,
          alerts_detected: activeAlertsToUpsert.length,
          alerts_saved: addedCount,
          brief_generated: !!briefOutput
        });

      } catch (clubErr: any) {
        console.error(`Error processing club ${clubId}:`, clubErr);
        results.push({
          club_id: clubId,
          error: clubErr.message
        });
      }
    }

    return NextResponse.json({ success: true, processed: results });

  } catch (error: any) {
    console.error('[Cron Copilot Route Exception]:', error);
    // Si la DB n'a pas encore les tables copilote, on répond en fallback de réussite sans planter
    return NextResponse.json({ 
      success: false, 
      error: "Erreur durant la détection ou tables manquantes en base de données.",
      details: error.message 
    }, { status: 500 });
  }
}
