import { GoogleGenerativeAI } from '@google/generative-ai';
import { SupabaseClient } from '@supabase/supabase-js';

export interface CopiloteAlerte {
  id: string;
  type: string;
  priority: string;
  payload: any;
}

export interface CopiloteBrief {
  headline: string;
  body: string;
  mood: 'celebrer' | 'alerter' | 'inspirer' | 'neutre';
  model_used: string;
  count: number;
}

/**
 * Détecter les demandes grossièrement hors-sujet par mots-clés
 * pour économiser l'appel à l'API Gemini Flash.
 */
function isEvidentOffTopic(prompt: string): boolean {
  const cleanPrompt = prompt.toLowerCase();
  const offTopicKeywords = [
    'python', 'javascript', 'typescript', 'react', 'nextjs', 'next.js', 'html', 'css',
    'recette', 'cuisine', 'gateau', 'gâteau', 'chocolat', 'poème', 'poeme', 'poésie', 'poesie',
    'traduis', 'traduire', 'raconte une blague', 'blagues', 'joke', 'télécharge', 'download'
  ];

  return offTopicKeywords.some(keyword => cleanPrompt.includes(keyword));
}

/**
 * Remplir les variables du template avec les données du payload
 */
function replaceVariables(text: string, payload: any): string {
  if (!payload || typeof payload !== 'object') return text;
  let result = text;

  const vars: Record<string, any> = {
    runner_name: payload.runner_name || payload.name || 'un coureur',
    count: payload.count !== undefined ? payload.count : '',
    days: payload.days !== undefined ? payload.days : '',
    days_absent: payload.days_absent || payload.days || '',
    run_title: payload.run_title || payload.title || 'le run',
    milestone: payload.milestone || '',
    total_runs: payload.total_runs || ''
  };

  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), String(value));
  }
  return result;
}

/**
 * Récupère ou génère le briefing quotidien d'un club (crew)
 * respectant scrupuleusement l'arbre de décision d'optimisation des coûts de Gemini.
 */
