import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { detectAlertsForClub, alertsToRows } from "@/lib/copilote/detectors";
import { isOnTrial, trialDaysLeft } from "@/lib/plan-access";
import { sendTrialEndingEmail } from "@/lib/copilote/trial-email";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Cron quotidien (vercel.json : 0 2 * * *). (1) Détecte les alertes de TOUS les
// crews. (2) Envoie 1× l'email de fin d'essai aux crews à J-2/J-1 de leur essai.
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

  const { data: clubs } = await admin
    .from("clubs")
    .select("id, owner_id, created_at, stripe_plan, stripe_subscription_status, plan, whatsapp_display_name, name");
  let alerts = 0;
  let emails = 0;

  for (const c of (clubs || []) as any[]) {
    // ── (1) Détection des alertes ──
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

    // ── (2) Rappel de fin d'essai (J-2 / J-1), une seule fois ──
    try {
      if (isOnTrial(c)) {
        const dl = trialDaysLeft(c);
        if (dl === 1 || dl === 2) {
          // Marqueur anti-doublon : n'envoie que si la ligne est nouvellement insérée.
          const { data: marker } = await admin
            .from("copilot_alerts")
            .upsert(
              {
                club_id: c.id,
                category: "admin",
                priority: 3,
                title: "Rappel fin d'essai envoyé",
                message: "trial-email",
                dedup_key: `trial_email_${c.id}`,
                status: "done",
              } as any,
              { onConflict: "club_id,dedup_key", ignoreDuplicates: true }
            )
            .select("id");
          if (marker && (marker as any[]).length > 0) {
            const { data: userRes } = await admin.auth.admin.getUserById(c.owner_id || c.id);
            const email = userRes?.user?.email;
            if (email) {
              const crewName = c.whatsapp_display_name || c.name || "ton crew";
              if (await sendTrialEndingEmail(email, crewName, dl)) emails += 1;
            }
          }
        }
      }
    } catch (e) {
      console.error("trial-email club error", c.id, e);
    }
  }

  return Response.json({ ok: true, clubs: clubs?.length || 0, alerts, emails });
}
