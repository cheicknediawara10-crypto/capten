import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabase, getSupabaseAdmin } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

const DEBRIEF_SYSTEM_PROMPT = `Tu es le Copilote IA Capten. Ton rôle est d'analyser l'ensemble des débriefings, retours anonymes des coureurs et signalements de sécurité suite à une course (run) spécifique, et d'en faire une synthèse claire, concise et extrêmement exploitable pour le Capitaine du club.

Ta synthèse doit comporter obligatoirement :
1. **Satisfaction & Humeur Globale** : Résume la satisfaction (ex: taux de sensations positives 🔥 vs fatigue/allure trop rapide 🥵 ou sentiment de solitude 😔).
2. **Analyse du Rythme et de l'Allure** : Analyse si l'allure globale était adaptée.
3. **Sécurité & Alertes** : Identifie les incidents ou alertes critiques (problèmes physiques, harcèlement, discrimination, chutes).
4. **Conseils & Actions Concrètes** : Donne 2 à 3 recommandations concrètes pour la prochaine session (ex: nommer un serre-file, ralentir l'allure sur la fin, modifier le parcours).

Reste professionnel, amical et synthétique. Rédige en français sous forme de blocs structurés avec des émojis. Ne cite aucun nom pour préserver l'anonymat des signalements.`;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const runId = searchParams.get('run_id');

    if (!runId) {
      return NextResponse.json({ error: "L'identifiant du run est requis." }, { status: 400 });
    }

    const { getAuthenticatedCaptainId } = await import('@/lib/auth-server');
    const captainId = await getAuthenticatedCaptainId();
    const clubId = captainId || 'demo-club';
    const supabase = getSupabaseAdmin() || getSupabase();

    // 1. Gating check
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
        summary: "L'analyse IA de fin de run est réservée aux membres du plan Capten. Passe au plan supérieur pour synthétiser instantanément les retours de tes coureurs !",
        isLocked: true
      });
    }

    // 2. Fetch run info
    let runTitle = 'Run';
    if (supabase) {
      const { data: runData } = await supabase
        .from('runs')
        .select('title')
        .eq('id', runId)
        .maybeSingle();
      if (runData) runTitle = runData.title;
    } else {
      // Mock Fallback
      runTitle = 'TEMPO THURSDAY';
    }

    // 3. Fetch all feedback/incidents for this run
    let feedbacks: any[] = [];
    if (supabase) {
      const { data } = await supabase
        .from('incidents')
        .select('type, priority, anonymous, involved, details, created_at')
        .eq('run_id', runId);
      feedbacks = data || [];
    } else {
      // Mock feedbacks
      feedbacks = [
        { type: 'Mood Check (Feedback)', priority: 'BASSE', anonymous: true, involved: '🧘 Rythme parfait', details: "Super ambiance ce soir, allure nickel." },
        { type: 'Mood Check (Feedback)', priority: 'BASSE', anonymous: true, involved: '🔥 Super', details: "Merci au Captain ! Café d'après-run au top." },
        { type: 'Mood Check (Feedback)', priority: 'BASSE', anonymous: true, involved: '🧘 Rythme parfait', details: "" },
        { type: 'Mood Check (Feedback)', priority: 'HAUTE', anonymous: true, involved: '🥵 Trop rapide', details: "Les 2 derniers kilomètres étaient trop rapides pour moi, j'ai fini à la traîne." },
        { type: 'Mood Check (Feedback)', priority: 'HAUTE', anonymous: true, involved: '🥵 Trop rapide', details: "Allure difficile à suivre sur la côte." },
        { type: 'Mood Check (Feedback)', priority: 'BASSE', anonymous: true, involved: '🧘 Rythme parfait', details: "" },
        { type: 'Mood Check (Feedback)', priority: 'HAUTE', anonymous: true, involved: '😔 Je me suis senti seul', details: "Personne ne m'a parlé pendant le run d'après-café, c'était ma première fois et je me suis senti un peu exclu." }
      ];
    }

    if (feedbacks.length === 0) {
      return NextResponse.json({
        success: true,
        summary: "Aucun débriefing ou signalement n'a été reçu pour cette course. Pour analyser les retours, partage le lien de débriefing de fin de run à tes coureurs !",
        count: 0
      });
    }

    // 4. Construct prompt for Gemini
    const listFeedbacksStr = feedbacks.map((f, i) => {
      return `Retour #${i+1} :
- Type : ${f.type}
- Priorité : ${f.priority}
- Humeur / Contexte : ${f.involved || 'Non spécifié'}
- Détails : ${f.details || '(Aucun commentaire rédigé)'}
- Anonyme : ${f.anonymous ? 'Oui' : 'Non'}`;
    }).join('\n\n');

    const contentPrompt = `Voici la liste des débriefings et retours anonymes reçus pour le run "${runTitle}" (Total : ${feedbacks.length} retours) :\n\n${listFeedbacksStr}\n\nFais une synthèse structurée et exploitable pour le Captain du club.`;

    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey && geminiKey !== 'votre_cle_gemini_ici' && geminiKey.trim() !== '') {
      try {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-3.5-flash',
          systemInstruction: DEBRIEF_SYSTEM_PROMPT,
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 800,
          },
        });

        const result = await model.generateContent(contentPrompt);
        const summary = result.response.text()?.trim();
        if (summary) {
          return NextResponse.json({
            success: true,
            summary,
            count: feedbacks.length
          });
        }
      } catch (err: any) {
        console.warn('[Gemini Debrief Summary Error]:', err);
      }
    }

    // Deterministic Fallback if Gemini fails or is offline
    const totalCount = feedbacks.length;
    const moodCounts = feedbacks.reduce((acc: any, f) => {
      const match = f.involved ? f.involved.split(' ')[0] : null;
      if (match) acc[match] = (acc[match] || 0) + 1;
      return acc;
    }, {});

    const slowDownCount = feedbacks.filter(f => (f.details || '').toLowerCase().includes('rapide') || (f.involved || '').includes('🥵')).length;
    const leftOutCount = feedbacks.filter(f => (f.details || '').toLowerCase().includes('seul') || (f.involved || '').includes('😔')).length;

    const fallbackSummary = `### 📊 Synthèse Statistique (${totalCount} retours)
* **🔥 Super** : ${moodCounts['🔥'] || 0}
* **🧘 Rythme parfait** : ${moodCounts['🧘'] || 0}
* **🥵 Trop rapide** : ${moodCounts['🥵'] || 0}
* **😔 Sentiment d'exclusion** : ${moodCounts['😔'] || 0}

### ⚠️ Points d'Attention
${slowDownCount > 0 ? `* **Allure trop rapide** : ${slowDownCount} coureurs ont signalé un rythme trop élevé.` : ''}
${leftOutCount > 0 ? `* **Inclusivité** : ${leftOutCount} coureur(s) se sont senti(s) mis de côté lors de cette session.` : ''}
${slowDownCount === 0 && leftOutCount === 0 ? `* Aucun point d'attention particulier à signaler. Ambiance au top !` : ''}

### 💡 Recommandations
1. ${slowDownCount > 0 ? "Ralentir l'allure sur la fin de course ou proposer un groupe de niveau plus tranquille." : "Maintenir cette allure et ce format qui conviennent très bien."}
2. ${leftOutCount > 0 ? "Nommer des parrains/co-captains pour accueillir et accompagner les nouveaux coureurs au café." : "Continuer d'encourager les rituels d'après-run pour souder la communauté."}
`;

    return NextResponse.json({
      success: true,
      summary: fallbackSummary,
      count: totalCount,
      isFallback: true
    });

  } catch (error: any) {
    console.error('[API /api/copilot/debrief Error]:', error);
    return NextResponse.json(
      { error: "Erreur lors de la génération de l'analyse IA de fin de run", details: error.message },
      { status: 500 }
    );
  }
}
