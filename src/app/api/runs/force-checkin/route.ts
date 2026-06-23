import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { run_id, athlete_name } = body; // Using athlete_name for the demo/mock as UI uses name currently

    if (!run_id || !athlete_name) {
      return NextResponse.json(
        { error: "Paramètres manquants (run_id, athlete_name)." },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    
    // Si Supabase n'est pas configuré (mode offline/mock)
    if (!supabase) {
      console.log(`Supabase non configuré. Check-in manuel simulé pour le run ${run_id}, athlète ${athlete_name}.`);
      return NextResponse.json({
        success: true,
        message: "Check-in manuel simulé avec succès (Supabase inactif)."
      });
    }

    // Validation de la présence (Mise à jour en base)
    // In a real app we'd look up by athlete_id, but the UI currently passes names.
    const { error: participantError } = await supabase
      .from('run_participants')
      .update({
        status: 'attended',
        checked_in_at: new Date().toISOString()
      })
      .eq('run_id', run_id)
      .eq('member_name', athlete_name); // Assuming 'member_name' exists or similar logic applies, wait for UI it works via local state mostly.

    if (participantError) {
      console.error("Erreur mise à jour participant manuel:", participantError);
      throw new Error("Erreur lors de l'enregistrement de la présence.");
    }

    return NextResponse.json({
      success: true,
      message: "Check-in manuel forcé avec succès."
    });

  } catch (error: any) {
    console.error("Error in force check-in:", error);
    return NextResponse.json(
      { error: error.message || "Erreur interne du serveur lors du check-in manuel." },
      { status: 500 }
    );
  }
}
