import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { rateLimit } from '@/lib/rate-limit';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// 1. GET: Resolve Run Details for the Confirmation Form
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shortCode = searchParams.get('short_code');

    if (!shortCode) {
      return NextResponse.json({ error: "Code unique de séance manquant." }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      // Mock / Demo mode fallback
      return NextResponse.json({
        success: true,
        run: {
          id: "demo-run-id",
          title: "Speed Session (Demo)",
          run_date: new Date().toISOString(),
          status: "completed",
          club_name: "Paris Run Club",
          check_retour_total: 4
        }
      });
    }

    // Fetch the run and club info
    const { data: run, error: runError } = await supabaseAdmin
      .from('runs')
      .select('*, clubs(whatsapp_display_name)')
      .eq('short_code', shortCode)
      .maybeSingle();

    if (runError || !run) {
      return NextResponse.json({ error: "Ce lien n'est plus valide." }, { status: 404 });
    }

    if (run.status === 'cancelled') {
      return NextResponse.json({ error: "Ce run a été annulé." }, { status: 400 });
    }

    // Check validity window: scheduled_at to +14h (estimated end of 2h + 12h tolerance)
    const startTime = new Date(run.scheduled_at).getTime();
    const estimatedEndTime = startTime + 2 * 60 * 60 * 1000;
    const validityEndTime = estimatedEndTime + 12 * 60 * 60 * 1000;
    const now = Date.now();

    if (now > validityEndTime) {
      return NextResponse.json({ error: "Ce check retour est expiré." }, { status: 410 });
    }

    // Get current total confirmations
    const { count } = await supabaseAdmin
      .from('check_retour')
      .select('*', { count: 'exact', head: true })
      .eq('run_id', run.id);

    return NextResponse.json({
      success: true,
      run: {
        id: run.id,
        title: run.title,
        run_date: run.scheduled_at,
        status: run.status,
        club_name: (run.clubs as any)?.whatsapp_display_name || "CAPTEN CREW",
        check_retour_total: count || 0
      }
    });

  } catch (err: any) {
    console.error("Error in GET /api/check-retour/confirm:", err);
    return NextResponse.json({ error: err.message || "Erreur interne." }, { status: 500 });
  }
}

// 2. POST: Process Confirmation
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { short_code, prenom, nom, date_naissance } = body || {};

    if (!short_code || !prenom || !nom || !date_naissance) {
      return NextResponse.json({ error: "Tous les champs sont requis." }, { status: 400 });
    }

    // Get IP for rate-limiting
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

    // Rate Limiting (Upstash / Memory fallback)
    // 5 attempts per IP per hour
    const ipLimit = await rateLimit(`checkretour:ip:${ip}`, 5, 3600);
    if (!ipLimit.success) {
      return NextResponse.json({ error: "Trop de tentatives. Réessaie dans une heure.", status: "rate_limited" }, { status: 429 });
    }

    // 30 attempts per short_code per hour
    const runLimit = await rateLimit(`checkretour:run:${short_code}`, 30, 3600);
    if (!runLimit.success) {
      return NextResponse.json({ error: "Trop de tentatives pour ce run. Réessaie dans une heure.", status: "rate_limited" }, { status: 429 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      // Mock mode verification logic
      if (prenom.toLowerCase() === "error") {
        return NextResponse.json({ status: "not_found" });
      }
      if (prenom.toLowerCase() === "double") {
        return NextResponse.json({ status: "ambiguous" });
      }
      if (prenom.toLowerCase() === "already") {
        return NextResponse.json({ status: "already", prenom });
      }
      return NextResponse.json({
        status: "confirmed",
        prenom,
        total: 5
      });
    }

    // Resolve run
    const { data: run, error: runError } = await supabaseAdmin
      .from('runs')
      .select('*')
      .eq('short_code', short_code)
      .maybeSingle();

    if (runError || !run) {
      return NextResponse.json({ error: "Ce lien n'est plus valide.", status: "expired" }, { status: 404 });
    }

    if (run.status === 'cancelled') {
      return NextResponse.json({ error: "Ce run a été annulé.", status: "expired" }, { status: 400 });
    }

    // Check validity window
    const startTime = new Date(run.scheduled_at).getTime();
    const estimatedEndTime = startTime + 2 * 60 * 60 * 1000;
    const validityEndTime = estimatedEndTime + 12 * 60 * 60 * 1000;
    const now = Date.now();

    if (now > validityEndTime) {
      return NextResponse.json({ error: "Ce check retour est expiré.", status: "expired" }, { status: 410 });
    }

    // Normalization helper
    const normalize = (str: string) => {
      return str
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""); // Strip accents/diacritics
    };

    const normPrenom = normalize(prenom);
    const normNom = normalize(nom);
    const targetFullName = `${normPrenom} ${normNom}`;
    const normBirthDate = date_naissance; // YYYY-MM-DD

    // Fetch registered runners for this run
    const { data: registrations, error: regError } = await supabaseAdmin
      .from('registrations')
      .select('runner_id, runners!inner(id, name, birth_date)')
      .eq('run_id', run.id)
      .neq('status', 'cancelled')
      .neq('status', 'waitlisted');

    if (regError || !registrations) {
      console.error("Error fetching registrations:", regError);
      return NextResponse.json({ error: "Erreur base de données lors de la recherche du coureur." }, { status: 500 });
    }

    // Filter to find matching runners
    const matches = registrations.filter(r => {
      const runner = (r as any).runners;
      if (!runner) return false;
      
      const normDbName = normalize(runner.name);
      
      // Exact match or split check
      const nameMatches = (normDbName === targetFullName);
      
      // Date of birth format check (handle possible date timezone offsets)
      let birthMatches = false;
      if (runner.birth_date) {
        const dbBirth = runner.birth_date.split('T')[0];
        birthMatches = (dbBirth === normBirthDate);
      }

      return nameMatches && birthMatches;
    });

    if (matches.length === 0) {
      return NextResponse.json({ status: "not_found" });
    }

    if (matches.length > 1) {
      return NextResponse.json({ status: "ambiguous" });
    }

    const matchedRunner = (matches[0] as any).runners;

    // Check if already confirmed
    const { data: existingCheck } = await supabaseAdmin
      .from('check_retour')
      .select('id')
      .eq('run_id', run.id)
      .eq('coureur_id', matchedRunner.id)
      .maybeSingle();

    if (existingCheck) {
      return NextResponse.json({
        status: "already",
        prenom: matchedRunner.name.split(' ')[0]
      });
    }

    // Hash IP address
    const ipHash = crypto.createHash('sha256').update(ip).digest('hex');

    // Insert confirmation
    const { error: insertError } = await supabaseAdmin
      .from('check_retour')
      .insert({
        run_id: run.id,
        coureur_id: matchedRunner.id,
        crew_id: run.club_id,
        manual: false,
        ip_hash: ipHash
      });

    if (insertError) {
      console.error("Error inserting check_retour:", insertError);
      return NextResponse.json({ error: "Erreur lors de l'enregistrement de votre confirmation." }, { status: 500 });
    }

    // Get updated total
    const { count: totalCount } = await supabaseAdmin
      .from('check_retour')
      .select('*', { count: 'exact', head: true })
      .eq('run_id', run.id);

    return NextResponse.json({
      status: "confirmed",
      prenom: matchedRunner.name.split(' ')[0],
      total: totalCount || 0
    });

  } catch (err: any) {
    console.error("Error in POST /api/check-retour/confirm:", err);
    return NextResponse.json({ error: err.message || "Erreur interne du serveur." }, { status: 500 });
  }
}
