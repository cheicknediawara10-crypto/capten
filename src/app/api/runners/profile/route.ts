import { NextResponse } from 'next/server';
import { RunnerRepository } from '@/lib/db';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

async function getAuthenticatedCaptainId(): Promise<string | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('votre-projet')) {
    return 'mock-captain-uuid';
  }

  try {
    const cookieStore = cookies();
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        }
      }
    });
    const { data: { user } } = await supabase.auth.getUser();
    return user ? user.id : null;
  } catch (err) {
    console.error("Authentication error in profile API:", err);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "ID du runner manquant." }, { status: 400 });
    }

    const runner = await RunnerRepository.getById(id);

    if (!runner) {
      return NextResponse.json({ error: "Profil introuvable." }, { status: 404 });
    }

    // Authenticate the captain
    const captainId = await getAuthenticatedCaptainId();
    
    // Check if the caller is the captain of this runner's club
    const isAuthorizedCaptain = captainId && (runner as any).club_id === captainId;

    if (isAuthorizedCaptain) {
      // Call RPC function to retrieve the decrypted medical data
      const { getSupabaseAdmin } = await import('@/lib/supabase');
      const supabaseAdmin = getSupabaseAdmin();
      if (supabaseAdmin) {
        const { data: medicalData, error: medicalError } = await supabaseAdmin
          .rpc('fiche_urgence_get', { p_runner_id: id });
        
        if (!medicalError && medicalData && medicalData.length > 0) {
          const med = medicalData[0];
          // Merge decrypted medical fields into runner profile object
          Object.assign(runner, {
            emergency_name: med.emergency_name,
            emergency_phone: med.emergency_phone,
            emergency_relation: med.emergency_relation,
            birth_date: med.birth_date,
            blood_type: med.blood_type,
            allergies: med.allergies,
            health_issues: med.health_issues,
            address: med.address,
            insurance: med.insurance
          });
        } else if (medicalError) {
          console.error("Error fetching encrypted medical data via RPC:", medicalError);
        }
      }

      // Return full profile including sensitive medical info
      return NextResponse.json({
        success: true,
        runner
      });
    }

    // Non-authorized: return a reduced profile with redacted sensitive fields
    const {
      emergency_name,
      emergency_phone,
      emergency_relation,
      birth_date,
      blood_type,
      allergies,
      health_issues,
      insurance,
      address,
      ...filteredRunner
    } = runner as any;

    return NextResponse.json({
      success: true,
      runner: filteredRunner
    });

  } catch (error: any) {
    console.error("Error in GET /api/runners/profile:", error);
    return NextResponse.json({ error: error.message || "Erreur interne du serveur." }, { status: 500 });
  }
}
