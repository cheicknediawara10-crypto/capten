import { NextResponse } from 'next/server';
import { getSupabase, getSupabaseAdmin } from '@/lib/supabase';
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
