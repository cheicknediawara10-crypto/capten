import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { detectAlertsForClub, alertsToRows } from "@/lib/copilote/detectors";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Cron quotidien (vercel.json : 0 2 * * *). Détecte les alertes de TOUS les
// crews et les upsert (ignoreDuplicates → ne réveille pas les alertes traitées).
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return Response.json({ ok: false, error: "admin client unavailable" }, { status: 500 });
  }

  const { data: clubs } = await admin.from("clubs").select("id");
  let alerts = 0;

  for (const c of (clubs || []) as { id: string }[]) {
    try {
      const cands = await detectAlertsForClub(admin, { id: c.id });
      if (cands.length) {
        const rows = alertsToRows(c.id, cands);
        await admin
          .from("copilot_alerts")
          .upsert(rows as any, { onConflict: "club_id,dedup_key", ignoreDuplicates: true });
        alerts += rows.length;
      }
    } catch (e) {
      console.error("copilot-detection club error", c.id, e);
    }
  }

  return Response.json({ ok: true, clubs: clubs?.length || 0, alerts });
}
