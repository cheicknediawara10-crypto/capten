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
        // Nullify plaintext medical columns for safety
        emergency_name: null,
        emergency_phone: null,
        emergency_relation: null,
        birth_date: null,
        blood_type: null,
        allergies: null,
        health_issues: null,
        insurance: null,
        address: null
      })
      .eq('id', runner_id)
      .select()
      .single();

    if (error) {
      console.error("Error updating waiver in Supabase:", error);
      return NextResponse.json({ error: "Erreur lors de l'enregistrement de la décharge." }, { status: 500 });
    }

    // Call RPC function to store medical data securely in the encrypted fiches_urgence table
    const clubId = updatedRunner.club_id || 'mock-captain-uuid'; // Fallback just in case
    const { error: rpcError } = await supabaseAdmin.rpc('fiche_urgence_set', {
      p_runner_id: runner_id,
      p_club_id: clubId,
      p_blood_type: blood_type || '',
      p_allergies: allergies || '',
      p_health_issues: health_issues || '',
      p_emergency_name: emergency_name || '',
      p_emergency_phone: emergency_phone || '',
      p_emergency_relation: emergency_relation || '',
      p_address: address || '',
      p_birth_date: birth_date || '',
      p_insurance: insurance || ''
    });

    if (rpcError) {
      console.error("Error calling fiche_urgence_set RPC:", rpcError);
      // We log but don't break the response since the waiver signature status itself succeeded
    }

    // Record GDPR consent details in consentements table
    try {
      const userAgent = request.headers.get('user-agent') || 'Unknown';
      
      // 1. Record Terms/Waiver consent
      await supabaseAdmin.from('consentements').upsert({
        coureur_id: runner_id,
        finalite: 'waiver_terms',
        accorde: true,
        version_politique: '1.5',
        ip_address: ip,
        user_agent: userAgent,
        recueilli_at: new Date().toISOString()
      }, { onConflict: 'coureur_id,finalite' });

      // 2. Record Photo & Comm consent
      await supabaseAdmin.from('consentements').upsert({
        coureur_id: runner_id,
        finalite: 'photo_consent',
        accorde: !!body.accept_photo,
        version_politique: '1.5',
        ip_address: ip,
        user_agent: userAgent,
        recueilli_at: new Date().toISOString(),
        retire_at: body.accept_photo ? null : new Date().toISOString()
      }, { onConflict: 'coureur_id,finalite' });
    } catch (consentErr) {
      console.error("Failed recording GDPR consent logs:", consentErr);
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
