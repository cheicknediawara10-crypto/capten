// ─── COPILOTE — Rédaction IA (le SEUL fichier qui appelle Gemini) ────────────
// Garde-fou hors-sujet dans le prompt · fallback templates si l'IA est absente
// ou en panne · zéro donnée sensible (juste prénoms + faits d'activité).

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { CrewContext } from "@/lib/copilote/context";

// gemini-2.0-flash a été déprécié (404 "no longer available"). 2.5-flash est GA,
// rapide et pas cher. Repli possible : "gemini-flash-latest" (alias toujours à jour).
const MODEL = "gemini-2.5-flash";

export type CopiloteIntent =
  | "annonce"
  | "motivation"
  | "mot"
  | "situation"
  | "libre"
  | "weather"
  | "safety"
  | "afterrun"
  | "shorter"
  | "fun";

export interface GenerateInput {
  intent: CopiloteIntent;
  input: string; // ce que le fondateur décrit (texte libre ou message précédent)
  crewName: string;
  context?: CrewContext; // faits d'activité du crew, pour personnaliser
}

// Bloc de contexte : l'IA l'utilise si pertinent, sans réciter les chiffres.
function contextBlock(ctx?: CrewContext): string {
  if (!ctx) return "";
  const facts: string[] = [];
  if (ctx.activeMembers) facts.push(`${ctx.activeMembers} membres actifs`);
  if (ctx.nextRunTitle) facts.push(`prochain run : « ${ctx.nextRunTitle} »${ctx.nextRunDate ? ` (${ctx.nextRunDate})` : ""}`);
  if (ctx.lastRunTitle) facts.push(`dernier run : « ${ctx.lastRunTitle} »${ctx.lastRunDate ? ` (${ctx.lastRunDate})` : ""}${ctx.lastRunCount != null ? `, ${ctx.lastRunCount} présents` : ""}`);
  if (ctx.iceRate != null) facts.push(`fiches ICE remplies à ${ctx.iceRate}%`);
  if (!facts.length) return "";
  return `\n\nContexte du crew (utilise UNIQUEMENT ce qui est pertinent pour ce message, intègre-le naturellement sans lister les stats, n'invente aucun autre chiffre) :\n- ${facts.join("\n- ")}`;
}

const SYSTEM = `Tu es le Copilote de CAPTEN, l'expert running, coach sportif et co-fondateur intelligent des communautés sportives (Run Clubs, Walk Clubs, Trail).

Tes 5 domaines d'expertise absolue :
1. COACHING SPORTIF & ENTRAÎNEMENT : Échauffements articulaires dynamiques (5-7 min), allures (5:00, 5:45, 6:30, débutants), fractionné urbain/ludique, séances de côtes, sorties longues, étirements et récupération, hydratation et nutrition running.
2. LOGISTIQUE & SÉCURITÉ DE TERRAIN : Rôle des serre-files, gestion d'un peloton de 20 à 200 coureurs en ville (trottoirs, feux, piétons), visibilité de nuit (frontales, fluo), météo extrême (pluie, 0°C, 30°C), premiers réflexes en cas de bobo (repos, glace, entorse) ou appel 15/112.
3. CONVIVIALITÉ & ANIMATION DU CREW : Accueil des débutants pour qu'ils ne se sentent jamais seuls, rituels d'after-run (café, bière de récup au Spot), jeux de cohésion, célébration des paliers de fidélité.
4. COMMUNICATION & VIRALITÉ : Messages WhatsApp percutants et stimulants, accroches pour Stories Instagram, sondages de dates.
5. DÉMARCHES & PARTENARIATS LOCAUX : Comment approcher un bar/café local pour en faire un "Spot du Crew" avec avantage coureur, orga d'after-run sans prise de tête.

RÈGLES D'OR DE RÉPONSE :
- Langue : Français, tutoiement naturel, ton énergique, bienveillant et décomplexé ("zéro pression, esprit crew").
- VOCABULAIRE AUTHENTIQUE : "crew", "run", "allure", "sas", "serre-file", "ravito", "spot", "after-run".
- ADAPTATION DU FORMAT :
  * Si la demande est un MESSAGE À ENVOYER (annonce, rappel, météo, bienvenue) : Réponds directement avec le message WhatsApp prêt à copier (2 à 5 lignes max, 1 ou 2 emojis, zéro guillemets, direct et percutant).
  * Si la demande est un CONSEIL, UNE QUESTION ou UNE SITUATION (échauffement, orga, litige, partenariat bar, sécu) : Réponds avec 3 à 4 points concrets, numérotés et immédiatement actionnables sur le terrain.
- Tu réponds TOUJOURS avec pertinence, pragmatisme et sans blabla théorique inutile.`;

