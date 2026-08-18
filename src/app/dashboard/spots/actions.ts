"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthenticatedCaptainId } from "@/lib/auth-server";

function ub(supabase: ReturnType<typeof createAdminClient>, table: string): any {
  return supabase.from(table as Parameters<ReturnType<typeof createAdminClient>["from"]>[0]);
}

export interface SpotInput {
  nom: string;
  categorie: string;
  adresse?: string | null;
  lien_maps?: string | null;
  mot_du_fondateur?: string | null;
  avantage?: string | null;
  ordre?: number;
}

export async function getMySpots(): Promise<{ spots: any[]; club: any | null } | { error: string }> {
  const club_id = await getAuthenticatedCaptainId();
  if (!club_id) return { error: "unauth" };
  let sb: ReturnType<typeof createAdminClient>;
  try { sb = createAdminClient(); } catch { return { error: "Service indisponible." }; }
  const [{ data: spots }, { data: club }] = await Promise.all([
    ub(sb, "crew_spots").select("*").eq("club_id", club_id).order("ordre").order("created_at"),
    ub(sb, "clubs").select("*").eq("id", club_id).maybeSingle(),
  ]);
  return { spots: (spots as any[]) || [], club: (club as any) ?? null };
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
