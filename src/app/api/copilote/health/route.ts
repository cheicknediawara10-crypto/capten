import { NextRequest } from "next/server";
import { generateCopiloteMessage } from "@/lib/ai/copilote";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Diagnostic — NE renvoie JAMAIS la valeur de la clé.
// GET /api/copilote/health        → { gemini: la variable est-elle lue en prod ? }
// GET /api/copilote/health?test=1 → + { aiWorks: Gemini a-t-il réellement répondu ? }
export async function GET(req: NextRequest) {
  const present = !!process.env.GEMINI_API_KEY;
  const url = new URL(req.url);
  if (url.searchParams.get("test") !== "1") {
    return Response.json({ gemini: present });
  }
  let aiWorks = false;
  try {
    const r = await generateCopiloteMessage({ intent: "annonce", input: "ping de test", crewName: "Test" });
    aiWorks = r.aiUsed;
  } catch {
    aiWorks = false;
  }
  return Response.json({ gemini: present, aiWorks });
}
