import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function ub(supabase: ReturnType<typeof createAdminClient>, table: string): any {
  return supabase.from(table as Parameters<ReturnType<typeof createAdminClient>["from"]>[0]);
}

// Cron quotidien (vercel.json : 0 1 * * *).
//  1) Marque « terminé » les runs publiés dont la date est passée.
//  2) Runs récurrents : crée automatiquement la prochaine occurrence (+7 j,
//     même heure/lieu), publiée. Le parent perd son flag pour ne pas régénérer
//     → chaîne : chaque occurrence en engendre exactement une suivante.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return Response.json({ ok: false, error: "admin client unavailable" }, { status: 500 });
  }

  const nowIso = new Date().toISOString();

  // Runs publiés déjà passés
  const { data: past } = await ub(admin, "events")
    .select("*")
    .eq("status", "published")
    .lt("event_date", nowIso);

  const rows = (past as any[]) || [];
  let closed = 0;
  let spawned = 0;

  for (const ev of rows) {
    // 1) Clôture
    await ub(admin, "events").update({ status: "completed" }).eq("id", ev.id);
    closed++;

    // 2) Récurrence
    if (ev.is_recurring) {
      // Anti-doublon : ne rien créer si un run futur du même crew/titre existe déjà
      const { data: dup } = await ub(admin, "events")
        .select("id")
        .eq("club_id", ev.club_id)
        .eq("title", ev.title)
        .gte("event_date", nowIso)
        .limit(1);

      if (!dup || (dup as any[]).length === 0) {
        const next = new Date(ev.event_date);
        next.setDate(next.getDate() + 7); // même jour de semaine, même heure, +7 j

        await ub(admin, "events").insert({
          club_id: ev.club_id,
          created_by: ev.created_by,
          title: ev.title,
          description: ev.description,
          event_date: next.toISOString(),
          meeting_point_address: ev.meeting_point_address,
          meeting_point_lat: ev.meeting_point_lat,
          meeting_point_lng: ev.meeting_point_lng,
          max_participants: ev.max_participants,
          distance_km: ev.distance_km,
          checkin_radius_meters: ev.checkin_radius_meters,
          is_recurring: true,
          status: "published",
        });
        spawned++;
      }

      // Le parent ne doit plus régénérer (la suivante porte le flag)
      await ub(admin, "events").update({ is_recurring: false }).eq("id", ev.id);
    }
  }

  return Response.json({ ok: true, closed, spawned });
}
