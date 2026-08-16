// ─── COPILOTE — Rédaction IA (le SEUL fichier qui appelle Gemini) ────────────
// Garde-fou hors-sujet dans le prompt · fallback templates si l'IA est absente
// ou en panne · zéro donnée sensible (juste prénoms + faits d'activité).

import { GoogleGenerativeAI } from "@google/generative-ai";

// gemini-2.0-flash a été déprécié (404 "no longer available"). 2.5-flash est GA,
// rapide et pas cher. Repli possible : "gemini-flash-latest" (alias toujours à jour).
const MODEL = "gemini-2.5-flash";

export type CopiloteIntent = "annonce" | "motivation" | "mot" | "situation" | "libre";

export interface GenerateInput {
  intent: CopiloteIntent;
  input: string; // ce que le fondateur décrit (texte libre)
  crewName: string;
}

const SYSTEM = `Tu es le Copilote de CAPTEN, l'assistant d'un fondateur de run club (son "crew").
Règles STRICTES :
- Français, tutoiement, vocabulaire "run" et "crew" (JAMAIS "club" ni "course").
- Ton chaleureux, direct, esprit "zéro pression, tous niveaux".
- Pour un message à envoyer : court (2-5 lignes), prêt à copier-coller dans WhatsApp, 1 ou 2 emojis max, pas de blabla, pas de hashtags. Ne mets pas de guillemets autour.
- Pour un conseil de situation : 3-4 phrases concrètes et bienveillantes, pas un message tout fait.
- Tu restes STRICTEMENT sur le running et la gestion d'un crew (runs, membres, sécurité, motivation, orga).
- Si la demande est hors-sujet (recette, code, actu, etc.), réponds EXACTEMENT : "Je suis ton Copilote running — je t'aide sur ton crew, tes runs, tes membres. Reformule ta demande 🏃".
- N'invente pas de faits (dates, chiffres, noms) non fournis.`;

function userPrompt({ intent, input, crewName }: GenerateInput): string {
  const ctx = `Crew : « ${crewName} ».`;
  switch (intent) {
    case "annonce":
      return `${ctx}\nÉcris un message WhatsApp à envoyer au crew. Sujet : ${input || "un mot pour le crew"}.`;
    case "motivation":
      return `${ctx}\nÉcris un message WhatsApp pour remotiver le crew / relancer la dynamique. Contexte : ${input || "baisse d'activité"}.`;
    case "mot":
      return `${ctx}\nÉcris un message WhatsApp court et chaleureux pour : ${input || "accueillir un nouveau membre"}.`;
    case "situation":
      return `${ctx}\nDonne-moi un conseil concret (pas un message tout fait) pour gérer cette situation : ${input || "un souci d'organisation"}.`;
    default:
      return `${ctx}\nDemande du fondateur : ${input}`;
  }
}

// Templates de secours (IA absente / en panne) — restent utiles, jamais bloquants.
function fallback({ intent, input, crewName }: GenerateInput): string {
  const c = crewName || "Le crew";
  switch (intent) {
    case "annonce":
      return `${c} 📣\n${input || "Petit mot pour le crew."}\nOn se retrouve très vite 🖤`;
    case "motivation":
      return `${c} ⚡\nLa semaine a été calme ? C'est exactement pour ça qu'on se retrouve. On lance un run — qui est chaud ? 🖤`;
    case "mot":
      return `Salut ! 👋\n${input || "Content de te compter dans le crew."}\nÀ très vite sur un run 🖤`;
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
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { text: fallback(g), aiUsed: false };
  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: MODEL, systemInstruction: SYSTEM });
    const result = await model.generateContent(userPrompt(g));
    const text = (result.response.text() || "").trim();
    if (!text) return { text: fallback(g), aiUsed: false };
    return { text, aiUsed: true };
  } catch (e) {
    console.error("Gemini copilote error", e);
    return { text: fallback(g), aiUsed: false };
  }
}
