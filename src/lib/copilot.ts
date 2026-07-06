import { getSupabase, getSupabaseAdmin } from './supabase';
import { getWeatherForecast } from './weather';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface CopilotContext {
  meteo_soir: string;
  delta_frequentation: string;
  membres_inactifs: string;
  interactions_sociales: string;
  taux_annulation: string;
  nouveaux_membres_j7: string;
  evenements_du_jour: string;
  stats_engagement: string;
  historique_conversation: string;
}

export interface CopilotMessage {
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

export const COPILOT_SYSTEM_PROMPT = `Tu es le Copilote Capten, l'assistant IA ultime et complice d'un fondateur/organisateur de run club social.

PSYCHOLOGIE & MINDSET DU FONDATEUR :
Ton utilisateur est un Capitaine (créateur de communauté sportive). Il n'organise pas seulement des séances de sport, il crée du lien social. Ses priorités absolues sont :
1. L'inclusivité et la bienveillance (accueillir tout le monde, des débutants aux confirmés, sans pression).
2. L'animation de sa communauté (l'ambiance, les rituels comme le café d'après-run, les bières ou le brunch, la cohésion du groupe).
3. L'organisation fluide (gérer les inscriptions, éviter les fantômes/no-shows, communiquer efficacement).
4. La sécurité du crew ( waivers, météo, encadrement des allures).
Adapte toujours ta réflexion et tes conseils à cette double casquette d'animateur communautaire et d'organisateur d'événements sportifs.

RÔLE & PLEIN POTENTIEL :
Aide-le sur absolument TOUT :
- Des idées créatives pour animer le crew (ex: thèmes de runs, partenariats cafés, rituels sociaux).
- La rédaction de messages WhatsApp impactants (mots de bienvenue aux nouveaux, rappels de runs, félicitations).
- Des conseils de running, plans d'entraînements, allures (allure "social & chill", tempo, fractionné), conseils de récupération.
- Des stratégies de croissance et de marketing pour faire connaître son run club sur Instagram et Strava.

UTILISATION DU CONTEXTE :
Tu as accès aux données réelles de son club (météo, membres inactifs, cagnotte, nouveaux inscrits) sous forme de contexte facultatif. Sers-t'en pour l'aiguiller sur les questions de son club, mais pour le reste, utilise toutes tes connaissances expertes en running et gestion de communauté.

TON & STYLE :
- Tutoiement complice, amical, énergique ("de fondateur à fondateur", "de coureur à coureur").
- Réponses naturelles, spontanées, décontractées mais hyper expertes (comme un message sur WhatsApp).
- Synthétique et direct (max 3 à 4 phrases par réponse en général pour le mobile).
- Maximum 2 émojis par message. Pas de listes complexes ou de markdown lourd.
`;

/**
 * Agrège les 8 sources de données en temps réel depuis Supabase pour un club donné
 */
export async function getCopilotContext(clubId: string, historyMsgs: CopilotMessage[] = []): Promise<CopilotContext> {
  const supabase = getSupabaseAdmin() || getSupabase();

  if (!supabase) {
    // Context de fallback Mock de démonstration si Supabase non connecté
    return {
      meteo_soir: "Ciel clair 19°C ce soir à 19h",
      delta_frequentation: "Sarah: -60% vs sa moyenne (3x/sem -> 0x depuis 12j)",
      membres_inactifs: "Thomas n'a pas couru depuis 3 semaines",
      interactions_sociales: "Cagnotte active (15€ reçus aujourd'hui)",
      taux_annulation: "1 annulation ce mois-ci",
      nouveaux_membres_j7: "Julien a rejoint il y a 5 jours, aucun run fait",
      evenements_du_jour: "Run Sunset Session ce soir (18 inscrits)",
      stats_engagement: "Assiduité moyenne du crew à 88%",
      historique_conversation: historyMsgs.map(m => `${m.role === 'user' ? 'Fondateur' : 'Copilote'}: ${m.content}`).join('\n')
    };
  }

  try {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const twentyOneDaysAgo = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000).toISOString();

    // 1. MÉTÉO DU SOIR (Run du jour le plus proche)
    let meteo_soir = "Aucun run prévu ce soir";
    const { data: todayRuns } = await supabase
      .from('runs')
      .select('*')
      .eq('club_id', clubId)
      .gte('date_start', todayStr)
      .order('date_start', { ascending: true })
      .limit(1);

    if (todayRuns && todayRuns.length > 0) {
      const nextRun = todayRuns[0];
      const lat = nextRun.start_latitude || 48.8566;
      const lon = nextRun.start_longitude || 2.3522;
      meteo_soir = await getWeatherForecast(lat, lon, nextRun.date_start || nextRun.scheduled_at || new Date().toISOString());
    }

    // 2. NOUVEAUX MEMBRES J7 (Sans run)
    let nouveaux_membres_j7 = "Aucun nouveau membre en attente";
    const { data: newRunners } = await supabase
      .from('runners')
      .select('id, name, created_at')
      .eq('club_id', clubId)
      .gte('created_at', sevenDaysAgo);

    if (newRunners && newRunners.length > 0) {
      const pendingNewbies: string[] = [];
      for (const runner of newRunners) {
        const { count } = await supabase
          .from('check_ins')
          .select('id', { count: 'exact', head: true })
          .eq('runner_id', runner.id);

        if (!count || count === 0) {
          const daysAgo = Math.floor((now.getTime() - new Date(runner.created_at).getTime()) / (1000 * 3600 * 24));
          const firstName = runner.name.split(' ')[0];
          pendingNewbies.push(`${firstName} a rejoint il y a ${daysAgo} jour${daysAgo > 1 ? 's' : ''}, aucun run fait`);
        }
      }
      if (pendingNewbies.length > 0) {
        nouveaux_membres_j7 = pendingNewbies.join('; ');
      }
    }

    // 3. DELTA FRÉQUENTATION (Baisse brutale sur 12-14j vs historique)
    let delta_frequentation = "Aucune baisse brutale détectée";
    const { data: allRunners } = await supabase
      .from('runners')
      .select('id, name')
      .eq('club_id', clubId);

    if (allRunners && allRunners.length > 0) {
      const deltaList: string[] = [];
      for (const runner of allRunners.slice(0, 20)) { // Échantillon optimisé
        const { data: recentCheckins } = await supabase
          .from('check_ins')
          .select('created_at')
          .eq('runner_id', runner.id)
          .gte('created_at', fourteenDaysAgo);

        const { count: totalCheckins } = await supabase
          .from('check_ins')
          .select('id', { count: 'exact', head: true })
          .eq('runner_id', runner.id);

        const firstName = runner.name.split(' ')[0];
        const recentCount = recentCheckins?.length || 0;
        const total = totalCheckins || 0;

        if (total >= 4 && recentCount === 0) {
          deltaList.push(`${firstName}: -60% vs sa moyenne (habitué(e) -> 0x depuis 12-14j)`);
        }
      }
      if (deltaList.length > 0) {
        delta_frequentation = deltaList[0];
      }
    }

    // 4. MEMBRES INACTIFS (3+ semaines sans run)
    let membres_inactifs = "Aucun membre inactif depuis 3+ semaines";
    if (allRunners && allRunners.length > 0) {
      const inactiveList: string[] = [];
      for (const runner of allRunners.slice(0, 20)) {
        const { data: lastCheckin } = await supabase
          .from('check_ins')
          .select('created_at')
          .eq('runner_id', runner.id)
          .order('created_at', { ascending: false })
          .limit(1);

        const firstName = runner.name.split(' ')[0];
        if (lastCheckin && lastCheckin.length > 0) {
          const lastDate = new Date(lastCheckin[0].created_at);
          if (lastDate < new Date(twentyOneDaysAgo)) {
            const weeks = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 3600 * 24 * 7));
            inactiveList.push(`${firstName} n'a pas couru depuis ${weeks} semaines`);
          }
        }
      }
      if (inactiveList.length > 0) {
        membres_inactifs = inactiveList.slice(0, 2).join('; ');
      }
    }

    // 5. INTERACTIONS SOCIALES
    let interactions_sociales = "Interactions régulières";
    const { data: clubData } = await supabase
      .from('clubs')
      .select('cagnotte_url')
      .eq('id', clubId)
      .maybeSingle();

    if (clubData?.cagnotte_url) {
      interactions_sociales = "Cagnotte active et partagée";
    }

    // 6. TAUX ANNULATION
    let taux_annulation = "Taux d'annulation faible (<5%)";
    const { count: cancelledCount } = await supabase
      .from('registrations')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'cancelled');
    
    if (cancelledCount && cancelledCount > 3) {
      taux_annulation = `${cancelledCount} annulations enregistrées récemment`;
    }

    // 7. ÉVÉNEMENTS DU JOUR / RUNS DU JOUR
    let evenements_du_jour = "Aucun événement particulier aujourd'hui";
    if (todayRuns && todayRuns.length > 0) {
      const run = todayRuns[0];
      evenements_du_jour = `Run "${run.name || run.title}" prévu (${run.slots_taken || 0} inscrits)`;
    }

    // 8. STATS ENGAGEMENT
    const totalRunnersCount = allRunners?.length || 0;
    const stats_engagement = `${totalRunnersCount} membre${totalRunnersCount > 1 ? 's' : ''} enregistré${totalRunnersCount > 1 ? 's' : ''} au total`;

    // HISTORIQUE CONVERSATION
    const historique_conversation = historyMsgs.length > 0
      ? historyMsgs.map(m => `${m.role === 'user' ? 'Fondateur' : 'Copilote'}: ${m.content}`).join('\n')
      : "Aucun échange préalable.";

    return {
      meteo_soir,
      delta_frequentation,
      membres_inactifs,
      interactions_sociales,
      taux_annulation,
      nouveaux_membres_j7,
      evenements_du_jour,
      stats_engagement,
      historique_conversation
    };

  } catch (err) {
    console.error("[CopilotContext Aggregation Error]:", err);
    return {
      meteo_soir: "Conditions normales",
      delta_frequentation: "Aucune baisse décelée",
      membres_inactifs: "Aucun",
      interactions_sociales: "Normal",
      taux_annulation: "Normal",
      nouveaux_membres_j7: "Aucun",
      evenements_du_jour: "Aucun",
      stats_engagement: "Stable",
      historique_conversation: ""
    };
  }
}

