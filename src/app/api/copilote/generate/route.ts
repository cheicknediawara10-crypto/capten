import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateCopiloteMessage, type CopiloteIntent } from "@/lib/ai/copilote";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const DAILY_LIMIT = 20;
const VALID: CopiloteIntent[] = ["annonce", "motivation", "mot", "situation", "libre"];

export async function POST(req: NextRequest) {
  // 1. Auth : le client passe son access token Supabase
  const token = (req.headers.get("authorization") || "").replace("Bearer ", "").trim();
  if (!token) return Response.json({ error: "unauthorized" }, { status: 401 });

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return Response.json({ error: "server" }, { status: 500 });
  }

  const { data: userData } = await admin.auth.getUser(token);
  const user = userData?.user;
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  // 2. Club + gating (réservé au plan Capten)
  const { data: club } = await admin
    .from("clubs")
    .select("id, whatsapp_display_name, name, stripe_plan")
    .or(`id.eq.${user.id},owner_id.eq.${user.id}`)
    .limit(1)
    .maybeSingle();
  if (!club) return Response.json({ error: "no_club" }, { status: 404 });
  if (String((club as any).stripe_plan || "").toUpperCase() !== "CAPTEN") {
    return Response.json({ error: "locked" }, { status: 403 });
  }
  const clubId = (club as any).id as string;
  const crewName = ((club as any).whatsapp_display_name || (club as any).name || "Le crew") as string;

  // 3. Plafond journalier
  const today = new Date().toISOString().slice(0, 10);
  const { data: usage } = await admin
    .from("copilot_ai_usage")
    .select("count")
    .eq("club_id", clubId)
    .eq("day", today)
    .maybeSingle();
  const used = ((usage as any)?.count as number) || 0;
  if (used >= DAILY_LIMIT) {
    return Response.json({ error: "limit", used, limit: DAILY_LIMIT }, { status: 429 });
  }

  // 4. Génération
  const body = await req.json().catch(() => ({}));
  const intent = (VALID.includes(body.intent) ? body.intent : "libre") as CopiloteIntent;
  const input = String(body.input || "").slice(0, 600);

  const { text, aiUsed } = await generateCopiloteMessage({ intent, input, crewName });

  // 5. Compteur : on n'incrémente que si l'IA a réellement été appelée
  let newUsed = used;
  if (aiUsed) {
    newUsed = used + 1;
    await admin
      .from("copilot_ai_usage")
      .upsert({ club_id: clubId, day: today, count: newUsed } as any, { onConflict: "club_id,day" });
  }

  return Response.json({ text, used: newUsed, limit: DAILY_LIMIT });
}
