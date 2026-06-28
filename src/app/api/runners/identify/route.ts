import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, run_id, club_id } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Paramètres manquants (name, phone)." },
        { status: 400 }
      );
    }

    // Clean phone number (remove spaces, dots, dashes)
    const cleanPhone = phone.replace(/[\s\.\-\(\)]/g, '');

    const supabaseAdmin = getSupabaseAdmin();

    // Fallback if Supabase is offline / mock mode
    if (!supabaseAdmin) {
      console.log(`[API Mock] Identification du runner : ${name} (${cleanPhone})`);
      
      // Simulate database lookup by checking local data or generate a mock UUID
      const mockId = `mock-runner-${cleanPhone.substring(cleanPhone.length - 4)}`;
      
      return NextResponse.json({
        success: true,
        runner: {
          id: mockId,
          name: name,
          phone: cleanPhone,
          signed_waiver: cleanPhone.includes('612345678') || cleanPhone.includes('78901234'), // Mock signed waiver for standard test phones
          streak_count: 3,
          created_at: new Date().toISOString()
        }
      });
    }

    // Resolve club_id from run_id if not directly provided
    let resolvedClubId = club_id;
    if (!resolvedClubId && run_id) {
      const { data: runData, error: runError } = await supabaseAdmin
        .from('runs')
        .select('club_id')
        .eq('id', run_id)
        .maybeSingle();

      if (runError) {
        console.error("Error resolving club_id from run:", runError);
      } else if (runData) {
        resolvedClubId = runData.club_id;
      }
    }

    // 1. Search for existing runner by phone number AND club_id
    let query = supabaseAdmin
      .from('runners')
      .select('*')
      .eq('phone', cleanPhone);
      
    if (resolvedClubId) {
      query = query.eq('club_id', resolvedClubId);
    } else {
      query = query.is('club_id', null);
    }

    const { data: existingRunner, error: findError } = await query.maybeSingle();

    if (findError) {
      console.error("Error looking up runner:", findError);
      return NextResponse.json({ error: "Erreur lors de la recherche du profil." }, { status: 500 });
    }

    // 2. If runner exists, update their name (if changed) and return
    if (existingRunner) {
      if (existingRunner.name !== name) {
        const { data: updatedRunner, error: updateError } = await supabaseAdmin
          .from('runners')
          .update({ name })
          .eq('id', existingRunner.id)
          .select()
          .single();

        if (updateError) {
          console.error("Error updating runner name:", updateError);
          // Non-blocking: continue with existing profile even if update failed
          return NextResponse.json({ success: true, runner: existingRunner });
        }
        return NextResponse.json({ success: true, runner: updatedRunner });
      }
      return NextResponse.json({ success: true, runner: existingRunner });
    }

    // 3. Create a new runner profile scoped to the club
    const { data: newRunner, error: insertError } = await supabaseAdmin
      .from('runners')
      .insert({
        name,
        phone: cleanPhone,
        signed_waiver: false,
        club_id: resolvedClubId || null
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting runner:", insertError);
      return NextResponse.json({ error: "Erreur lors de la création du profil." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      runner: newRunner
    });

  } catch (error: any) {
    console.error("Error in identify API route:", error);
    return NextResponse.json(
      { error: error.message || "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}
