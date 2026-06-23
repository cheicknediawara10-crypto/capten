import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      runner_id, 
      token,
      emergency_name,
      emergency_phone,
      emergency_relation,
      birth_date,
      blood_type,
      allergies,
      health_issues,
      insurance,
      address
    } = body;

    if (!runner_id || !token) {
      return NextResponse.json({ error: "Paramètres manquants (runner_id, token)." }, { status: 400 });
    }

    // Get dynamic IP address from headers
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               '127.0.0.1';

    const supabaseAdmin = getSupabaseAdmin();

    // Offline / mock fallback mode
    if (!supabaseAdmin) {
      console.log(`[API Mock] Signature de la décharge pour runner ID ${runner_id} (IP: ${ip}, Token: ${token})`);
      console.log(`ICE Contact: ${emergency_name} (${emergency_phone}, ${emergency_relation})`);
      console.log(`Health: Birth ${birth_date}, Blood ${blood_type}, Allergies ${allergies}, Issues ${health_issues}, Insurance ${insurance}, Address ${address}`);
      return NextResponse.json({
        success: true,
        message: "Signature enregistrée avec succès (Mode Démo).",
        ip,
        date: new Date().toISOString()
      });
    }

    // Supabase Online query (using admin client to bypass RLS)
    const { data: updatedRunner, error } = await supabaseAdmin
      .from('runners')
      .update({
        signed_waiver: true,
        waiver_date: new Date().toISOString(),
        waiver_ip: ip,
        waiver_token: token,
        emergency_name,
        emergency_phone,
        emergency_relation,
        birth_date,
        blood_type,
        allergies,
        health_issues,
        insurance,
        address
      })
      .eq('id', runner_id)
      .select()
      .single();

    if (error) {
      console.error("Error updating waiver in Supabase:", error);
      return NextResponse.json({ error: "Erreur lors de l'enregistrement de la décharge." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Décharge légale signée avec succès.",
      runner: updatedRunner
    });

  } catch (error: any) {
    console.error("Error in POST /api/waiver/sign:", error);
    return NextResponse.json({ error: error.message || "Erreur interne du serveur." }, { status: 500 });
  }
}
