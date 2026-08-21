"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthenticatedCaptainId } from "@/lib/auth-server";

function ub(supabase: ReturnType<typeof createAdminClient>, table: string): any {
  return supabase.from(table as Parameters<ReturnType<typeof createAdminClient>["from"]>[0]);
}

import { getMembreSession } from "@/lib/membre-session";

export interface SpotInput {
  nom: string;
  categorie: string;
  adresse?: string | null;
  lien_maps?: string | null;
  mot_du_fondateur?: string | null;
  avantage?: string | null;
  ordre?: number;
  status?: string;
  suggested_by_name?: string | null;
}

export async function getMySpots(): Promise<{
  spots: any[];
  pendingSuggestions: any[];
  club: any | null;
} | { error: string }> {
  const club_id = await getAuthenticatedCaptainId();
  if (!club_id) return { error: "unauth" };
  let sb: ReturnType<typeof createAdminClient>;
  try { sb = createAdminClient(); } catch { return { error: "Service indisponible." }; }

  const [{ data: allSpots }, { data: club }] = await Promise.all([
    ub(sb, "crew_spots").select("*").eq("club_id", club_id).order("ordre").order("created_at"),
    ub(sb, "clubs").select("*").eq("id", club_id).maybeSingle(),
  ]);

  const raw = (allSpots as any[]) || [];
  const spots = raw.filter((s) => s.status !== "pending");
  const pendingSuggestions = raw.filter((s) => s.status === "pending");

  return { spots, pendingSuggestions, club: (club as any) ?? null };
}

export async function saveSpot(input: SpotInput, editingId?: string): Promise<{ ok: true } | { error: string }> {
  const club_id = await getAuthenticatedCaptainId();
  if (!club_id) return { error: "unauth" };
  let sb: ReturnType<typeof createAdminClient>;
  try { sb = createAdminClient(); } catch { return { error: "Service indisponible." }; }

  const payload = {
    nom: input.nom.trim(),
    categorie: input.categorie,
    adresse: input.adresse?.trim() || null,
    lien_maps: input.lien_maps?.trim() || null,
    mot_du_fondateur: input.mot_du_fondateur?.trim() || null,
    avantage: input.avantage?.trim() || null,
    status: "published",
    suggested_by_name: input.suggested_by_name?.trim() || null,
  };

  if (editingId) {
    const { data: sp } = await ub(sb, "crew_spots").select("club_id").eq("id", editingId).maybeSingle();
    if (!sp || (sp as any).club_id !== club_id) return { error: "not_found" };
    const { error } = await ub(sb, "crew_spots").update(payload).eq("id", editingId);
    if (error) return { error: error.message };
  } else {
    const { error } = await ub(sb, "crew_spots").insert({ club_id, ...payload, ordre: input.ordre ?? 0 });
    if (error) return { error: error.message };
  }
  return { ok: true };
}

/** Le coureur soumet un bon plan / pépite à son capitaine. */
export async function suggestSpotByRunner(input: {
  nom: string;
  categorie: string;
  adresse?: string | null;
  lien_maps?: string | null;
  mot_du_fondateur?: string | null;
  avantage?: string | null;
}): Promise<{ ok: true } | { error: string }> {
  const membreId = await getMembreSession();
  if (!membreId) return { error: "Reconnecte-toi à ton espace pour proposer un spot." };

  if (!input.nom?.trim()) return { error: "Donne un nom au lieu." };

  let sb: ReturnType<typeof createAdminClient>;
  try { sb = createAdminClient(); } catch { return { error: "Service indisponible." }; }

  const [{ data: prof }, { data: mc }] = await Promise.all([
    ub(sb, "membre_profiles").select("first_name, last_name").eq("id", membreId).maybeSingle(),
    ub(sb, "membre_club").select("club_id").eq("membre_id", membreId).eq("is_active", true).order("joined_at", { ascending: false }).limit(1).maybeSingle(),
  ]);

  if (!mc?.club_id) return { error: "Aucun club actif associé à ton profil." };

  const runnerName = [prof?.first_name, prof?.last_name].filter(Boolean).join(" ").trim() || "Un membre du crew";

  const { error } = await ub(sb, "crew_spots").insert({
    club_id: mc.club_id,
    nom: input.nom.trim(),
    categorie: input.categorie || "autre",
    adresse: input.adresse?.trim() || null,
    lien_maps: input.lien_maps?.trim() || null,
    mot_du_fondateur: input.mot_du_fondateur?.trim() || null,
    avantage: input.avantage?.trim() || null,
    status: "pending",
    suggested_by_name: runnerName,
    ordre: 99,
  });

  if (error) {
    console.error("[suggestSpotByRunner error]", error);
    return { error: error.message };
  }

  return { ok: true };
}

/** Le capitaine valide une suggestion de bon plan faite par un coureur. */
export async function approveSpot(id: string): Promise<{ ok: true } | { error: string }> {
  const club_id = await getAuthenticatedCaptainId();
  if (!club_id) return { error: "unauth" };
  let sb: ReturnType<typeof createAdminClient>;
  try { sb = createAdminClient(); } catch { return { error: "Service indisponible." }; }

  const { error } = await ub(sb, "crew_spots")
    .update({ status: "published" })
    .eq("id", id)
    .eq("club_id", club_id);

  if (error) return { error: error.message };
  return { ok: true };
}

export async function deleteSpot(id: string): Promise<{ ok: true } | { error: string }> {
  const club_id = await getAuthenticatedCaptainId();
  if (!club_id) return { error: "unauth" };
  let sb: ReturnType<typeof createAdminClient>;
  try { sb = createAdminClient(); } catch { return { error: "Service indisponible." }; }
  const { data: sp } = await ub(sb, "crew_spots").select("club_id").eq("id", id).maybeSingle();
  if (!sp || (sp as any).club_id !== club_id) return { error: "not_found" };
  await ub(sb, "crew_spots").delete().eq("id", id);
  return { ok: true };
}

export async function reorderSpots(orderedIds: string[]): Promise<{ ok: true } | { error: string }> {
  const club_id = await getAuthenticatedCaptainId();
  if (!club_id) return { error: "unauth" };
  let sb: ReturnType<typeof createAdminClient>;
  try { sb = createAdminClient(); } catch { return { error: "Service indisponible." }; }
  await Promise.all(orderedIds.map((id, i) =>
    ub(sb, "crew_spots").update({ ordre: i }).eq("id", id).eq("club_id", club_id)
  ));
  return { ok: true };
}
