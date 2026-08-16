// ─── COPILOTE — Contexte crew injecté dans le prompt IA ──────────────────────
// Agrégats + faits d'activité uniquement (aucune donnée sensible : ni téléphone,
// ni infos médicales). Sert à personnaliser les messages générés par Gemini.

export interface CrewContext {
  activeMembers?: number;
  nextRunTitle?: string | null;
  nextRunDate?: string | null;
  lastRunTitle?: string | null;
  lastRunDate?: string | null;
  lastRunCount?: number | null;
  iceRate?: number | null; // 0..100
}

const fmt = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }) : null;

export async function fetchCrewContext(supabase: any, clubId: string): Promise<CrewContext> {
  const nowIso = new Date().toISOString();
  const [{ count: active }, nextRes, lastRes, activeMRes] = await Promise.all([
    supabase.from("membre_club").select("*", { count: "exact", head: true }).eq("club_id", clubId).eq("is_active", true),
    supabase.from("events").select("title, event_date").eq("club_id", clubId).eq("status", "published").gte("event_date", nowIso).order("event_date", { ascending: true }).limit(1).maybeSingle(),
    supabase.from("events").select("id, title, event_date").eq("club_id", clubId).eq("status", "completed").order("event_date", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("membre_club").select("membre_id").eq("club_id", clubId).eq("is_active", true),
  ]);

  const next = (nextRes as any)?.data;
  const last = (lastRes as any)?.data;

  let lastRunCount: number | null = null;
  if (last?.id) {
    const { count } = await supabase.from("membre_checkins").select("*", { count: "exact", head: true }).eq("event_id", last.id).eq("is_valid", true);
    lastRunCount = count || 0;
  }

  let iceRate: number | null = null;
  const ids: string[] = (((activeMRes as any)?.data) || []).map((m: any) => m.membre_id).filter(Boolean);
  if (ids.length) {
    const { data: ice } = await supabase.from("membre_ice").select("membre_id").in("membre_id", ids);
    const withIce = new Set((ice || []).map((i: any) => i.membre_id));
    iceRate = Math.round((withIce.size / ids.length) * 100);
  }

  return {
    activeMembers: active || 0,
    nextRunTitle: next?.title || null,
    nextRunDate: fmt(next?.event_date),
    lastRunTitle: last?.title || null,
    lastRunDate: fmt(last?.event_date),
    lastRunCount,
    iceRate,
  };
}
