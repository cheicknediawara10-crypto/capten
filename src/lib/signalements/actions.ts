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
    .select("club_id").eq("membre_id", membreId).eq("is_active", true).limit(1).maybeSingle();
  if (!mc) return { error: "Aucun crew associé à ton compte." };

  const { error } = await ub(sb, "membre_signalements").insert({
    club_id: (mc as any).club_id,
    membre_id: input.is_anonymous ? null : membreId,   // anonymat = on ne stocke pas l'auteur
    is_anonymous: !!input.is_anonymous,
    type,
    message: message.slice(0, 2000),
    event_id: input.event_id || null,
  });

  if (error) {
    const m = (error.message || "").toLowerCase();
    if (m.includes("does not exist") || m.includes("relation")) {
      return { error: "La messagerie de signalement n'est pas encore activée. Préviens ton organisateur." };
    }
    return { error: "Erreur à l'envoi. Réessaie." };
  }
  return { ok: true };
}

// ── CÔTÉ FONDATEUR : liste + résolution ──────────────────────────────────────
export async function getSignalements(): Promise<{ items: any[] } | { error: string }> {
  const club_id = await getAuthenticatedCaptainId();
  if (!club_id) return { error: "unauth" };

  let sb: ReturnType<typeof createAdminClient>;
  try { sb = createAdminClient(); } catch { return { error: "Service indisponible." }; }

  // Nom de l'auteur seulement s'il n'est PAS anonyme (membre_id null si anonyme → pas de jointure).
  const { data, error } = await ub(sb, "membre_signalements")
    .select("id, membre_id, is_anonymous, type, message, event_id, status, created_at, membre_profiles(first_name, last_name)")
    .eq("club_id", club_id)
    .order("created_at", { ascending: false });

  if (error) return { items: [] };   // table pas encore créée → vide, pas d'erreur bloquante
  return { items: (data as any[]) || [] };
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
