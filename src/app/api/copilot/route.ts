import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabase, getSupabaseAdmin } from '@/lib/supabase';
import { getOrCreateDailyBrief, queryCopilotChat } from '@/lib/ai/copilote';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = getSupabaseAdmin() || getSupabase();
    let clubId = 'demo-club';

    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        clubId = user.id;
      }
    }

    // Gating check
    let plan = 'GRATUIT';
    if (supabase && clubId !== 'demo-club') {
      const { data } = await supabase
        .from('clubs')
        .select('stripe_plan')
        .eq('id', clubId)
        .maybeSingle();
      plan = data?.stripe_plan || 'GRATUIT';
    } else {
      const cookieStore = cookies();
      plan = cookieStore.get('capten_plan')?.value || 'GRATUIT';
    }

    if (plan === 'GRATUIT') {
      return NextResponse.json({
        success: false,
        briefing: "Le Copilote IA est réservé aux membres du plan Capten. Passe au plan supérieur pour obtenir ton briefing personnalisé quotidien et planifier tes séances !",
        isLocked: true,
        timestamp: new Date().toISOString()
      });
    }

    if (!supabase) {
      // Fallback Mock de briefing pour le mode démo sans Supabase
      return NextResponse.json({
        success: true,
        headline: "Tout roule pour ton crew !",
        briefing: "👋 **Bienvenue !** Tous tes runs sont programmés et le crew est en pleine forme. N'oublie pas de vérifier la météo avant de partir.",
        mood: "neutre",
        timestamp: new Date().toISOString()
      });
    }

    const brief = await getOrCreateDailyBrief(supabase, clubId);

    // Récupérer également les alertes actives pour affichage direct
    const { data: alerts } = await supabase
      .from('copilote_alertes')
      .select('id, type, priority, payload')
      .eq('club_id', clubId)
      .eq('status', 'active')
      .order('priority', { ascending: false })
      .limit(3);

    return NextResponse.json({
      success: true,
      headline: brief.headline,
      briefing: brief.body,
      mood: brief.mood,
      model_used: brief.model_used,
      alerts: alerts || [],
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[API /api/copilot GET Error]:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du briefing copilote', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseAdmin() || getSupabase();
    let clubId = 'demo-club';

    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        clubId = user.id;
      }
    }

    // Gating check
    let plan = 'GRATUIT';
    if (supabase && clubId !== 'demo-club') {
      const { data } = await supabase
        .from('clubs')
        .select('stripe_plan')
        .eq('id', clubId)
        .maybeSingle();
      plan = data?.stripe_plan || 'GRATUIT';
    } else {
      const cookieStore = cookies();
      plan = cookieStore.get('capten_plan')?.value || 'GRATUIT';
    }

    if (plan === 'GRATUIT') {
      return NextResponse.json({
        success: false,
        reply: "Le Copilote IA est une fonctionnalité premium réservée au plan Capten. Passe au plan Capten pour pouvoir discuter en direct avec ton copilote IA !",
        isLocked: true,
        timestamp: new Date().toISOString()
      });
    }

    const body = await request.json();
    const { message, history } = body || {};

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Le paramètre message est obligatoire.' },
        { status: 400 }
      );
    }

    const historyMsgs = Array.isArray(history) ? history : [];

    if (!supabase) {
      // Fallback démo
      return NextResponse.json({
        success: true,
        reply: "Super ! Je prends note. Fais-moi savoir si tu as d'autres questions sur la logistique du crew.",
        timestamp: new Date().toISOString()
      });
    }

    const reply = await queryCopilotChat(supabase, clubId, message, historyMsgs);

    return NextResponse.json({
      success: true,
      reply,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[API /api/copilot POST Error]:', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement du message copilote', details: error.message },
      { status: 500 }
    );
  }
}
