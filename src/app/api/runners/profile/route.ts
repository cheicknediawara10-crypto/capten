import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "ID du runner manquant." }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Offline / mock fallback mode
    if (!supabaseAdmin) {
      console.log(`[API Mock] Récupération profil runner via ID : ${id}`);
      return NextResponse.json({
        success: true,
        runner: {
          id: id,
          name: "Julien Rochedieu",
          phone: "0612345678",
          signed_waiver: id.includes('signed') || id.length > 20, // simulate signed for specific ids
          streak_count: 5,
          created_at: new Date().toISOString(),
          emergency_name: "Valérie Rochedieu",
          emergency_phone: "0687654321",
          emergency_relation: "Conjoint",
          birth_date: "1990-05-15",
          blood_type: "O+",
          allergies: "Aucune",
          health_issues: "Aucun",
          insurance: "AXA",
          address: "15 Rue de la Paix, Paris"
        }
      });
    }

    // Supabase Online query (using admin client to bypass RLS)
    const { data: runner, error } = await supabaseAdmin
      .from('runners')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching runner profile:", error);
      return NextResponse.json({ error: "Erreur lors de la récupération du profil." }, { status: 500 });
    }

    if (!runner) {
      return NextResponse.json({ error: "Profil introuvable." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      runner
    });

  } catch (error: any) {
    console.error("Error in GET /api/runners/profile:", error);
    return NextResponse.json({ error: error.message || "Erreur interne du serveur." }, { status: 500 });
  }
}
