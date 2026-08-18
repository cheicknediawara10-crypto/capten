"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthenticatedCaptainId } from "@/lib/auth-server";

function ub(supabase: ReturnType<typeof createAdminClient>, table: string): any {
  return supabase.from(table as Parameters<ReturnType<typeof createAdminClient>["from"]>[0]);
}

export async function getMyStats(): Promise<
  { members: number; events: number; checkins: number; eventsData: any[]; checkinsData: any[]; club: any | null }
  | { error: string }
> {
  const club_id = await getAuthenticatedCaptainId();
  if (!club_id) return { error: "unauth" };
  let sb: ReturnType<typeof createAdminClient>;
  try { sb = createAdminClient(); } catch { return { error: "Service indisponible." }; }

  const [mc, ec, cc, ed, cd, clubRow] = await Promise.all([
    ub(sb, "membre_club").select("*", { count: "exact", head: true }).eq("club_id", club_id).eq("is_active", true),
    ub(sb, "events").select("*", { count: "exact", head: true }).eq("club_id", club_id),
    ub(sb, "membre_checkins").select("*, events!inner(club_id)", { count: "exact", head: true }).eq("events.club_id", club_id).eq("is_valid", true),
    ub(sb, "events").select("event_date, status").eq("club_id", club_id).order("event_date"),
    ub(sb, "membre_checkins").select("checked_in_at, events!inner(club_id)").eq("events.club_id", club_id).eq("is_valid", true),
    ub(sb, "clubs").select("*").eq("id", club_id).maybeSingle(),
  ]);

  return {
    members: mc.count || 0,
    events: ec.count || 0,
    checkins: cc.count || 0,
    eventsData: (ed.data as any[]) || [],
    checkinsData: (cd.data as any[]) || [],
    club: (clubRow.data as any) ?? null,
  };
}
