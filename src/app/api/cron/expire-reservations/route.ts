import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { promoteNextInWaitlist } from "@/lib/evenements/actions";
import { sendExpiredReservationEmail } from "@/lib/evenements/emails";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function ub(supabase: ReturnType<typeof createAdminClient>, table: string): any {
  return supabase.from(table as Parameters<ReturnType<typeof createAdminClient>["from"]>[0]);
}

/**
 * Cron quotidien / horaire de libération des réservations non payées après 48h.
 * 1. Identifie les inscriptions expirées (confirme_par_coureur = false ET expires_at < now()).
 * 2. Envoie l'email d'expiration au coureur.
 * 3. Supprime la réservation pour libérer la place.
 * 4. Promeut automatiquement le premier coureur sur la liste d'attente.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    return Response.json({ ok: false, error: "admin client unavailable" }, { status: 500 });
  }

  const nowIso = new Date().toISOString();

  // Inscriptions expirées dans la jauge principale sans confirmation
  const { data: expiredList } = await ub(admin, "event_inscriptions")
    .select("*, events(title, event_date)")
    .is("position_liste_attente", null)
    .eq("confirme_par_coureur", false)
    .eq("confirme_par_fondateur", false)
    .lt("expires_at", nowIso);

  const expired = (expiredList as any[]) || [];
  let expiredCount = 0;
  let promotedCount = 0;

  for (const ins of expired) {
    const eventId = ins.event_id;

    // 1. Envoyer l'email d'expiration
    if (ins.email) {
      const formattedDate = new Date(ins.events?.event_date || Date.now()).toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
      await sendExpiredReservationEmail({
        to: ins.email,
        prenom: ins.prenom,
        runTitle: ins.events?.title || "Run Événement",
        eventDate: formattedDate,
      });
    }

    // 2. Supprimer la réservation
    await ub(admin, "event_inscriptions").delete().eq("id", ins.id);
    expiredCount++;

    // 3. Promouvoir le premier coureur sur liste d'attente
    const { promoted } = await promoteNextInWaitlist(eventId);
    if (promoted) promotedCount++;
  }

  return Response.json({ ok: true, expired: expiredCount, promoted: promotedCount });
}
