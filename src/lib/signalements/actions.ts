"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getMembreSession } from "@/lib/membre-session";
import { getAuthenticatedCaptainId } from "@/lib/auth-server";

function ub(supabase: ReturnType<typeof createAdminClient>, table: string): any {
  return supabase.from(table as Parameters<ReturnType<typeof createAdminClient>["from"]>[0]);
}

const TYPES = ["securite", "organisation", "avis", "autre"];

// ── CÔTÉ COUREUR : envoyer un signalement / avis ─────────────────────────────
export async function submitSignalement(input: {
  type: string; message: string; event_id?: string | null; is_anonymous: boolean;
}): Promise<{ ok: true } | { error: string }> {
  const membreId = await getMembreSession();
  if (!membreId) return { error: "Reconnecte-toi à ton espace pour envoyer." };

  const message = input.message?.trim();
  if (!message) return { error: "Écris ton message avant d'envoyer." };
  const type = TYPES.includes(input.type) ? input.type : "autre";

  let sb: ReturnType<typeof createAdminClient>;
  try { sb = createAdminClient(); } catch { return { error: "Service indisponible." }; }

  // Le coureur peut être dans plusieurs crews → on prend son crew actif.
  const { data: mc } = await ub(sb, "membre_club")
    .select("club_id").eq("membre_id", membreId).eq("is_active", true).order("joined_at", { ascending: false }).limit(1).maybeSingle();
  if (!mc) return { error: "Aucun crew associé à ton compte." };

  const { error } = await ub(sb, "membre_signalements").insert({
    club_id: (mc as any).club_id,
    membre_id: input.is_anonymous ? null : membreId,   // anonymat = on ne stocke pas l'auteur
    is_anonymous: !!input.is_anonymous,
    type,
    message: message.slice(0, 2000),
    event_id: input.event_id || null,
    status: "new",
  });

  if (error) {
    console.error("[submitSignalement insert error]", error);
    const m = (error.message || "").toLowerCase();
    if (m.includes("does not exist") || m.includes("relation")) {
      return { error: "La table de signalements doit être exécutée dans Supabase SQL Editor." };
    }
    return { error: `Erreur à l'envoi : ${error.message}` };
  }
  return { ok: true };
}

// ── CÔTÉ FONDATEUR : liste + résolution ──────────────────────────────────────
export async function getSignalements(): Promise<{ items: any[] } | { error: string }> {
  const club_id = await getAuthenticatedCaptainId();
  if (!club_id) return { error: "unauth" };

  let sb: ReturnType<typeof createAdminClient>;
  try { sb = createAdminClient(); } catch { return { error: "Service indisponible." }; }

  // 1. Lecture directe sans jointure PostgREST (évite les erreurs schema-cache)
  const { data, error } = await ub(sb, "membre_signalements")
    .select("id, membre_id, is_anonymous, type, message, event_id, status, created_at")
    .eq("club_id", club_id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getSignalements error]", error);
    return { items: [] };
  }

  const rawItems = (data as any[]) || [];
  if (rawItems.length === 0) return { items: [] };

  // 2. Pour les signalements NON-anonymes, on charge le prénom/nom des profils
  const nonAnonMemberIds = rawItems
    .filter((x) => !x.is_anonymous && x.membre_id)
    .map((x) => x.membre_id);

  let profilesMap: Record<string, { first_name: string | null; last_name: string | null }> = {};
  if (nonAnonMemberIds.length > 0) {
    const { data: profs } = await ub(sb, "membre_profiles")
      .select("id, first_name, last_name")
      .in("id", nonAnonMemberIds);
    if (profs) {
      for (const p of profs as any[]) {
        profilesMap[p.id] = { first_name: p.first_name, last_name: p.last_name };
      }
    }
  }

  const items = rawItems.map((x) => ({
    ...x,
    status: x.status || "new",
    membre_profiles: x.is_anonymous || !x.membre_id ? null : (profilesMap[x.membre_id] || null),
  }));

  return { items };
}

export async function resolveSignalement(id: string): Promise<{ ok: true } | { error: string }> {
  const club_id = await getAuthenticatedCaptainId();
  if (!club_id) return { error: "unauth" };
  let sb: ReturnType<typeof createAdminClient>;
  try { sb = createAdminClient(); } catch { return { error: "Service indisponible." }; }
  const { data: s } = await ub(sb, "membre_signalements").select("club_id").eq("id", id).maybeSingle();
  if (!s || (s as any).club_id !== club_id) return { error: "not_found" };
  await ub(sb, "membre_signalements").update({ status: "done" }).eq("id", id);
  return { ok: true };
}
