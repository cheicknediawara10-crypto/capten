import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

// In-memory mock database for local development / Supabase offline mode
let mockIncidents: any[] = [];

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
    console.error("Authentication error in incidents API:", err);
    return null;
  }
}

// POST - Public anonymous/named report submission
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { run_id, club_id, type, priority, anonymous, reporter_name, reporter_phone, involved, details } = body;

    if (!details) {
      return NextResponse.json({ error: "Les détails du signalement sont obligatoires." }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Offline / mock fallback mode
    if (!supabaseAdmin) {
      const newIncident = {
        id: `T-${Math.floor(100 + Math.random() * 900)}`,
        created_at: new Date().toISOString(),
        run_id: run_id || null,
        club_id: club_id || 'mock-captain-uuid',
        type: type || 'Comportement Toxique',
        priority: priority || 'MOYENNE',
        status: 'NOUVEAU',
        anonymous: anonymous ?? true,
        reporter_name: anonymous ? null : reporter_name || null,
        reporter_phone: anonymous ? null : reporter_phone || null,
        involved: involved || null,
        details
      };
      
      mockIncidents = [newIncident, ...mockIncidents];
      console.log(`[API Mock] Nouveau signalement enregistré :`, newIncident);
      return NextResponse.json({ success: true, incident: newIncident });
    }

    // Retreive the club_id linked to the run if run_id is provided
    let resolvedClubId = club_id || null;
    if (run_id) {
      const { data: runData, error: runError } = await supabaseAdmin
        .from('runs')
        .select('club_id')
        .eq('id', run_id)
        .maybeSingle();
      
      if (!runError && runData?.club_id) {
        resolvedClubId = runData.club_id;
      }
    }

    // Supabase Online mode using supabaseAdmin to bypass RLS for public insertions
    const { data: newIncident, error } = await supabaseAdmin
      .from('incidents')
      .insert({
        run_id: run_id || null,
        club_id: resolvedClubId,
        type: type || 'Comportement Toxique',
        priority: priority || 'MOYENNE',
        anonymous: anonymous ?? true,
        reporter_name: anonymous ? null : reporter_name || null,
        reporter_phone: anonymous ? null : reporter_phone || null,
        involved: involved || null,
        details,
        status: 'NOUVEAU'
      })
      .select()
      .single();

    if (error) {
      console.error("Error inserting incident in Supabase:", error);
      return NextResponse.json({ error: "Erreur lors de l'enregistrement du signalement." }, { status: 500 });
    }

    return NextResponse.json({ success: true, incident: newIncident });

  } catch (error: any) {
    console.error("Error in POST /api/incidents:", error);
    return NextResponse.json({ error: error.message || "Erreur interne du serveur." }, { status: 500 });
  }
}

// GET - Fetch all incidents (Captain-only, restricted to their club_id)
export async function GET(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    // Offline / mock fallback mode
    if (!supabaseAdmin) {
      return NextResponse.json({ success: true, incidents: mockIncidents });
    }

    // Authenticate Captain
    const captainId = await getAuthenticatedCaptainId();
    if (!captainId) {
      return NextResponse.json({ error: "Accès refusé. Non authentifié." }, { status: 401 });
    }

    // Fetch from Supabase using supabaseAdmin filtered by club_id = captainId
    const { data: incidents, error } = await supabaseAdmin
      .from('incidents')
      .select('*')
      .eq('club_id', captainId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching incidents from Supabase:", error);
      return NextResponse.json({ error: "Erreur lors de la récupération des incidents." }, { status: 500 });
    }

    return NextResponse.json({ success: true, incidents });

  } catch (error: any) {
    console.error("Error in GET /api/incidents:", error);
    return NextResponse.json({ error: error.message || "Erreur interne du serveur." }, { status: 500 });
  }
}

// PATCH - Update incident status (Captain-only, restricted to their club_id)
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: "ID de l'incident manquant." }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "Statut manquant." }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Offline / mock fallback mode
    if (!supabaseAdmin) {
      mockIncidents = mockIncidents.map(inc => 
        inc.id === id ? { ...inc, status } : inc
      );
      const updated = mockIncidents.find(inc => inc.id === id);
      return NextResponse.json({ success: true, incident: updated });
    }

    // Authenticate Captain
    const captainId = await getAuthenticatedCaptainId();
    if (!captainId) {
      return NextResponse.json({ error: "Accès refusé. Non authentifié." }, { status: 401 });
    }

    // Supabase Online mode using supabaseAdmin restricted to club_id = captainId
    const { data: updatedIncident, error } = await supabaseAdmin
      .from('incidents')
      .update({ status })
      .eq('id', id)
      .eq('club_id', captainId)
      .select()
      .single();

    if (error) {
      console.error("Error updating incident in Supabase:", error);
      return NextResponse.json({ error: "Erreur lors de la mise à jour du signalement." }, { status: 500 });
    }

    return NextResponse.json({ success: true, incident: updatedIncident });

  } catch (error: any) {
    console.error("Error in PATCH /api/incidents:", error);
    return NextResponse.json({ error: error.message || "Erreur interne du serveur." }, { status: 500 });
  }
}

// DELETE - Remove an incident ticket (Captain-only, restricted to their club_id)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "ID de l'incident manquant." }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Offline / mock fallback mode
    if (!supabaseAdmin) {
      mockIncidents = mockIncidents.filter(inc => inc.id !== id);
      return NextResponse.json({ success: true, message: "Ticket supprimé localement." });
    }

    // Authenticate Captain
    const captainId = await getAuthenticatedCaptainId();
    if (!captainId) {
      return NextResponse.json({ error: "Accès refusé. Non authentifié." }, { status: 401 });
    }

    // Supabase Online mode using supabaseAdmin restricted to club_id = captainId
    const { error } = await supabaseAdmin
      .from('incidents')
      .delete()
      .eq('id', id)
      .eq('club_id', captainId);

    if (error) {
      console.error("Error deleting incident in Supabase:", error);
      return NextResponse.json({ error: "Erreur lors de la suppression du signalement." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Ticket supprimé avec succès." });

  } catch (error: any) {
    console.error("Error in DELETE /api/incidents:", error);
    return NextResponse.json({ error: error.message || "Erreur interne du serveur." }, { status: 500 });
  }
}
