import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { detectAlertsForClub, alertsToRows } from "@/lib/copilote/detectors";
import { isOnTrial, trialDaysLeft } from "@/lib/plan-access";
import { sendTrialEndingEmail } from "@/lib/copilote/trial-email";
import { sendCopiloteBriefEmail } from "@/lib/copilote/brief-email";

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
    .select("id, owner_id, created_at, stripe_plan, stripe_subscription_status, plan, whatsapp_display_name, name, branding");
  let alerts = 0;
  let emails = 0;
  let briefs = 0;
  const nowIso = new Date().toISOString();
  const today = nowIso.slice(0, 10);
  const isMonday = new Date().getDay() === 1;

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

    // ── (3) Brief email (quotidien / hebdo), 1× par jour, si ≥1 alerte ──
    try {
      const freq = (c.branding?.copilot_email_freq as string) || "hebdo"; // défaut : hebdo (anti-spam)
      const shouldSend = freq === "quotidien" || (freq === "hebdo" && isMonday);
      if (shouldSend) {
        const { data: topAlerts } = await admin
          .from("copilot_alerts")
          .select("title, message, cta_label, cta_href")
          .eq("club_id", c.id)
          .eq("status", "new")
          .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
          .order("priority", { ascending: true })
          .order("created_at", { ascending: false })
          .limit(3);
        if (topAlerts && (topAlerts as any[]).length > 0) {
          const { data: marker } = await admin
            .from("copilot_alerts")
            .upsert(
              {
                club_id: c.id,
                category: "admin",
                priority: 3,
                title: "Brief envoyé",
                message: "brief-email",
                dedup_key: `copilot_brief_${c.id}_${today}`,
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
              if (await sendCopiloteBriefEmail(email, crewName, topAlerts as any, freq === "quotidien" ? "quotidien" : "hebdo")) briefs += 1;
            }
          }
        }
      }
    } catch (e) {
      console.error("brief-email club error", c.id, e);
    }
  }

  return Response.json({ ok: true, clubs: clubs?.length || 0, alerts, emails, briefs });
}
