import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// 1. Search & Retrieve GDPR Profile
export async function POST(request: Request) {
  try {
    const { name, phone } = await request.json();

    if (!name || !phone) {
      return NextResponse.json({ error: "Nom et téléphone requis." }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({
        success: true,
        runner: {
          id: "mock-runner-uuid",
          name: name,
          phone: phone,
          signed_waiver: true,
          accept_health: true,
          accept_photo: true
        }
      });
    }

    const { data: runner, error } = await supabaseAdmin
      .from('runners')
      .select('*')
      .eq('phone', phone.trim())
      .ilike('name', `%${name.trim()}%`)
      .maybeSingle();

    if (error || !runner) {
      return NextResponse.json({ error: "Aucun profil trouvé avec ces informations." }, { status: 404 });
    }

    // Check if they have health details stored
    const { data: healthData } = await supabaseAdmin
      .from('fiches_urgence')
      .select('id')
      .eq('runner_id', runner.id)
      .maybeSingle();

    // Check for photo/marketing consent in consentements table
    const { data: photoConsent } = await supabaseAdmin
      .from('consentements')
      .select('accorde')
      .eq('coureur_id', runner.id)
      .eq('finalite', 'photo_consent')
      .maybeSingle();

    return NextResponse.json({
      success: true,
      runner: {
        id: runner.id,
        name: runner.name,
        phone: runner.phone,
        signed_waiver: runner.signed_waiver,
        accept_health: !!healthData,
        accept_photo: photoConsent ? photoConsent.accorde : false
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. Update/Withdraw Consent
export async function PATCH(request: Request) {
  try {
    const { runner_id, accept_health, accept_photo } = await request.json();

    if (!runner_id) {
      return NextResponse.json({ error: "ID de runner requis." }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ success: true, message: "Mise à jour simulée (Mode Démo)." });
    }

    // Fetch club_id from runner profile to associate the log with the correct club
    const { data: runnerDetails } = await supabaseAdmin
      .from('runners')
      .select('club_id')
      .eq('id', runner_id)
      .maybeSingle();

    // Log the consent update action in audit logs
    await supabaseAdmin.from('audit_logs').insert({
      actor_id: runner_id,
      actor_type: 'runner',
      action: 'update_consent',
      resource_type: 'runner_consent',
      resource_id: runner_id,
      club_id: runnerDetails?.club_id,
      metadata: { accept_health, accept_photo }
    });

    // If health consent is withdrawn, delete the encrypted health card immediately
    if (accept_health === false) {
      const { error: deleteHealthErr } = await supabaseAdmin
        .from('fiches_urgence')
        .delete()
        .eq('runner_id', runner_id);
      
      if (deleteHealthErr) {
        console.error("Error deleting fiches_urgence upon consent withdrawal:", deleteHealthErr);
      }
    }

    // Upsert photo consent record
    const { error: consentErr } = await supabaseAdmin
      .from('consentements')
      .upsert({
        coureur_id: runner_id,
        finalite: 'photo_consent',
        accorde: !!accept_photo,
        version_politique: '1.5',
        recueilli_at: new Date().toISOString(),
        retire_at: accept_photo ? null : new Date().toISOString()
      }, { onConflict: 'coureur_id,finalite' });

    if (consentErr) {
      console.error("Error saving consentements record:", consentErr);
    }

    return NextResponse.json({
      success: true,
      message: "Consentements mis à jour avec succès."
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 3. Right to be Forgotten (Delete Profile & All Associated Data)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const runner_id = searchParams.get('id');

    if (!runner_id) {
      return NextResponse.json({ error: "ID de runner requis." }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ success: true, message: "Suppression totale simulée (Mode Démo)." });
    }

    // Fetch details before deleting
    const { data: runnerDetails } = await supabaseAdmin
      .from('runners')
      .select('name, phone, club_id')
      .eq('id', runner_id)
      .maybeSingle();

    // Log the profile deletion action in audit logs
    await supabaseAdmin.from('audit_logs').insert({
      actor_id: runner_id,
      actor_type: 'runner',
      action: 'delete_profile',
      resource_type: 'runner',
      resource_id: runner_id,
      club_id: runnerDetails?.club_id,
      metadata: { name: runnerDetails?.name, phone: runnerDetails?.phone }
    });

    // Delete runner profile (cascades to registrations, fiches_urgence, and consentements)
    const { error } = await supabaseAdmin
      .from('runners')
      .delete()
      .eq('id', runner_id);

    if (error) {
      console.error("Error deleting runner profile:", error);
      return NextResponse.json({ error: "Erreur lors de la suppression de vos données." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Toutes vos données personnelles ont été définitivement supprimées."
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
