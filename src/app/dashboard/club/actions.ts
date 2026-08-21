"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthenticatedCaptainId } from "@/lib/auth-server";

// Tables not yet in generated Supabase types.
function ub(supabase: ReturnType<typeof createAdminClient>, table: string): any {
  return supabase.from(table as Parameters<ReturnType<typeof createAdminClient>["from"]>[0]);
}

function slugify(s: string): string {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

/**
 * Lit le crew du fondateur connecté. L'id vient de la SESSION (cookies), fiable
 * même si le contexte client n'est pas hydraté. Lecture via client admin.
 */
export async function getMyClub(): Promise<{ id: string; club: any | null } | { error: string }> {
  const id = await getAuthenticatedCaptainId();
  if (!id) return { error: "unauth" };
  let supabase: ReturnType<typeof createAdminClient>;
  try {
    supabase = createAdminClient();
  } catch {
    return { error: "Service indisponible." };
  }
  const { data } = await ub(supabase, "clubs").select("*").eq("id", id).maybeSingle();
  return { id, club: (data as any) ?? null };
}

/**
 * Enregistre l'identité du crew + génère un slug unique si absent.
 * Auth par session (cookies), écriture par client admin (on ne touche QUE la
 * ligne dont l'id === l'utilisateur authentifié).
 */
export async function saveMyClub(input: {
  name: string;
  description?: string | null;
  logo_url?: string | null;
  city?: string | null;
  website_url?: string | null;
  instagram_url?: string | null;
  whatsapp_link?: string | null;
}): Promise<{ ok: true; slug: string } | { error: string }> {
  const id = await getAuthenticatedCaptainId();
  if (!id) return { error: "Session introuvable, reconnecte-toi." };
  if (!input.name?.trim()) return { error: "Donne un nom à ton crew pour générer ton lien d'inscription." };

  let supabase: ReturnType<typeof createAdminClient>;
  try {
    supabase = createAdminClient();
  } catch {
    return { error: "Service indisponible, réessaie." };
  }

  // Slug : conserve l'existant, sinon dérive du nom (suffixe id si collision).
  const { data: existing } = await ub(supabase, "clubs").select("slug").eq("id", id).maybeSingle();
  let slug = (existing as { slug: string | null } | null)?.slug?.trim() || "";
  if (!slug) {
    const base = slugify(input.name) || "crew";
    const { data: taken } = await ub(supabase, "clubs")
      .select("id").eq("slug", base).neq("id", id).maybeSingle();
    slug = taken ? `${base}-${id.slice(0, 4)}` : base;
  }

  const displayName = input.name.trim();
  const { error } = await ub(supabase, "clubs").upsert({
    id,
    owner_id: id,
    name: displayName,
    // Colonne NOT NULL + source du nom d'affichage (lu par l'AuthContext).
    whatsapp_display_name: displayName,
    slug,
    description: input.description ?? null,
    logo_url: input.logo_url ?? null,
    city: input.city ?? null,
    website_url: input.website_url ?? null,
    instagram_url: input.instagram_url ?? null,
    whatsapp_link: input.whatsapp_link ?? null,
  }, { onConflict: "id" });

  if (error) return { error: error.message };
  return { ok: true, slug };
}
