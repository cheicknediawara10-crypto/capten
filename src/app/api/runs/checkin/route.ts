import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { isRunnerBanned } from '@/lib/mock-ban-store';

// Earth radius in meters
const EARTH_RADIUS_METERS = 6371000;
// Max allowed check-in distance (increased from 50m to 100m to handle mobile GPS inaccuracy)
const DISTANCE_THRESHOLD = 100;

// Haversine formula to compute distance between two coordinates
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const radLat1 = toRadians(lat1);
  const radLat2 = toRadians(lat2);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(radLat1) * Math.cos(radLat2) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
            
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return EARTH_RADIUS_METERS * c;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { run_id, latitude_user, longitude_user, runner_id, athlete_id } = body;

    // Support both runner_id and legacy athlete_id keys
    const targetRunnerId = runner_id || athlete_id;

    if (!run_id || !latitude_user || !longitude_user || !targetRunnerId) {
      return NextResponse.json(
        { error: "Paramètres manquants (run_id, latitude_user, longitude_user, runner_id)." },
        { status: 400 }
      );
    }

    // Blacklist check for offline mode
    if (isRunnerBanned("", targetRunnerId)) {
      return NextResponse.json(
        { error: "Votre compte a été suspendu par le Capitaine du club pour manquement au règlement." },
        { status: 403 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    
    // Offline/Demo fallback mode
    if (!supabaseAdmin) {
      console.log(`[API Mock] Check-in GPS pour run ${run_id}, runner ${targetRunnerId}.`);
      return NextResponse.json({
        success: true,
        message: "Pointage simulé avec succès (Supabase inactif).",
        distance: 14.2,
        streak_updated: true
      });
    }

    // Blacklist check for online mode
    const { data: runnerProfile, error: runnerError } = await supabaseAdmin
      .from('runners')
      .select('is_blacklisted')
      .eq('id', targetRunnerId)
      .maybeSingle();

    if (runnerProfile?.is_blacklisted) {
      return NextResponse.json(
        { error: "Votre compte a été suspendu par le Capitaine du club pour manquement au règlement." },
        { status: 403 }
      );
    }

    // 1. Fetch run starting coordinates and timing details
    const { data: run, error: runError } = await supabaseAdmin
      .from('runs')
      .select('date_start, start_latitude, start_longitude')
      .eq('id', run_id)
      .single();

    if (runError || !run) {
      return NextResponse.json({ error: "Run introuvable." }, { status: 404 });
    }

    if (!run.start_latitude || !run.start_longitude) {
      return NextResponse.json(
        { error: "Le point de départ officiel de ce run n'a pas été configuré en coordonnées GPS." }, 
        { status: 400 }
      );
    }

    // 2. Temporal Window Check (15m before -> 3h after)
    const now = new Date();
    const runDate = new Date(run.date_start);
    
    const windowStart = new Date(runDate.getTime() - 15 * 60 * 1000);
    const windowEnd = new Date(runDate.getTime() + 3 * 60 * 60 * 1000);

    if (now < windowStart || now > windowEnd) {
      return NextResponse.json(
        { error: "Le check-in n'est autorisé qu'entre 15 minutes avant le départ et 3 heures après." },
        { status: 403 }
      );
    }

    // 3. Compute distance (Haversine)
    const distance = calculateHaversineDistance(
      run.start_latitude,
      run.start_longitude,
      latitude_user,
      longitude_user
    );

    // 4. Geofencing check (50 meters)
    if (distance > DISTANCE_THRESHOLD) {
      return NextResponse.json(
        { 
          error: `Vous êtes trop loin du point de départ (Distance actuelle : ${Math.round(distance)} mètres). Rapprochez-vous du point de rassemblement.`,
          distance: Math.round(distance)
        },
        { status: 403 }
      );
    }

    // 5. Check if they have already checked in to avoid duplicating streak
    const { data: existingReg } = await supabaseAdmin
      .from('registrations')
      .select('status')
      .eq('run_id', run_id)
      .eq('runner_id', targetRunnerId)
      .maybeSingle();

    const alreadyCheckedIn = existingReg?.status === 'checked_in';

    // 6. Record presence in registrations table
    const { error: regError } = await supabaseAdmin
      .from('registrations')
      .upsert({
        run_id,
        runner_id: targetRunnerId,
        status: 'checked_in',
        checked_in_at: now.toISOString(),
        verified_latitude: latitude_user,
        verified_longitude: longitude_user
      }, { onConflict: 'run_id,runner_id' });

    if (regError) {
      console.error("Error creating registration:", regError);
      return NextResponse.json({ error: "Erreur lors de la validation de présence." }, { status: 500 });
    }

    // 7. Increment streak count if this is their first checkin for this run
    if (!alreadyCheckedIn) {
      const { data: currentProfile } = await supabaseAdmin
        .from('runners')
        .select('streak_count')
        .eq('id', targetRunnerId)
        .maybeSingle();

      if (currentProfile) {
        await supabaseAdmin
          .from('runners')
          .update({ streak_count: (currentProfile.streak_count || 0) + 1 })
          .eq('id', targetRunnerId);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Présence validée avec succès ! Streak incrémentée.",
      distance: Math.round(distance),
    });

  } catch (error: any) {
    console.error("Error in GPS check-in:", error);
    return NextResponse.json(
      { error: error.message || "Erreur interne du serveur lors de la validation." },
      { status: 500 }
    );
  }
}