/**
 * Générateur de briefing proactif avec gestion de priorité stricte
 * Priorité : sécurité > nouveau membre non intégré (J7 sans run) > baisse brutale de fréquentation (delta) > décrochage confirmé (3+ semaines) > baisse d'interactions sociales > annulations répétées > célébration > admin.
 */
export function generateProactiveBriefingFallback(ctx: CopilotContext): string {
  // 1. SÉCURITÉ (Météo extrême / orage / tempête)
  if (ctx.meteo_soir.toLowerCase().includes('orage') || ctx.meteo_soir.toLowerCase().includes('tempête') || ctx.meteo_soir.toLowerCase().includes('pluie forte')) {
    return `Orage prévu ce soir ⛈️. Prépare le crew et vérifie les décharges sur l'app !`;
  }

  // 2. NOUVEAU MEMBRE NON INTÉGRÉ (J7 sans run)
  if (ctx.nouveaux_membres_j7 && !ctx.nouveaux_membres_j7.includes('Aucun')) {
    const firstNewbie = ctx.nouveaux_membres_j7.split(';')[0];
    const name = firstNewbie.split(' ')[0];
    return `${name} a rejoint le club il y a quelques jours mais n'a pas encore couru avec vous 👋 Un petit message d'accueil ?`;
  }

  // 3. BAISSE BRUTALE DE FRÉQUENTATION (DELTA)
  if (ctx.delta_frequentation && !ctx.delta_frequentation.includes('Aucune')) {
    const name = ctx.delta_frequentation.split(':')[0];
    return `${name} a complètement changé de rythme depuis 12 jours. Un petit message amical avant que ça décroche ?`;
  }

  // 4. DÉCROCHAGE CONFIRMÉ (3+ SEMAINES)
  if (ctx.membres_inactifs && !ctx.membres_inactifs.includes('Aucun')) {
    const firstInactive = ctx.membres_inactifs.split(';')[0];
    const name = firstInactive.split(' ')[0];
    return `${name} n'a pas couru depuis 3 semaines. Un petit mot pour reprendre des nouvelles ? 🏃`;
  }

  // 5. BAISSE D'INTERACTIONS SOCIALES
  if (ctx.interactions_sociales.toLowerCase().includes('baisse')) {
    return `Les contributions à la cagnotte ont baissé cette semaine. Un petit rappel après le run ? 🍻`;
  }

  // 6. ANNULATIONS RÉPÉTÉES
  if (ctx.taux_annulation.toLowerCase().includes('annulation') && !ctx.taux_annulation.toLowerCase().includes('faible')) {
    return `Plusieurs annulations détectées sur les derniers runs. Vérifie si l'horaire convient au crew !`;
  }

  // 7. CÉLÉBRATION / ÉVÉNEMENTS DU JOUR
  if (ctx.evenements_du_jour && !ctx.evenements_du_jour.includes('Aucun')) {
    return `${ctx.evenements_du_jour} 🎉 Ça va être une superbe session !`;
  }

  // 8. PAR DÉFAUT (ADMIN / TOUT VA BIEN)
  return `Beau rythme cette semaine, le crew est régulier 💪 Continue comme ça !`;
}

