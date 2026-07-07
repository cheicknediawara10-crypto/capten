import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabase } from '@/lib/supabase';
import { getCopilotContext, queryCopilotEngine, CopilotMessage } from '@/lib/copilot';

export async function GET(request: Request) {
  try {
    const supabase = getSupabase();
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

    // Agrégation du contexte Supabase en temps réel
    const context = await getCopilotContext(clubId);

    // Génération du briefing proactif (priorité stricte)
    const briefing = await queryCopilotEngine(context);

    return NextResponse.json({
      success: true,
      briefing,
      context,
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
    const supabase = getSupabase();
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

    const historyMsgs: CopilotMessage[] = Array.isArray(history) ? history : [];

    // Agrégation du contexte Supabase en temps réel
    const context = await getCopilotContext(clubId, historyMsgs);

    // Réponse de conversation du Copilote
    const reply = await queryCopilotEngine(context, message);

    return NextResponse.json({
      success: true,
      reply,
      context,
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
