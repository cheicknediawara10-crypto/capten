import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { run_id } = body;

    if (!run_id) {
      return NextResponse.json(
        { error: "Paramètre 'run_id' manquant." },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('broadcast_queue')
        .update({ status: 'cancelled' })
        .eq('run_id', run_id)
        .eq('status', 'hold')
        .select();

      if (error) {
        throw error;
      }

      return NextResponse.json({
        success: true,
        message: `Diffusion du run ${run_id} annulée en base de données.`,
        data
      });
    } else {
      console.log(`Supabase non configuré. Annulation en mémoire locale pour le run ${run_id}.`);
      return NextResponse.json({
        success: true,
        message: `Annulation simulée du run ${run_id} (Supabase inactif).`
      });
    }
  } catch (error: any) {
    console.error("Error cancelling broadcast:", error);
    return NextResponse.json(
      { error: error.message || "Erreur interne du serveur lors de l'annulation." },
      { status: 500 }
    );
  }
}