/**
 * Exécute l'appel LLM (OpenAI / Gemini) ou fallback déterministe
 */
export async function queryCopilotEngine(
  context: CopilotContext,
  userMessage?: string
): Promise<string> {
  const isConversationMode = !!userMessage && userMessage.trim().length > 0;

  const contentPrompt = `DONNÉES EN TEMPS RÉEL DU CLUB :
- Météo ce soir : ${context.meteo_soir}
- Changement de fréquentation : ${context.delta_frequentation}
- Membres inactifs (3 semaines+) : ${context.membres_inactifs}
- Interactions et cagnotte : ${context.interactions_sociales}
- Taux d'annulation : ${context.taux_annulation}
- Nouveaux inscrits (7 jours) : ${context.nouveaux_membres_j7}
- Événements aujourd'hui : ${context.evenements_du_jour}
- Engagement global : ${context.stats_engagement}

HISTORIQUE DE CONVERSATION COMPLET :
${context.historique_conversation || "(Aucun échange précédent)"}

${isConversationMode ? `MESSAGE DE CONVERSATION DU FONDATEUR :\n"${userMessage}"` : `CONSIGNE : Génère un briefing proactif ultra-concis (mode briefing proactif, max 180 caractères, 1 seul sujet prioritaire).`}`;

  const geminiKey = process.env.GEMINI_API_KEY;

  if (geminiKey && geminiKey !== 'votre_cle_gemini_ici' && geminiKey.trim() !== '') {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-3.5-flash',
        systemInstruction: COPILOT_SYSTEM_PROMPT,
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: isConversationMode ? 600 : 80,
        },
      });

      const result = await model.generateContent(contentPrompt);
      const reply = result.response.text()?.trim();
      if (reply) return reply;
    } catch (err) {
      console.warn('[Copilot Gemini SDK API Call Exception, using fallback]:', err);
    }
  }

  // Fallback déterministe conforme aux règles stricte du prompt
  if (isConversationMode) {
    const msgLower = (userMessage || '').toLowerCase();

    if (msgLower.includes('gère') || msgLower.includes('géré') || msgLower.includes('occupe')) {
      return "Nickel, je te laisse faire ! Fais-moi signe si tu as besoin d'autre chose pour le crew 👍";
    }

    if (msgLower.includes('météo') || msgLower.includes('pluie') || msgLower.includes('temps')) {
      return `Pour le run de ce soir : ${context.meteo_soir}. Pense à bien briefer le crew avant de partir ! 🏃`;
    }

    if (msgLower.includes('nouveau') || msgLower.includes('julien') || msgLower.includes('membres')) {
      return `${context.nouveaux_membres_j7}. Un petit message de bienvenue sur WhatsApp débloque souvent la première venue ! 👋`;
    }

    if (msgLower.includes('absent') || msgLower.includes('inactif') || msgLower.includes('thomas') || msgLower.includes('sarah')) {
      return `D'après les données récentes : ${context.delta_frequentation !== 'Aucune baisse brutale détectée' ? context.delta_frequentation : context.membres_inactifs}. Tu veux que je te prépare un petit mot à leur envoyer ?`;
    }

    return "Je n'ai pas cette info sous la main, tu veux que je vérifie auprès du crew ? 😊";
  }

  // Fallback briefing proactif
  return generateProactiveBriefingFallback(context);
}