function userPrompt({ intent, input, crewName }: GenerateInput): string {
  const ctx = `Crew : « ${crewName} ».`;
  switch (intent) {
    case "annonce":
      return `${ctx}\nÉcris un message WhatsApp direct et motivant pour annoncer la prochaine sortie du crew. ${input ? `Précisions : ${input}` : "Rappelle l'esprit tous niveaux, l'allure et le point de RDV."}`;
    case "weather":
      return `${ctx}\nÉcris un message WhatsApp motivant et décomplexé pour maintenir le run malgré la météo (pluie, froid ou vent). Donne le sourire et rappelle les conseils vestimentaires. ${input ? `Détails : ${input}` : ""}`;
    case "safety":
      return `${ctx}\nÉcris un rappel WhatsApp bienveillant sur la sécurité en peloton urbain (respect des feux, trottoirs, priorité piétons, présence du serre-file à l'arrière). ${input ? `Détails : ${input}` : ""}`;
    case "afterrun":
      return `${ctx}\nÉcris un message WhatsApp convivial pour annoncer le bar / spot où le crew se retrouve après le run pour boire un verre ensemble. ${input ? `Détails : ${input}` : ""}`;
    case "mot":
      return `${ctx}\nÉcris un mot d'accueil WhatsApp chaleureux et personnalisé pour accueillir les nouveaux arrivants dans le crew. ${input ? `Détails : ${input}` : ""}`;
    case "motivation":
      return `${ctx}\nÉcris un message WhatsApp pour relancer l'énergie du crew. ${input || "Donne envie de chausser les baskets ce soir."}`;
    case "shorter":
      return `${ctx}\nRaccourcis ce texte en 2 ou 3 lignes percutantes et directes pour WhatsApp :\n« ${input} »`;
    case "fun":
      return `${ctx}\nRéécris ce texte avec un ton plus énergique, fun et piquant (sans en faire trop) pour booster le crew :\n« ${input} »`;
    case "situation":
      return `${ctx}\nDonne un conseil d'expert concret et immédiatement applicable pour cette question ou situation de crew : ${input || "un souci d'organisation"}.`;
    default:
      return `${ctx}\nDemande du capitaine : ${input}`;
  }
}

// Templates de secours (IA absente / en panne) — restent utiles, jamais bloquants.
function fallback({ intent, input, crewName }: GenerateInput): string {
  const c = crewName || "Le crew";
  switch (intent) {
    case "annonce":
      return `${c} 📣\n${input || "Run habituel cette semaine — tous niveaux, allure tranquille."}\nRDV au point habituel, on part à l'heure 🖤`;
    case "weather":
      return `${c} 🌧️\nLa météo fait des siennes mais le run est maintenu ! Veste légère et bonne humeur — les vrais sont au RDV ce soir ⚡`;
    case "safety":
      return `${c} 🛡️\nPetit rappel sécu pour ce soir : on reste sur les trottoirs, on respecte les feux et le serre-file veille à l'arrière. Personne ne court seul ! 🖤`;
    case "afterrun":
      return `${c} 🍻\nAprès le run et les étirements, direction le Spot du Crew pour décompresser et boire un verre ensemble ! Hâte de vous y voir 🎉`;
    case "motivation":
      return `${c} ⚡\nLa semaine a été calme ? C'est exactement pour ça qu'on se retrouve. On lace les baskets — qui est chaud ce soir ? 🖤`;
    case "mot":
      return `Salut ! 👋\nTrop content de t'avoir parmi nous dans ${c}. Ici zéro pression, que du plaisir partagé. À très vite sur le prochain run 🖤`;
    case "shorter":
      return (input || `${c} : Run ce soir, tous niveaux. RDV au point de départ ! 🖤`).split("\n").slice(0, 2).join("\n");
    case "fun":
      return `🔥 ${c} en feu ce soir !\n${input || "Zéro excuse, on chausse les baskets et on se retrouve au point de départ !"}\nQui est là ? ⚡`;
    case "situation":
      return "Parle-lui en privé, sans jugement : écoute d'abord, puis rappelle l'esprit du crew (zéro pression, on s'adapte à tous les niveaux). Si l'énergie déborde, propose-lui un rôle utile (serre-file, accueil des nouveaux) pour la canaliser.";
    default:
      return `${c}\n${input || ""}`.trim();
  }
}

export interface GenerateResult {
  text: string;
  aiUsed: boolean; // true seulement si Gemini a réellement répondu (pour le compteur)
}

export async function generateCopiloteMessage(g: GenerateInput): Promise<GenerateResult> {
  // Interrupteur "zéro IA" : COPILOTE_AI_ENABLED=false → aucune donnée n'est
  // envoyée à Gemini, on retombe sur les templates locaux. Kill-switch simple
  // et vérifiable pour couper toute sortie vers une IA tierce.
  if (process.env.COPILOTE_AI_ENABLED === "false") {
    return { text: fallback(g), aiUsed: false };
  }
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { text: fallback(g), aiUsed: false };
  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: MODEL, systemInstruction: SYSTEM });
    const result = await model.generateContent(userPrompt(g) + contextBlock(g.context));
    const text = (result.response.text() || "").trim();
    if (!text) return { text: fallback(g), aiUsed: false };
    return { text, aiUsed: true };
  } catch (e) {
    console.error("Gemini copilote error", e);
    return { text: fallback(g), aiUsed: false };
  }
}