export async function getOrCreateDailyBrief(
  supabase: SupabaseClient,
  clubId: string,
  forceRefresh = false
): Promise<CopiloteBrief> {
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Lire si un brief est déjà stocké en base de données pour aujourd'hui
  if (!forceRefresh) {
    const { data: existingBrief } = await supabase
      .from('copilote_brief')
      .select('headline, body, mood, model_used, alert_ids')
      .eq('club_id', clubId)
      .eq('brief_date', todayStr)
      .maybeSingle();

    if (existingBrief) {
      return {
        headline: existingBrief.headline,
        body: existingBrief.body,
        mood: existingBrief.mood as any,
        model_used: existingBrief.model_used,
        count: existingBrief.alert_ids?.length || 0,
      };
    }
  }

  // Récupérer les alertes actives
  const { data: activeAlerts } = await supabase
    .from('copilote_alertes')
    .select('id, type, priority, payload')
    .eq('club_id', clubId)
    .eq('status', 'active')
    .order('priority', { ascending: false });

  const alerts = activeAlerts || [];

  // CAS DÉCISIONNEL A : Aucun événement significatif
  if (alerts.length === 0) {
    const defaultBrief = {
      headline: 'Tout roule dans le crew !',
      body: '🧑‍✈️ Tout roule. Reviens après ton prochain run.',
      mood: 'neutre' as const,
      model_used: 'default',
      count: 0
    };

    // Stocker le brief vide par défaut
    await saveDailyBrief(supabase, clubId, defaultBrief, []);
    return defaultBrief;
  }

  // Récupérer le brief précédent pour le CAS DÉCISIONNEL B (Rien n'a changé)
  const { data: lastBrief } = await supabase
    .from('copilote_brief')
    .select('alert_ids, headline, body, mood, model_used')
    .eq('club_id', clubId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastBrief && lastBrief.alert_ids) {
    const currentAlertIds = alerts.map(a => a.id).sort().join(',');
    const lastAlertIds = [...lastBrief.alert_ids].sort().join(',');
    
    if (currentAlertIds === lastAlertIds && !forceRefresh) {
      const reusedBrief = {
        headline: lastBrief.headline,
        body: lastBrief.body,
        mood: lastBrief.mood as any,
        model_used: lastBrief.model_used,
        count: alerts.length
      };
      
      // Stocker pour aujourd'hui pour garder le cache quotidien intact
      await saveDailyBrief(supabase, clubId, reusedBrief, alerts.map(a => a.id));
      return reusedBrief;
    }
  }

  // CAS DÉCISIONNEL C & D : Génération à partir des templates / variantes
  const { data: clubData } = await supabase
    .from('clubs')
    .select('stripe_plan')
    .eq('id', clubId)
    .maybeSingle();

  const isFreePlan = (clubData?.stripe_plan || 'GRATUIT') === 'GRATUIT';

  if (isFreePlan) {
    const fallbackBrief = await buildDeterministicTemplateBrief(supabase, alerts);
    await saveDailyBrief(supabase, clubId, fallbackBrief, alerts.map(a => a.id));
    return fallbackBrief;
  }

  // Compteur de sécurité global : Compter les appels Gemini effectués aujourd'hui
  let currentDailyCallsCount = 0;
  try {
    const { count } = await supabase
      .from('copilote_brief')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStr + 'T00:00:00Z')
      .eq('model_used', 'gemini-3.5-flash');
    currentDailyCallsCount = count || 0;
  } catch (err) {
    console.error('[Copilot call counter read error]:', err);
  }

  if (currentDailyCallsCount >= 1400) {
    console.warn('[Copilot Safety Limit Warning]: Reached call count threshold. Fallback to templates.');
    const fallbackBrief = await buildDeterministicTemplateBrief(supabase, alerts);
    await saveDailyBrief(supabase, clubId, fallbackBrief, alerts.map(a => a.id));
    return fallbackBrief;
  }

  // APPEL GEMINI FLASH (En dernier recours)
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey && geminiKey !== 'votre_cle_gemini_ici' && geminiKey.trim() !== '') {
    try {
      const briefContent = await queryGeminiFlash(alerts, geminiKey);
      if (briefContent) {
        const geminiBrief = {
          headline: briefContent.headline,
          body: briefContent.body,
          mood: briefContent.mood,
          model_used: 'gemini-3.5-flash',
          count: alerts.length
        };
        await saveDailyBrief(supabase, clubId, geminiBrief, alerts.map(a => a.id));
        return geminiBrief;
      }
    } catch (err) {
      console.warn('[Gemini Flash Call failed. Invoking fallback template...]:', err);
    }
  }

  // Fallback si la clé n'est pas configurée ou si l'API a échoué
  const fallbackBrief = await buildDeterministicTemplateBrief(supabase, alerts);
  await saveDailyBrief(supabase, clubId, fallbackBrief, alerts.map(a => a.id));
  return fallbackBrief;
}

/**
 * Construit un briefing de manière 100% déterministe avec les variantes de la DB
 */
async function buildDeterministicTemplateBrief(
  supabase: SupabaseClient,
  alerts: CopiloteAlerte[]
): Promise<CopiloteBrief> {
  const alertTexts: string[] = [];
  let mainMood: 'celebrer' | 'alerter' | 'inspirer' | 'neutre' = 'neutre';
  
  const hasAlerteMeteoOrIncident = alerts.some(a => a.type === 'meteo_extreme' || a.type === 'incident_non_resolu' || a.priority === 'CRITIQUE');
  const hasCelebration = alerts.some(a => a.type === 'record_affluence' || a.type === 'milestone_runs' || a.type === 'belle_dynamique');

  if (hasAlerteMeteoOrIncident) mainMood = 'alerter';
  else if (hasCelebration) mainMood = 'celebrer';
  else mainMood = 'inspirer';

  for (const alert of alerts.slice(0, 3)) {
    const { data: variants } = await supabase
      .from('message_variantes')
      .select('titre, corps, emoji')
      .eq('alert_type', alert.type);

    if (variants && variants.length > 0) {
      const randomVariant = variants[Math.floor(Math.random() * variants.length)];
      const renderedText = replaceVariables(randomVariant.corps, alert.payload);
      alertTexts.push(`${randomVariant.emoji || '💡'} **${randomVariant.titre}** : ${renderedText}`);
    } else {
      alertTexts.push(`💡 alerte type: ${alert.type} - action requise.`);
    }
  }

  return {
    headline: 'Nouvelles alertes pour le crew',
    body: alertTexts.join('\n\n'),
    mood: mainMood,
    model_used: 'fallback',
    count: alerts.length
  };
}

