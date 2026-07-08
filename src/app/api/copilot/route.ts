import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabase, getSupabaseAdmin } from '@/lib/supabase';
import { getOrCreateDailyBrief, queryCopilotGuidedAction } from '@/lib/ai/copilote';

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
      return NextResponse.json({
        success: true,
        headline: "Tout roule pour ton crew !",
        briefing: "👋 **Bienvenue !** Tous tes runs sont programmés et le crew est en pleine forme. N'oublie pas de vérifier la météo avant de partir.",
        mood: "neutre",
        chatCallsCount: 0,
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

    // Compter le nombre de requêtes IA de chat effectuées aujourd'hui
    const todayStr = new Date().toISOString().split('T')[0];
    const { count: dailyCalls } = await supabase
      .from('copilote_brief')
      .select('*', { count: 'exact', head: true })
      .eq('club_id', clubId)
      .eq('brief_date', todayStr)
      .eq('model_used', 'gemini-3.5-flash-chat');

    return NextResponse.json({
      success: true,
      headline: brief.headline,
      briefing: brief.body,
      mood: brief.mood,
      model_used: brief.model_used,
      alerts: alerts || [],
      chatCallsCount: dailyCalls || 0,
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
    const { actionType, inputs, message } = body || {};

    let actualActionType = actionType || 'custom';
    let actualInputs = inputs || {};

    if (message && !inputs?.customPrompt) {
      actualActionType = 'custom';
      actualInputs = { customPrompt: message };
    }

    if (!supabase) {
      return NextResponse.json({
        success: true,
        reply: "Super ! Je prends note (Mode Démo). Fais-moi savoir si tu as d'autres questions sur la logistique du crew.",
        chatCallsCount: 1,
        timestamp: new Date().toISOString()
      });
    }

    // Limiteur de quota de chat : Max 20 demandes/jour/fondateur
    const todayStr = new Date().toISOString().split('T')[0];
    const { count: dailyCalls } = await supabase
      .from('copilote_brief')
      .select('*', { count: 'exact', head: true })
      .eq('club_id', clubId)
      .eq('brief_date', todayStr)
      .eq('model_used', 'gemini-3.5-flash-chat');

    const callsCount = dailyCalls || 0;
    if (callsCount >= 20) {
      return NextResponse.json({
        success: false,
        reply: "Tu as fait le tour pour aujourd'hui, ton Copilote revient demain 🌙 (Limite de 20 demandes de chat par jour)",
        limitExceeded: true,
        chatCallsCount: callsCount,
        timestamp: new Date().toISOString()
      });
    }

    const reply = await queryCopilotGuidedAction(
      supabase,
      clubId,
      actualActionType,
      actualInputs
    );

    return NextResponse.json({
      success: true,
      reply,
      chatCallsCount: callsCount + 1,
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
