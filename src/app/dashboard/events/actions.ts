"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthenticatedCaptainId } from "@/lib/auth-server";

import { sendClubPushNotification } from "@/lib/push/send";

function ub(supabase: ReturnType<typeof createAdminClient>, table: string): any {
  return supabase.from(table as Parameters<ReturnType<typeof createAdminClient>["from"]>[0]);
}

async function geocode(addr: string): Promise<{ lat: number | null; lng: number | null }> {
  const q = (addr || "").trim();
  if (!q) return { lat: null, lng: null };
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`,
      { headers: { "Accept-Language": "fr", "User-Agent": "CaptenApp/1.0 (contact info.captenfr@gmail.com)" } }
    );
    const j = await res.json();
    if (Array.isArray(j) && j[0]) return { lat: parseFloat(j[0].lat), lng: parseFloat(j[0].lon) };
  } catch { /* check-in sans géofence */ }
  return { lat: null, lng: null };
}

/** Liste des runs du crew connecté. */
export async function getMyRuns(): Promise<{ runs: any[] } | { error: string }> {
  const club_id = await getAuthenticatedCaptainId();
  if (!club_id) return { error: "unauth" };
  let sb: ReturnType<typeof createAdminClient>;
  try { sb = createAdminClient(); } catch { return { error: "Service indisponible." }; }
  const { data } = await ub(sb, "events").select("*").eq("club_id", club_id).order("event_date", { ascending: false });
  return { runs: (data as any[]) || [] };
}

export interface NewRunInput {
  title: string;
  description?: string | null;
  event_date: string;
  meeting_point_address?: string | null;
  max_participants?: number | null;
  distance_km?: number | null;
  is_recurring: boolean;
  checkin_radius_meters: number;
  status: "draft" | "published";
  is_evenement?: boolean;
  jauge_max?: number | null;
  prix?: number | null;
  devise?: string;
  lien_paiement?: string | null;
  description_evenement?: string | null;
}

/** Crée un run (géocodage de l'adresse côté serveur) + diffuse Web Push. */
export async function createRun(input: NewRunInput): Promise<{ id: string } | { error: string }> {
  const club_id = await getAuthenticatedCaptainId();
  if (!club_id) return { error: "Session introuvable, reconnecte-toi." };
  let sb: ReturnType<typeof createAdminClient>;
  try { sb = createAdminClient(); } catch { return { error: "Service indisponible, réessaie." }; }

  const { lat, lng } = await geocode(input.meeting_point_address || "");

  const { data, error } = await ub(sb, "events").insert({
    club_id,
    created_by: club_id,
    title: input.title?.trim() || "Nouveau run",
    description: input.description || null,
    event_date: input.event_date,
    meeting_point_address: input.meeting_point_address || null,
    meeting_point_lat: lat,
    meeting_point_lng: lng,
    max_participants: input.max_participants ?? null,
    distance_km: input.distance_km ?? null,
    is_recurring: input.is_recurring,
    checkin_radius_meters: input.checkin_radius_meters,
    status: input.status,
    is_evenement: !!input.is_evenement,
    jauge_max: input.jauge_max ?? null,
    prix: input.prix ?? null,
    devise: input.devise || "EUR",
    lien_paiement: input.lien_paiement || null,
    description_evenement: input.description_evenement || null,
  }).select("id").single();

  if (error || !data) return { error: error?.message || "Erreur lors de la création." };

  // Diffusion Web Push aux membres si publié
  if (input.status === "published") {
    try {
      await sendClubPushNotification(club_id, {
        title: `🏃 Nouveau Run : ${input.title || "Prochaine sortie"}`,
        body: input.is_evenement ? `Événement à jauge limitée — Places limitées !` : `Inscriptions ouvertes sur Capten !`,
        url: `/event/${(data as any).id}`,
      });
    } catch { /* push non bloquant */ }
  }

  return { id: (data as any).id };
}

/** Diffuse une notification Web Push aux membres du crew pour un run. */
export async function sendRunPushNotification(
  eventId: string,
  customMessage?: string
): Promise<{ ok: true; sent: number } | { error: string }> {
  const club_id = await getAuthenticatedCaptainId();
  if (!club_id) return { error: "unauth" };
  let sb: ReturnType<typeof createAdminClient>;
  try { sb = createAdminClient(); } catch { return { error: "Service indisponible." }; }

  const { data: ev } = await ub(sb, "events").select("*").eq("id", eventId).maybeSingle();
  if (!ev || (ev as any).club_id !== club_id) return { error: "not_found" };

  const res = await sendClubPushNotification(club_id, {
    title: `🏃 ${(ev as any).title}`,
    body: customMessage || `Rappel pour le run ! Rendez-vous au point de départ.`,
    url: `/event/${eventId}`,
  });

  return { ok: true, sent: res.sent };
}

/** Détail d'un run + inscrits + check-ins + crew (pour nom/logo/entitlement Pro). Borné au crew. */
export async function getRunDetail(id: string): Promise<
  { event: any; registrations: any[]; inscriptions: any[]; waitlist: any[]; checkins: any[]; club: any | null }
  | { error: string }
> {
  const club_id = await getAuthenticatedCaptainId();
  if (!club_id) return { error: "unauth" };
  if (!id) return { error: "not_found" };
  let sb: ReturnType<typeof createAdminClient>;
  try { sb = createAdminClient(); } catch { return { error: "Service indisponible." }; }

  const { data: ev } = await ub(sb, "events").select("*").eq("id", id).maybeSingle();
  if (!ev || (ev as any).club_id !== club_id) return { error: "not_found" };

  const [{ data: regs }, { data: allIns }, { data: chks }, { data: cm }] = await Promise.all([
    ub(sb, "membre_club").select("id, membre_profiles(first_name, last_name, phone)").eq("club_id", club_id).eq("is_active", true),
    ub(sb, "event_inscriptions").select("*").eq("event_id", id).order("created_at", { ascending: true }),
    ub(sb, "membre_checkins").select("id, checked_in_at, is_valid, method, membre_profiles(first_name, last_name, phone)").eq("event_id", id).order("checked_in_at", { ascending: false }),
    ub(sb, "clubs").select("*").eq("id", club_id).maybeSingle(),
  ]);

  const rawInscriptions = (allIns as any[]) || [];
  const mainInscriptions = rawInscriptions.filter((i) => i.position_liste_attente === null);
  const waitlist = rawInscriptions
    .filter((i) => i.position_liste_attente !== null)
    .sort((a, b) => (a.position_liste_attente || 0) - (b.position_liste_attente || 0));

  return {
    event: ev,
    registrations: (regs as any[]) || [],
    inscriptions: mainInscriptions,
    waitlist,
    checkins: (chks as any[]) || [],
    club: (cm as any) ?? null,
  };
}

export async function setRunStatus(id: string, status: string): Promise<{ event: any } | { error: string }> {
  const club_id = await getAuthenticatedCaptainId();
  if (!club_id) return { error: "unauth" };
  let sb: ReturnType<typeof createAdminClient>;
  try { sb = createAdminClient(); } catch { return { error: "Service indisponible." }; }
  const { data: ev } = await ub(sb, "events").select("club_id").eq("id", id).maybeSingle();
  if (!ev || (ev as any).club_id !== club_id) return { error: "not_found" };
  const { data } = await ub(sb, "events").update({ status }).eq("id", id).select().single();
  return { event: data };
}

export async function deleteRun(id: string): Promise<{ ok: true } | { error: string }> {
  const club_id = await getAuthenticatedCaptainId();
  if (!club_id) return { error: "unauth" };
  let sb: ReturnType<typeof createAdminClient>;
  try { sb = createAdminClient(); } catch { return { error: "Service indisponible." }; }
  const { data: ev } = await ub(sb, "events").select("club_id").eq("id", id).maybeSingle();
  if (!ev || (ev as any).club_id !== club_id) return { error: "not_found" };
  await ub(sb, "events").delete().eq("id", id);
  return { ok: true };
}

export async function setRunFlag(id: string, field: "affiche_telechargee" | "story_telechargee"): Promise<{ ok: true } | { error: string }> {
  const club_id = await getAuthenticatedCaptainId();
  if (!club_id) return { error: "unauth" };
  let sb: ReturnType<typeof createAdminClient>;
  try { sb = createAdminClient(); } catch { return { error: "Service indisponible." }; }
  const { data: ev } = await ub(sb, "events").select("club_id").eq("id", id).maybeSingle();
  if (!ev || (ev as any).club_id !== club_id) return { error: "not_found" };
  await ub(sb, "events").update({ [field]: true }).eq("id", id);
  return { ok: true };
}