/**
 * Appelle Gemini Flash pour générer un briefing à partir des alertes
 */
async function queryGeminiFlash(
  alerts: CopiloteAlerte[],
  apiKey: string
): Promise<{ headline: string; body: string; mood: 'celebrer' | 'alerter' | 'inspirer' | 'neutre' } | null> {
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.5-flash',
    systemInstruction: `Tu es le Copilote Capten, l'assistant IA complice d'un fondateur de run club (crew).
Ton ton est complice, tutoiement amical, langage de runner ("crew", "run" - n'utilise JAMAIS les mots "club" ni "course").
Affiche un grand dynamisme et de l'énergie.
Tu reçois une liste d'alertes concernant le crew et tu dois rédiger :
1. Une phrase courte d'accroche (HEADLINE), percutante et amicale (max 150 caractères, pas de guillemets).
2. Un court texte de synthèse (BODY) regroupant ces alertes (2-3 phrases maximum, direct, pragmatique).
3. Un indicateur de tonalité générale (MOOD) parmi : 'celebrer', 'alerter', 'inspirer', 'neutre'.

Réponds STRICTEMENT au format JSON suivant :
{
  "headline": "...",
  "body": "...",
  "mood": "..."
}`,
    generationConfig: {
      temperature: 0.5,
      responseMimeType: 'application/json',
      maxOutputTokens: 250
    }
  });

  const compactAlerts = alerts.map((a) => {
    return `- Type: ${a.type}, Priorité: ${a.priority}, Infos: ${JSON.stringify(a.payload)}`;
  }).join('\n');

  const contentPrompt = `Voici les alertes du jour pour le crew :\n${compactAlerts}\n\nRédige le briefing JSON.`;
  const result = await model.generateContent(contentPrompt);
  const textResponse = result.response.text()?.trim();

  if (textResponse) {
    const parsed = JSON.parse(textResponse);
    return {
      headline: parsed.headline || 'Bilan du jour',
      body: parsed.body || '',
      mood: ['celebrer', 'alerter', 'inspirer', 'neutre'].includes(parsed.mood) ? parsed.mood : 'neutre'
    };
  }
  return null;
}

/**
 * Gère les requêtes guidées et messages IA formulés par le fondateur (Partie Basse)
 */
