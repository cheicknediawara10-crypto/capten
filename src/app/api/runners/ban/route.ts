import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { banRunner, unbanRunner } from '@/lib/mock-ban-store';

export const dynamic = 'force-dynamic';

// Helper to authenticate the Captain and return their user/club ID
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
    console.error("Authentication error in runners ban API:", err);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { runner_id, runner_phone, runner_name, is_blacklisted } = body;

    const actionBan = is_blacklisted ?? true; // Default to true if not specified

    const supabaseAdmin = getSupabaseAdmin();

    // Offline / mock fallback mode
    if (!supabaseAdmin) {
      const identifier = runner_id || runner_phone || runner_name || '';
      if (actionBan) {
        banRunner(identifier);
        console.log(`[API Mock] Runner banni : ${identifier}`);
      } else {
        unbanRunner(identifier);
        console.log(`[API Mock] Runner gracié/unbanni : ${identifier}`);
      }

      return NextResponse.json({
        success: true,
        message: actionBan 
          ? "Runner suspendu avec succès (Mode Démo)." 
          : "Suspension levée avec succès (Mode Démo)."
      });
    }

    // Authenticate Captain session
    const captainId = await getAuthenticatedCaptainId();
    if (!captainId) {
      return NextResponse.json({ error: "Accès refusé. Non authentifié." }, { status: 401 });
    }

    // Supabase Online mode using supabaseAdmin
    let query = supabaseAdmin.from('runners').update({
      is_blacklisted: actionBan,
      blacklisted_until: actionBan ? new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString() : null // 1 year ban by default
    }).eq('club_id', captainId); // RESTRICT to captain's own club!

    if (runner_id) {
      query = query.eq('id', runner_id);
    } else if (runner_phone) {
      const cleanPhone = runner_phone.replace(/[\s\.\-\(\)]/g, '');
      query = query.eq('phone', cleanPhone);
    } else if (runner_name) {
      query = query.eq('name', runner_name);
    } else {
      return NextResponse.json({ error: "Aucun identifiant de runner fourni (runner_id, runner_phone ou runner_name)." }, { status: 400 });
    }

    const { data, error } = await query.select();

    if (error) {
      console.error("Error toggling blacklist status in Supabase:", error);
      return NextResponse.json({ error: "Erreur lors de la mise à jour du statut du runner." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: actionBan ? "Le runner a été suspendu et banni du club." : "La suspension du runner a été levée.",
      runners: data
    });

  } catch (error: any) {
    console.error("Error in POST /api/runners/ban:", error);
    return NextResponse.json({ error: error.message || "Erreur interne du serveur." }, { status: 500 });
  }
}
