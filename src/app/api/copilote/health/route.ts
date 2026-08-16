import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Diagnostic — NE renvoie JAMAIS la valeur de la clé (les erreurs Gemini n'en contiennent pas).
// GET /api/copilote/health        → { gemini: la variable est-elle lue en prod ? }
// GET /api/copilote/health?test=1 → tente un appel Gemini et renvoie le résultat ou l'erreur exacte.
export async function GET(req: NextRequest) {
  const key = process.env.GEMINI_API_KEY;
  const present = !!key;
  const url = new URL(req.url);
  if (url.searchParams.get("test") !== "1" || !key) {
    return Response.json({ gemini: present });
  }
  const model = url.searchParams.get("model") || "gemini-2.0-flash";
  try {
    const genAI = new GoogleGenerativeAI(key);
    const m = genAI.getGenerativeModel({ model });
    const r = await m.generateContent("Réponds juste OK.");
    return Response.json({ gemini: true, aiWorks: true, model, sample: (r.response.text() || "").slice(0, 40) });
  } catch (e: any) {
    return Response.json({
      gemini: true,
      aiWorks: false,
      model,
      keyPrefix: key.slice(0, 3), // "AIz" ou "AQ." — non sensible, aide au diagnostic
      error: String(e?.message || e).slice(0, 400),
    });
  }
}
