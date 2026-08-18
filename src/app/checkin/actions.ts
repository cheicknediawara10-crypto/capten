"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getMembreSession } from "@/lib/membre-session";
import { hasProAccess } from "@/lib/plan-access";
import { isWithinRadius } from "@/lib/utils/geo";

function ub(supabase: ReturnType<typeof createAdminClient>, table: string): any {
  return supabase.from(table as Parameters<ReturnType<typeof createAdminClient>["from"]>[0]);
}

export interface CheckinContext {
  event: { id: string; title: string; meeting_point_lat: number | null; meeting_point_lng: number | null; checkin_radius_meters: number };
  gpsEnabled: boolean;
  membreId: string | null;
  membreName: string | null;
}

/** Contexte public de la page check-in : le run, le GPS (feature Pro du club),
 *  et si un membre est déjà identifié (session PIN). */
export async function getCheckinContext(eventId: string): Promise<CheckinContext | { error: string }> {
  let sb: ReturnType<typeof createAdminClient>;
  try { sb = createAdminClient(); } catch { return { error: "Service indisponible." }; }

  const { data: ev } = await ub(sb, "events")
    .select("id, title, meeting_point_lat, meeting_point_lng, checkin_radius_meters, club_id")
    .eq("id", eventId).maybeSingle();
  if (!ev) return { error: "not_found" };

  const { data: club } = await ub(sb, "clubs")
    .select("plan, stripe_plan, stripe_subscription_status, created_at")
    .eq("id", (ev as any).club_id).maybeSingle();

  const membreId = await getMembreSession();
  let membreName: string | null = null;
  let validMembre: string | null = null;
  if (membreId) {
    const { data: m } = await ub(sb, "membre_profiles").select("first_name, last_name").eq("id", membreId).maybeSingle();
    if (m) {
      membreName = `${(m as any).first_name ?? ""} ${(m as any).last_name ?? ""}`.trim();
      validMembre = membreId;
    }
  }

  return {
    event: {
      id: (ev as any).id,
      title: (ev as any).title,
      meeting_point_lat: (ev as any).meeting_point_lat,
      meeting_point_lng: (ev as any).meeting_point_lng,
      checkin_radius_meters: (ev as any).checkin_radius_meters ?? 200,
    },
    gpsEnabled: hasProAccess(club as any),
    membreId: validMembre,
    membreName,
  };
}

type SubmitResult =
  | { status: "success"; already?: boolean }
  | { status: "out_of_range" }
  | { status: "need_login" }
  | { status: "not_member" }
  | { status: "error"; message: string };

/** Valide la présence du membre identifié (session PIN) dans membre_checkins. */
export async function submitCheckin(input: {
  eventId: string; method: "gps" | "qr"; lat?: number; lng?: number;
}): Promise<SubmitResult> {
  const membreId = await getMembreSession();
  if (!membreId) return { status: "need_login" };

  let sb: ReturnType<typeof createAdminClient>;
  try { sb = createAdminClient(); } catch { return { status: "error", message: "Service indisponible." }; }

  const { data: ev } = await ub(sb, "events")
    .select("id, club_id, meeting_point_lat, meeting_point_lng, checkin_radius_meters")
    .eq("id", input.eventId).maybeSingle();
  if (!ev) return { status: "error", message: "Run introuvable." };

  // Le membre doit appartenir au crew du run.
  const { data: membership } = await ub(sb, "membre_club")
    .select("id").eq("membre_id", membreId).eq("club_id", (ev as any).club_id).eq("is_active", true).maybeSingle();
  if (!membership) return { status: "not_member" };

  // Validation : QR = confiance ; GPS = géofence si le run a des coordonnées.
  const evLat = (ev as any).meeting_point_lat;
  const evLng = (ev as any).meeting_point_lng;
  const radius = (ev as any).checkin_radius_meters ?? 200;
  const isValid = input.method === "qr"
    ? true
    : (evLat != null && input.lat != null ? isWithinRadius(input.lat, input.lng!, evLat, evLng, radius) : true);

  // GPS hors zone : on n'enregistre rien, on invite à réessayer / QR.
  if (!isValid) return { status: "out_of_range" };

  // Déjà pointé ?
  const { data: existing } = await ub(sb, "membre_checkins")
    .select("id").eq("membre_id", membreId).eq("event_id", input.eventId).maybeSingle();
  if (existing) return { status: "success", already: true };

  const { error } = await ub(sb, "membre_checkins").insert({
    membre_id: membreId,
    event_id: input.eventId,
    method: input.method,
    is_valid: true,
    checked_in_at: new Date().toISOString(),
  });
  if (error) return { status: "error", message: error.message };

  return { status: "success" };
}