export async function queryCopilotGuidedAction(
  supabase: SupabaseClient,
  clubId: string,
  actionType: 'rediger_message' | 'gerer_situation' | 'motiver_crew' | 'mot_coureur' | 'custom',
  inputs: {
    context?: string;
    situation?: string;
    goal?: string;
    runnerName?: string;
    customPrompt?: string;
  }
): Promise<string> {
  // 1. Pré-filtrage local anti-hors-sujet (évite l'appel API)
  if (actionType === 'custom' && inputs.customPrompt) {
    if (isEvidentOffTopic(inputs.customPrompt)) {
      return "Je suis ton Copilote running, je peux t'aider seulement sur ton crew et tes runs 🏃";
    }
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey || geminiKey === 'votre_cle_gemini_ici' || geminiKey.trim() === '') {
    // Si pas de clé, on utilise le mock
    if (actionType === 'rediger_message') {
      return `Crew habituel ! 🏃 Ce soir, on court. Contexte : ${inputs.context}. Hâte de tous vous voir !`;
    }
    return "Je suis ton Copilote running, je peux t'aider seulement sur ton crew et tes runs 🏃";
  }

  let specificPrompt = '';
  switch (actionType) {
    case 'rediger_message':
      specificPrompt = `Rédige un message WhatsApp prêt à être copié-collé pour le crew. 
Contexte et objectif du message : "${inputs.context || 'Annoncer la prochaine session'}".`;
      break;
    case 'gerer_situation':
      specificPrompt = `Donne-moi 2-3 conseils ultra-pragmatiques pour gérer la situation suivante au sein de mon crew : "${inputs.situation || ''}".
Ajoute un modèle de message WhatsApp ou SMS prêt à être envoyé si c'est pertinent.`;
      break;
    case 'motiver_crew':
      specificPrompt = `Rédige un message de motivation percutant, fun et inspirant pour le crew sur le thème : "${inputs.goal || ''}".`;
      break;
    case 'mot_coureur':
      const nom = inputs.runnerName || 'le coureur';
      specificPrompt = `Rédige un message d'accueil ou de relance personnalisé, chaleureux et complice pour le coureur nommé "${nom}".
Contexte : "${inputs.context || 'Nouveau membre à accueillir'}".`;
      break;
    case 'custom':
      specificPrompt = `Traite la demande suivante : "${inputs.customPrompt || ''}"`;
      break;
    default:
      specificPrompt = `Aide-moi à gérer mon crew : "${JSON.stringify(inputs)}"`;
  }

  try {
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash',
      systemInstruction: `Tu es le Copilote de Capten, l'assistant IA complice d'un fondateur de run club (crew) de running.
Tu ne réponds QU'AUX sujets directement liés à la course à pied, au running, au sport, à l'organisation de runs et à la gestion d'un crew de coureurs.
Si la demande de l'utilisateur n'a aucun rapport avec le running ou la gestion d'un crew (ex: écrire du code, un poème, une recette de cuisine, de la culture générale, etc.), réponds STRICTEMENT et UNIQUEMENT par la phrase suivante : "Je suis ton Copilote running, je peux t'aider seulement sur ton crew et tes runs 🏃" et ne traite pas la demande.
Ton ton est complice, tutoiement amical, langage de runner ("crew", "run", "after-run" - n'utilise JAMAIS les mots "club" ni "course").
Réponds de manière extrêmement directe, pragmatique et actionnable. 
Les messages suggérés doivent être immédiatement prêts à copier-coller dans WhatsApp. Pas d'introduction ou de politesses de robot.`,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 600
      }
    });

    const result = await model.generateContent(specificPrompt);
    const reply = result.response.text()?.trim();

    if (reply) {
      // Enregistrer l'appel dans la DB sous le tag gemini-3.5-flash-chat pour le rate-limiting quotidien
      const todayStr = new Date().toISOString().split('T')[0];
      await supabase.from('copilote_brief').insert({
        club_id: clubId,
        brief_date: todayStr,
        headline: `Guided Action: ${actionType}`,
        body: `Prompt: ${specificPrompt}\nReply: ${reply}`,
        mood: 'neutre',
        model_used: 'gemini-3.5-flash-chat',
        alert_ids: []
      });
      return reply;
    }
  } catch (err) {
    console.error('[Gemini Guided Action Error]:', err);
  }

  return "Je n'ai pas pu contacter mon moteur de génération IA. Tout roule pour le reste ! 💪";
}

/**
 * Enregistre le briefing du jour en base de données
 */
async function saveDailyBrief(
  supabase: SupabaseClient,
  clubId: string,
  brief: CopiloteBrief,
  alertIds: string[]
) {
  const todayStr = new Date().toISOString().split('T')[0];
  await supabase
    .from('copilote_brief')
    .upsert({
      club_id: clubId,
      brief_date: todayStr,
      headline: brief.headline,
      body: brief.body,
      mood: brief.mood,
      alert_ids: alertIds,
      model_used: brief.model_used,
      context_snapshot: { alerts_count: alertIds.length }
    }, {
      onConflict: 'club_id, brief_date'
    });
}
