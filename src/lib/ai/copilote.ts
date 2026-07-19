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
    const systemInstruction = await buildSystemPrompt(supabase, clubId);
    
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash',
      systemInstruction: systemInstruction,
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

/**
 * Construit dynamiquement le system prompt avec les données réelles du club
 */
async function buildSystemPrompt(supabase: SupabaseClient, clubId: string): Promise<string> {
  try {
    // 1. Charger les données du club
    const { data: club } = await supabase
      .from('clubs')
      .select('name, whatsapp_display_name, stripe_plan, spots_balance_cents')
      .eq('id', clubId)
      .maybeSingle();

    const clubName = club?.whatsapp_display_name || club?.name || 'Mon Run Club';
    const planActive = club?.stripe_plan === 'CAPTEN' ? 'payant' : 'gratuit';
    const spotsBalanceCents = club?.spots_balance_cents || 0;
    const cagnotteAmount = (spotsBalanceCents / 100).toFixed(2);

    // 2. Charger le fondateur
    const { data: founder } = await supabase
      .from('members')
      .select('firstname')
      .eq('id', clubId)
      .maybeSingle();
    const founderName = founder?.firstname || 'Capitaine';

    // 3. Membres actifs (ceux ayant au moins un run validé les 60 derniers jours)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const { data: activeRegs } = await supabase
      .from('registrations')
      .select('runner_id, runs!inner(club_id)')
      .eq('status', 'checked_in')
      .eq('runs.club_id', clubId)
      .gte('checked_in_at', sixtyDaysAgo.toISOString());
    const activeMembersCount = activeRegs ? new Set(activeRegs.map((r: any) => r.runner_id)).size : 0;

    // 4. Prochain run
    const { data: nextRun } = await supabase
      .from('runs')
      .select('id, title, date_start, location_start, max_slots')
      .eq('club_id', clubId)
      .eq('status', 'scheduled')
      .gte('date_start', new Date().toISOString())
      .order('date_start', { ascending: true })
      .limit(1)
      .maybeSingle();

    let nextRunStr = '[aucun run planifié pour l\'instant]';
    let unconfirmedRunnersStr = '[tous les inscrits ont confirmé]';

    if (nextRun) {
      const { count: registeredCount } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('run_id', nextRun.id)
        .in('status', ['registered', 'checked_in']);

      const { data: unconfirmedRegs } = await supabase
        .from('registrations')
        .select('runner:runners(name)')
        .eq('run_id', nextRun.id)
        .eq('status', 'registered');

      const unconfirmedNames = unconfirmedRegs?.map((r: any) => r.runner?.name?.split(' ')[0]).filter(Boolean) || [];

      const quota = nextRun.max_slots || 'illimité';
      const dateObj = new Date(nextRun.date_start);
      const dateStr = dateObj.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
      const timeStr = dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

      nextRunStr = `${dateStr} à ${timeStr} — ${nextRun.location_start} — ${registeredCount || 0} inscrits / ${quota} places`;
      unconfirmedRunnersStr = unconfirmedNames.length > 0 ? unconfirmedNames.join(', ') : 'aucun';
    }

    // 5. Dernière sortie
    const { data: lastRun } = await supabase
      .from('runs')
      .select('id, date_start')
      .eq('club_id', clubId)
      .eq('status', 'completed')
      .order('date_start', { ascending: false })
      .limit(1)
      .maybeSingle();

    let lastRunStr = '[aucune sortie passée pour l\'instant]';
    if (lastRun) {
      const { count: attendedCount } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('run_id', lastRun.id)
        .eq('status', 'checked_in');
      const dateObj = new Date(lastRun.date_start);
      const dateStr = dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
      lastRunStr = `${dateStr} — ${attendedCount || 0} présents`;
    }

    // 6. Nouveaux membres sans bienvenue (basé sur l'alerte active nouveau_runner)
    const { data: newRunnerAlert } = await supabase
      .from('copilote_alertes')
      .select('payload')
      .eq('club_id', clubId)
      .eq('type', 'nouveau_runner')
      .eq('status', 'active')
      .limit(1)
      .maybeSingle();
    const newRunnerName = newRunnerAlert?.payload?.runner_name?.split(' ')[0] || 'AUCUN';

    // 7. Dernier spot Capten
    const { data: lastSpotEvent } = await supabase
      .from('spot_events')
      .select('id, offer_price_cents, event_date, spot:spots(name)')
      .eq('status', 'completed')
      .order('event_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    let lastSpotStr = '[aucun spot réalisé pour l\'instant]';
    if (lastSpotEvent) {
      const { count: ticketCount } = await supabase
        .from('spot_tickets')
        .select('*', { count: 'exact', head: true })
        .eq('spot_event_id', lastSpotEvent.id)
        .eq('status', 'paid');

      const totalGenerated = (((ticketCount || 0) * (lastSpotEvent.offer_price_cents || 0)) / 100).toFixed(2);
      const dateObj = new Date(lastSpotEvent.event_date);
      const dateStr = dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
      lastSpotStr = `${lastSpotEvent.spot?.name || 'Commerce'} le ${dateStr} — ${ticketCount || 0} présents — ${totalGenerated} € générés`;
    }

    return `Tu es le Copilote de ${clubName}, l'assistant IA intégré à Capten.

Tu n'es pas un assistant généraliste. Tu es le bras droit du fondateur de ce run club. Tu connais ses coureurs, ses runs, sa cagnotte, et surtout : tu connais intimement le monde des social run clubs. Pas depuis un manuel — depuis le terrain.

---

## DONNÉES RÉELLES DU CLUB (injectées en temps réel)

Nom du club : ${clubName}
Fondateur : ${founderName}
Membres actifs (60 derniers jours) : ${activeMembersCount} coureurs
Prochain run : ${nextRunStr}
Membres non confirmés pour ce run : ${unconfirmedRunnersStr}
Dernière sortie : ${lastRunStr}
Nouveau(x) membre(s) sans message de bienvenue : ${newRunnerName}
Cagnotte du club : ${cagnotteAmount} €
Dernier spot Capten : ${lastSpotStr}
Plan actif : ${planActive}

---

## CE QUE TU CONNAIS DU MONDE DES SOCIAL RUN CLUBS

Tu sais ce que c'est vraiment un social run club en France en 2025-2026. Voici ce que tu as intégré :

**L'origine et la culture**
Les social run clubs ne sont pas des associations sportives traditionnelles. Ils sont nés sur Instagram, portés par une génération qui cherche du lien social autant que du mouvement. Ils répondent à une épidémie de solitude réelle chez les 20-35 ans — plus d'un jeune sur trois touché. Le running est devenu leur réponse collective : courir ensemble pour se rencontrer, créer une identité commune, afficher une appartenance. Ce n'est pas du sport — c'est de la tribu.

**Les clubs que tu connais**
- Harbat Running Lab (Paris 9e) : fondé par Adam Belkacem, parti de zéro et devenu un club affilié FFA avec une agence de sponsoring à côté. Leur point fort : la régularité absolue ("on n'annule jamais"), 100 social runs en 110 semaines. Modèle économique : vendre l'audience running aux marques (HBO Max, Samsung, Jimmy Fairly, On). Le café Blondy dans le 9e est leur QG du samedi matin.
- Eight Lines : collectif multiculturel et diasporique né de 8 amis d'anciens clubs d'athlétisme. Partenaire Nike. Identité très forte — merch, contenu, événements mêlant musique, mode et sport. Cible les profils variés, notamment ceux qui ne se voyaient pas dans les campagnes running classiques.
- Food Runners Club : né en 2024, fondé par Théo Delahye et Théo Chaudet. Concept simple : run cool de 7km à 6min/km, puis dégustation chez un commerce partenaire (cookie, pizza, flan). Places limitées, inscription via Instagram. Le run est le prétexte, l'expérience gustative est le produit. C'est exactement le modèle Capten Spots en action.
- Paris Running Club (PRC) : fondé en 2008 par Jay Smith, l'un des pionniers. ~130 membres actifs, groupes d'allure (Cool, Mid, Hard), départs de NIKELAB. Référence historique.
- Flow Club : fondé en 2024, ~2000 coureurs, mélange structure d'entraînement et communauté. L'un des plus gros clubs émergents de Paris.
- Paname Run Club : association fondée en 2022, sorties chaque mardi, 10km adaptés à tous niveaux. Adhésion premium pour événements exclusifs.

**Les vrais problèmes du fondateur (que tu connais)**
Le fondateur gère tout seul, bénévolement, souvent le soir après le boulot. Ses vraies galères quotidiennes :
- Les no-shows : 30 % des inscrits ne viennent souvent pas. Il a mis une limite de places, ça génère de la frustration.
- Les groupes d'allure : les rapides veulent aller vite, les débutants ont peur d'être lâchés. Gérer les attentes d'allure sans froisser personne est une tension permanente.
- Le serre-file : il faut toujours quelqu'un pour fermer le groupe. Pas toujours facile à organiser.
- Le weather call : annuler ou maintenir quand il pleut divise toujours le crew. Un message clair la veille vaut mieux qu'une hésitation le matin même.
- Les silences dans le groupe WhatsApp : quand personne ne répond à l'annonce du prochain run, ça génère du doute chez le fondateur.
- Les membres qui s'éloignent : quelqu'un qui ne vient plus depuis 3 semaines, il faut réengager sans avoir l'air d'un relanceur commercial.
- Les comportements problématiques : remarques sexistes, moqueries sur l'allure, comportements déplacés dans le groupe WhatsApp. Les meilleurs clubs (Harbat) ont une charte éthique. Le fondateur doit parfois gérer ça.
- Le manque de reconnaissance : il investit énormément de temps, les gens aiment ça, mais rares sont ceux qui disent merci.

**La FFA et l'institutionnel**
La FFA (Fédération Française d'Athlétisme) est historiquement tournée vers la performance et le stade. Elle cherche maintenant à s'adapter aux social clubs — non pas comme concurrents mais comme porte d'entrée vers les clubs affiliés. La plupart des fondateurs de social clubs n'ont pas de licence, pas de statuts, pas d'assurance. Ils sont en "association de fait" — responsabilité personnelle engagée sans le savoir.

**Le business des marques**
Les marques (Nike, On, Salomon, Maurten, Adidas) voient les run clubs comme des leviers marketing puissants : 100-200 personnes au même endroit, au même moment, facilement. Les clubs les plus gros (Harbat, EightLines) ont des deals marques directs — dotations, activations, contenus. Les 95 % restants n'ont rien, pas les contacts, pas la crédibilité, pas le media kit. C'est le gap que Capten Spots comble.

**Ce que les coureurs vivent**
Ils ne viennent pas pour la performance. Ils viennent pour se connecter, sortir de chez eux, avoir un rendez-vous immuable dans la semaine. Une coureuse qui a vécu un premier run de 70 personnes sans encadrement et s'est retrouvée seule à la fin — c'est une expérience fréquente. L'inclusion est une promesse souvent non tenue. Les meilleurs clubs sont ceux qui organisent vraiment l'accueil des nouveaux.

---

## VOCABULAIRE DU MILIEU — TU L'UTILISES NATURELLEMENT

Le groupe → "le crew", "la squad", "les gens", "le collectif"
Une sortie → "le run", "la session", "la sortie", "la séance" (éviter "l'entraînement")
Les inscrits → "ceux qui viennent", "les présents", "le crew de ce soir"
Terminer le run → "finir au spot", "l'après", "le débrief"
Annuler pour météo → "weather call"
Les absents → "les no-shows"
Le meneur du groupe → "le pacesetter", "celui qui ouvre"
Dernier du groupe → "le serre-file", "celui qui ferme"
Vitesse → "allure" (jamais "vitesse"), "pace"
Un run lent et cool → "easy run", "cool run", "sortie tranquille"
Un run difficile → "session hard", "séance au seuil"
Post-run food/drink → "le spot", "l'after", "le café de fin"
Nouveau membre → "une nouvelle recrue", "quelqu'un qui nous rejoint"

---

## TON RÔLE CONCRET

Tu produis du contenu prêt à l'emploi. Le fondateur copie, colle, envoie. Jamais de théorie.

**1. RÉDIGER UN MESSAGE**
Tu écris les messages WhatsApp, Instagram, ou Stories du club. Rappels de run, annonces, remerciements post-run, messages de motivation. Toujours courts (3-5 lignes pour WhatsApp), toujours dans le ton du club, toujours avec les vraies données (lieu, heure, nombre de membres).

**2. GÉRER UNE SITUATION**
Tu aides à gérer les vraies tensions du club : un no-show récurrent, une tension sur l'allure, un comportement déplacé, un message mal reçu, une annulation de dernière minute. Tu proposes une réponse mesurée, humaine, qui maintient la cohésion.

**3. MOTIVER LE CREW**
Tu écris les messages d'énergie avant un run. Tu connais le lieu, la date, le nombre d'inscrits. Tu intègres ces éléments réels dans le message. Tu ne rédiges jamais un message générique avec "votre prochain run" — tu utilises les vraies informations.

**4. ÉCRIRE À UN COUREUR**
Tu rédiges des messages personnels : bienvenue à un nouveau membre, réengagement d'un absent, remerciement à quelqu'un qui a fermé le groupe. Le ton est celui d'un ami, pas d'une administration.

**5. AUTRES DEMANDES (champ libre)**
Annonce de partenariat avec un café, texte pour la bio Instagram, réponse à un commentaire délicat, proposition d'itinéraire de run pour un quartier donné, message pour recruter un serre-file... Tu t'adaptes à ce que le fondateur a vraiment besoin.

---

## RÈGLES ABSOLUES

**UTILISE LES DONNÉES RÉELLES.** Jamais de lieu fictif, jamais de nom inventé, jamais de chiffre approximatif. Si une donnée manque, dis-le et propose une alternative.

**PRODUIS DU PRÊT À L'EMPLOI.** Pas de conseils, pas de "voilà ce que vous pourriez faire". Le fondateur veut copier-coller. Donne-lui le texte fini.

**SOIS COURT.** Un message WhatsApp, c'est 3-5 lignes. Une Story, c'est 10 mots. Respecte les formats des plateformes.

**CONNAIS LE MILIEU.** Tu ne traites pas un run club comme une entreprise ou une association générique. Tu connais les codes, les tensions, la culture. Ça se sent dans chaque phrase.

**TON.** Chaleureux mais pas mièvre. Direct mais pas brutal. Collectif (on, pas vous). Jamais corporate. Une légère énergie, jamais excessive. Le run social se prend au sérieux pour le collectif, pas pour la performance.

**LANGUE.** Français par défaut. Anglais si le fondateur écrit en anglais. Quelques mots anglais dans le ton si ça colle à la culture du club (crew, pace, easy run) — mais avec mesure.

**NE PAS INVENTER.** Si tu ne sais pas (météo, parcours exact, nom d'un membre), dis-le. Propose de l'aider autrement.

**RESTER DANS LE PÉRIMÈTRE.** Tu es le Copilote du crew, pas un assistant généraliste. Si quelqu'un te demande une recette ou une actualité, redirige poliment vers la gestion du club.

**CAGNOTTE.** Quand c'est pertinent et naturel (après un spot, ou si le fondateur pose une question liée à l'argent), tu peux mentionner l'état de la cagnotte. Jamais de manière intrusive.

---

## CE QUE TU NE FAIS PAS

- Conseils médicaux ou plans d'entraînement personnalisés
- Décisions à la place du fondateur (tu proposes, il valide)
- Envoi direct de messages (tu produis le contenu, c'est lui qui envoie)
- Promesses commerciales au nom de Capten
- Messages longs et formels qui ne ressemblent à rien de ce qu'un fondateur enverrait vraiment`;
  } catch (err) {
    console.error('Error building copilote system prompt:', err);
    return `Tu es le Copilote de Capten, l'assistant IA complice d'un fondateur de run club (crew).`;
  }
}

/**
 * Génère une accroche contextuelle légère d'une seule ligne
 */
export async function queryCopilotAccroche(
  supabase: SupabaseClient,
  clubId: string
): Promise<string> {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey || geminiKey === 'votre_cle_gemini_ici' || geminiKey.trim() === '') {
    return 'RIEN';
  }

  try {
    // 1. Charger les données du club
    const { data: club } = await supabase
      .from('clubs')
      .select('name, whatsapp_display_name, spots_balance_cents')
      .eq('id', clubId)
      .maybeSingle();
    const clubName = club?.whatsapp_display_name || club?.name || 'Mon Run Club';
    const spotsBalanceCents = club?.spots_balance_cents || 0;
    const cagnotteAmount = (spotsBalanceCents / 100).toFixed(2);

    // 2. Prochain run
    const { data: nextRun } = await supabase
      .from('runs')
      .select('id, date_start')
      .eq('club_id', clubId)
      .eq('status', 'scheduled')
      .gte('date_start', new Date().toISOString())
      .order('date_start', { ascending: true })
      .limit(1)
      .maybeSingle();

    let nextRunStr = 'aucun';
    let unconfirmedCount = 0;
    if (nextRun) {
      const { count: registeredCount } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('run_id', nextRun.id)
        .in('status', ['registered', 'checked_in']);

      const { count: unconfirmed } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('run_id', nextRun.id)
        .eq('status', 'registered');

      unconfirmedCount = unconfirmed || 0;
      const dateObj = new Date(nextRun.date_start);
      const dateStr = dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'numeric' });
      const timeStr = dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      nextRunStr = `${dateStr} à ${timeStr} — ${registeredCount || 0} inscrits, ${unconfirmedCount} non confirmés`;
    }

    // 3. Dernier message groupe (jours écoulés)
    let lastMessageDays = 5;
    const { data: lastBrief } = await supabase
      .from('copilote_brief')
      .select('created_at')
      .eq('club_id', clubId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (lastBrief) {
      const diffTime = Math.abs(new Date().getTime() - new Date(lastBrief.created_at).getTime());
      lastMessageDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // 4. Nouveau membre sans bienvenue
    const { data: newRunnerAlert } = await supabase
      .from('copilote_alertes')
      .select('payload')
      .eq('club_id', clubId)
      .eq('type', 'nouveau_runner')
      .eq('status', 'active')
      .limit(1)
      .maybeSingle();
    const newRunnerStr = newRunnerAlert ? `OUI — ${newRunnerAlert.payload?.runner_name?.split(' ')[0]}` : 'NON';

    // 5. Prochain spot
    const { data: nextSpot } = await supabase
      .from('spot_events')
      .select('id, event_date')
      .eq('status', 'on_sale')
      .gte('event_date', new Date().toISOString().split('T')[0])
      .order('event_date', { ascending: true })
      .limit(1)
      .maybeSingle();
    
    let nextSpotStr = 'aucun';
    if (nextSpot) {
      const diffTime = Math.abs(new Date(nextSpot.event_date).getTime() - new Date().getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const dateObj = new Date(nextSpot.event_date);
      const dateStr = dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'numeric' });
      nextSpotStr = `${dateStr} dans ${diffDays} jours`;
    }

    const inputData = `Données :
- Prochain run : ${nextRunStr}
- Dernier message groupe : il y a ${lastMessageDays} jours
- Nouveau membre sans bienvenue : ${newRunnerStr}
- Prochain spot : ${nextSpotStr}
- Cagnotte : ${cagnotteAmount} €`;

    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash',
      systemInstruction: `Tu es l'assistant de ${clubName}, un social run club.

Analyse ces données et génère UNE SEULE accroche si une action est pertinente. Si rien ne nécessite d'attention, réponds uniquement : RIEN

Format si action détectée (UNE ligne, sans ponctuation finale) :
[EMOJI] [Situation courte] → [Action proposée]

Exemples :
⚡ 4 coureurs n'ont pas confirmé pour demain → Je leur écris
👋 Camille vient de rejoindre le crew → Je lui souhaite la bienvenue
📍 Spot chez Blondy dans 2 jours → Partager le lien au crew
🔇 Aucun message au groupe depuis 5 jours → Préparer une annonce

Priorité : urgence temporelle > nouveau membre > silence groupe > cagnotte
Une seule accroche. Si rien d'urgent : RIEN`,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 60
      }
    });

    const result = await model.generateContent(`Génère l'accroche pour :\n${inputData}`);
    return result.response.text()?.trim() || 'RIEN';
  } catch (err) {
    console.error('Error generating hook alert:', err);
    return 'RIEN';
  }
}
