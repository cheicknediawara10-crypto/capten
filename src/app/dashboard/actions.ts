"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthenticatedCaptainId } from "@/lib/auth-server";

function ub(supabase: ReturnType<typeof createAdminClient>, table: string): any {
  return supabase.from(table as Parameters<ReturnType<typeof createAdminClient>["from"]>[0]);
}

export async function getDashboardData(): Promise<
  {
    memberCount: number; activeCount: number; slug: string | null; upcoming: any[]; sessionCount: number;
    checkinCount: number; weekly: number[]; regulars: number; club: any | null;
  }
  | { error: string }
> {
  const club_id = await getAuthenticatedCaptainId();
  if (!club_id) return { error: "unauth" };
  let sb: ReturnType<typeof createAdminClient>;
  try { sb = createAdminClient(); } catch { return { error: "Service indisponible." }; }

  const [{ data: membreRows }, { data: clubRow }, { data: events }, sessions] = await Promise.all([
    ub(sb, "membre_club").select("membre_id").eq("club_id", club_id).eq("is_active", true),
    ub(sb, "clubs").select("*").eq("id", club_id).maybeSingle(),
    ub(sb, "events").select("id, title, event_date, meeting_point_address")
      .eq("club_id", club_id).eq("status", "published")
      .gte("event_date", new Date().toISOString()).order("event_date").limit(3),
    ub(sb, "events").select("*", { count: "exact", head: true }).eq("club_id", club_id),
  ]);

  const membreIds = ((membreRows as any[]) || []).map((m) => m.membre_id).filter(Boolean);
  let checkinCount = 0;
  const weekly = Array(8).fill(0);
  let regulars = 0;
  let activeCount = 0;

  if (membreIds.length) {
    const eightWeeksAgo = new Date(Date.now() - 8 * 7 * 86400000).toISOString();
    const sixtyDaysAgo = new Date(Date.now() - 60 * 86400000).toISOString();
    
    const [{ data: chk }, { data: actRows }] = await Promise.all([
      ub(sb, "membre_checkins")
        .select("membre_id, checked_in_at")
        .in("membre_id", membreIds).eq("is_valid", true)
        .gte("checked_in_at", eightWeeksAgo),
      ub(sb, "membre_checkins")
        .select("membre_id")
        .in("membre_id", membreIds).eq("is_valid", true)
        .gte("checked_in_at", sixtyDaysAgo),
    ]);

    const rows = ((chk as any[]) || []) as { membre_id: string; checked_in_at: string }[];
    checkinCount = rows.length;
    const now = Date.now();
    const recent = new Set<string>();
    const fourWeeks = now - 4 * 7 * 86400000;
    for (const r of rows) {
      const t = new Date(r.checked_in_at).getTime();
      const wk = Math.floor((now - t) / (7 * 86400000));
      if (wk >= 0 && wk < 8) weekly[7 - wk]++;
      if (t >= fourWeeks) recent.add(r.membre_id);
    }
    regulars = recent.size;

    const activeSet = new Set(((actRows as any[]) || []).map((r) => r.membre_id));
    activeCount = activeSet.size;
  }

  return {
    memberCount: membreIds.length,
    activeCount,
    slug: (clubRow as any)?.slug ?? null,
    upcoming: (events as any[]) || [],
    sessionCount: sessions.count || 0,
    checkinCount,
    weekly,
    regulars,
    club: (clubRow as any) ?? null,
  };
}
