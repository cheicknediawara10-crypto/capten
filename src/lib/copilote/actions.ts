"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthenticatedCaptainId } from "@/lib/auth-server";
import { hasProAccess } from "@/lib/plan-access";
import { detectAlertsForClub, alertsToRows } from "@/lib/copilote/detectors";
import { fetchCrewContext } from "@/lib/copilote/context";
import { generateCopiloteMessage, type CopiloteIntent } from "@/lib/ai/copilote";

function ub(supabase: ReturnType<typeof createAdminClient>, table: string): any {
  return supabase.from(table as Parameters<ReturnType<typeof createAdminClient>["from"]>[0]);
}

const DAILY_LIMIT = 20;
const VALID: CopiloteIntent[] = ["annonce", "motivation", "mot", "situation", "libre"];

/** État du Copilote : accès Pro + alertes actives (détection lancée côté serveur). */
export async function getCopiloteState(): Promise<{ isPro: boolean; alerts: any[] } | { error: string }> {
  const club_id = await getAuthenticatedCaptainId();
  if (!club_id) return { error: "unauth" };
  let sb: ReturnType<typeof createAdminClient>;
  try { sb = createAdminClient(); } catch { return { error: "Service indisponible." }; }

  const { data: club } = await ub(sb, "clubs").select("*").eq("id", club_id).maybeSingle();
  if (!hasProAccess(club as any)) return { isPro: false, alerts: [] };

  try {
    const cands = await detectAlertsForClub(sb as any, { id: club_id });
    if (cands.length) {
      await ub(sb, "copilot_alerts").upsert(alertsToRows(club_id, cands), {
        onConflict: "club_id,dedup_key",
        ignoreDuplicates: true,
      });
    }
  } catch { /* détection best-effort */ }

  const { data: alerts } = await ub(sb, "copilot_alerts")
    .select("id, category, priority, title, message, cta_label, cta_href")
    .eq("club_id", club_id)
    .eq("status", "new")
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order("priority", { ascending: true })
    .order("created_at", { ascending: false });

  return { isPro: true, alerts: (alerts as any[]) || [] };
}

export async function resolveCopiloteAlert(id: string, status: "done" | "dismissed"): Promise<{ ok: true } | { error: string }> {
  const club_id = await getAuthenticatedCaptainId();
  if (!club_id) return { error: "unauth" };
  let sb: ReturnType<typeof createAdminClient>;
  try { sb = createAdminClient(); } catch { return { error: "Service indisponible." }; }
  const { data: al } = await ub(sb, "copilot_alerts").select("club_id").eq("id", id).maybeSingle();
  if (!al || (al as any).club_id !== club_id) return { error: "not_found" };
  await ub(sb, "copilot_alerts").update({ status }).eq("id", id);
  return { ok: true };
}

/** Compteur d'utilisation IA du jour (pour l'affichage X/20). */
export async function getCopiloteUsage(): Promise<{ used: number; limit: number }> {
  const club_id = await getAuthenticatedCaptainId();
  if (!club_id) return { used: 0, limit: DAILY_LIMIT };
  let sb: ReturnType<typeof createAdminClient>;
  try { sb = createAdminClient(); } catch { return { used: 0, limit: DAILY_LIMIT }; }
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await ub(sb, "copilot_ai_usage").select("count").eq("club_id", club_id).eq("day", today).maybeSingle();
  return { used: ((data as any)?.count as number) || 0, limit: DAILY_LIMIT };
}

/** Génération d'un message par l'IA (gating Pro + plafond journalier). Auth par cookies. */
export async function generateCopilote(intent: string, input: string): Promise<
  { text: string; used: number; limit: number } | { error: "unauthorized" | "no_club" | "locked" | "limit" | "server"; used?: number; limit?: number }
> {
  const club_id = await getAuthenticatedCaptainId();
  if (!club_id) return { error: "unauthorized" };
  let sb: ReturnType<typeof createAdminClient>;
  try { sb = createAdminClient(); } catch { return { error: "server" }; }

  const { data: club } = await ub(sb, "clubs")
    .select("id, whatsapp_display_name, name, stripe_plan, stripe_subscription_status, plan, created_at")
    .eq("id", club_id).maybeSingle();
  if (!club) return { error: "no_club" };
  if (!hasProAccess(club as any)) return { error: "locked" };

  const crewName = ((club as any).whatsapp_display_name || (club as any).name || "Le crew") as string;
  const today = new Date().toISOString().slice(0, 10);
  const { data: usage } = await ub(sb, "copilot_ai_usage").select("count").eq("club_id", club_id).eq("day", today).maybeSingle();
  const used = ((usage as any)?.count as number) || 0;
  if (used >= DAILY_LIMIT) return { error: "limit", used, limit: DAILY_LIMIT };

  const it = (VALID.includes(intent as CopiloteIntent) ? intent : "libre") as CopiloteIntent;
  let context;
  try { context = await fetchCrewContext(sb as any, club_id); } catch { context = undefined; }

  const { text, aiUsed } = await generateCopiloteMessage({ intent: it, input: String(input || "").slice(0, 600), crewName, context });

  let newUsed = used;
  if (aiUsed) {
    newUsed = used + 1;
    await ub(sb, "copilot_ai_usage").upsert({ club_id, day: today, count: newUsed }, { onConflict: "club_id,day" });
  }
  return { text, used: newUsed, limit: DAILY_LIMIT };
}
