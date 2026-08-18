"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { hashPin } from "@/lib/membre-auth";
import { getAuthenticatedCaptainId } from "@/lib/auth-server";

// Tables not yet in generated Supabase types.
function ub(supabase: ReturnType<typeof createAdminClient>, table: string): any {
  return supabase.from(table as Parameters<ReturnType<typeof createAdminClient>["from"]>[0]);
}

/**
 * Réinitialise le PIN d'un membre (le fondateur dépanne un coureur qui a oublié).
 * Le PIN est haché (irréversible) : on ne peut pas le lire, seulement en générer
 * un nouveau. Retourne le code en clair une seule fois, à communiquer au coureur.
 * Borné au crew : le membre doit appartenir au crew du fondateur connecté.
 */
export async function resetMemberPin(membreId: string): Promise<{ pin: string } | { error: string }> {
  const club_id = await getAuthenticatedCaptainId();
  if (!club_id) return { error: "Session expirée. Reconnecte-toi." };
  if (!membreId) return { error: "Membre introuvable." };

  let supabase: ReturnType<typeof createAdminClient>;
  try {
    supabase = createAdminClient();
  } catch {
    return { error: "Service indisponible." };
  }

  const { data: membership } = await ub(supabase, "membre_club")
    .select("id").eq("membre_id", membreId).eq("club_id", club_id).maybeSingle();
  if (!membership) return { error: "Ce membre ne fait pas partie de ton crew." };

  const pin = String(Math.floor(1000 + Math.random() * 9000));
  const { hash, salt } = hashPin(pin);

  const { error } = await ub(supabase, "membre_profiles")
    .update({ pin_hash: hash, pin_salt: salt })
    .eq("id", membreId);
  if (error) return { error: "Erreur lors de la réinitialisation. Réessaie." };

  return { pin };
}

export interface MemberRow {
  id: string;
  membre_id: string;
  joined_at: string;
  membre_profiles: { id: string; first_name: string | null; last_name: string | null; phone: string | null; email: string | null } | null;
  _has_ice: boolean;
  _has_waiver: boolean;
  _checkins: number;
}

/**
 * Liste enrichie des membres du crew connecté. Auth par session (cookies) +
 * lecture via client admin → fiable même si le contexte client n'est pas hydraté.
 */
export async function getMyMembers(): Promise<{ members: MemberRow[] } | { error: string }> {
  const club_id = await getAuthenticatedCaptainId();
  if (!club_id) return { error: "unauth" };

  let supabase: ReturnType<typeof createAdminClient>;
  try {
    supabase = createAdminClient();
  } catch {
    return { error: "Service indisponible." };
  }

  const { data } = await ub(supabase, "membre_club")
    .select("id, membre_id, joined_at, membre_profiles(id, first_name, last_name, phone, email)")
    .eq("club_id", club_id)
    .eq("is_active", true)
    .order("joined_at", { ascending: false });

  const rows = (data as any[]) || [];
  const ids = rows.map((m) => m.membre_id).filter(Boolean);
  if (ids.length === 0) return { members: [] };

  const [{ data: iceData }, { data: waiverData }, { data: checkinData }] = await Promise.all([
    ub(supabase, "membre_ice").select("membre_id").in("membre_id", ids),
    ub(supabase, "membre_waivers").select("membre_id").eq("club_id", club_id).in("membre_id", ids),
    ub(supabase, "membre_checkins").select("membre_id").in("membre_id", ids).eq("is_valid", true),
  ]);

  const iceSet = new Set((iceData || []).map((i: any) => i.membre_id));
  const waiverSet = new Set((waiverData || []).map((w: any) => w.membre_id));
  const checkinCounts: Record<string, number> = {};
  for (const c of (checkinData || [])) {
    checkinCounts[c.membre_id] = (checkinCounts[c.membre_id] || 0) + 1;
  }

  const members: MemberRow[] = rows.map((m) => ({
    id: m.id,
    membre_id: m.membre_id,
    joined_at: m.joined_at,
    membre_profiles: m.membre_profiles ?? null,
    _has_ice: iceSet.has(m.membre_id),
    _has_waiver: waiverSet.has(m.membre_id),
    _checkins: checkinCounts[m.membre_id] || 0,
  }));

  return { members };
}

export interface MemberDetail {
  profile: {
    id: string; first_name: string | null; last_name: string | null;
    phone: string | null; email: string | null; date_of_birth: string | null; created_at: string;
  } | null;
  ice: { contact_name: string; contact_phone: string; relationship: string | null } | null;
  hasWaiver: boolean;
  checkins: { id: string; checked_in_at: string; is_valid: boolean; events: { title: string; event_date: string } | null }[];
}

/**
 * Détail d'un membre, borné au crew du fondateur connecté (on vérifie que le
 * membre appartient bien au crew avant de renvoyer quoi que ce soit).
 */
export async function getMemberDetail(membreId: string): Promise<MemberDetail | { error: string }> {
  const club_id = await getAuthenticatedCaptainId();
  if (!club_id) return { error: "unauth" };
  if (!membreId) return { error: "not_found" };

  let supabase: ReturnType<typeof createAdminClient>;
  try {
    supabase = createAdminClient();
  } catch {
    return { error: "Service indisponible." };
  }

  // Le membre doit appartenir à CE crew.
  const { data: membership } = await ub(supabase, "membre_club")
    .select("id").eq("membre_id", membreId).eq("club_id", club_id).maybeSingle();
  if (!membership) return { error: "not_found" };

  const [{ data: prof }, { data: iceData }, { data: waiverData }, { data: checkinsData }] = await Promise.all([
    ub(supabase, "membre_profiles").select("*").eq("id", membreId).maybeSingle(),
    ub(supabase, "membre_ice").select("contact_name, contact_phone, relationship").eq("membre_id", membreId).maybeSingle(),
    ub(supabase, "membre_waivers").select("id").eq("membre_id", membreId).eq("club_id", club_id).limit(1),
    ub(supabase, "membre_checkins")
      .select("id, checked_in_at, is_valid, events(title, event_date)")
      .eq("membre_id", membreId).order("checked_in_at", { ascending: false }).limit(20),
  ]);

  return {
    profile: (prof as MemberDetail["profile"]) ?? null,
    ice: (iceData as MemberDetail["ice"]) ?? null,
    hasWaiver: !!(waiverData && (waiverData as any[]).length),
    checkins: (checkinsData as unknown as MemberDetail["checkins"]) ?? [],
  };
}

type AddResult =
  | { success: true; membreId: string; pin: string; linkedExisting: boolean }
  | { error: string };

/**
 * Ajout manuel d'un membre par le fondateur (depuis /dashboard/members).
 * Le club_id est dérivé de la session — jamais transmis par le client.
 * Un PIN provisoire à 4 chiffres est généré pour que le membre puisse
 * ensuite accéder à son espace (nom + date de naissance + PIN).
 */
export async function addMemberManually(data: {
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  phone?: string;
  email?: string;
}): Promise<AddResult> {
  const first_name = data.first_name?.trim();
  const last_name = data.last_name?.trim();
  const dob = data.date_of_birth?.trim() || null;
  const phone = data.phone?.trim() || null;
  const email = data.email?.trim().toLowerCase() || null;

  if (!first_name || !last_name) {
    return { error: "Prénom et nom sont requis." };
  }

  const captainId = await getAuthenticatedCaptainId();
  if (!captainId) return { error: "Session expirée. Reconnecte-toi." };
  const club_id = captainId;

  let supabase: ReturnType<typeof createAdminClient>;
  try {
    supabase = createAdminClient();
  } catch {
    return { error: "Service temporairement indisponible." };
  }

  // Dédup : même prénom + nom + date de naissance (si fournie)
  let existing: { id: string } | null = null;
  if (dob) {
    const { data: exRaw } = await ub(supabase, "membre_profiles")
      .select("id")
      .ilike("first_name", first_name)
      .ilike("last_name", last_name)
      .eq("date_of_birth", dob)
      .maybeSingle();
    existing = exRaw as { id: string } | null;
  }

  // Membre déjà connu ailleurs → on le rattache simplement au crew (il garde son PIN)
  if (existing) {
    const { data: membership } = await ub(supabase, "membre_club")
      .select("id")
      .eq("membre_id", existing.id)
      .eq("club_id", club_id)
      .maybeSingle();
    if (membership) return { error: `${first_name} fait déjà partie de ton crew.` };

    const { error: linkErr } = await ub(supabase, "membre_club").insert({ membre_id: existing.id, club_id });
    if (linkErr) return { error: "Erreur lors du rattachement. Réessaie." };
    return { success: true, membreId: existing.id, pin: "", linkedExisting: true };
  }

  // Nouveau membre + PIN provisoire
  const pin = String(Math.floor(1000 + Math.random() * 9000));
  const { hash, salt } = hashPin(pin);

  const { data: insRaw, error: insErr } = await ub(supabase, "membre_profiles")
    .insert({
      first_name,
      last_name,
      date_of_birth: dob,
      phone,
      email,
      pin_hash: hash,
      pin_salt: salt,
    })
    .select("id")
    .single();

  const inserted = insRaw as { id: string } | null;
  if (insErr || !inserted) {
    const msg = (insErr?.message || "").toLowerCase();
    if (msg.includes("date_of_birth") || msg.includes("null value")) {
      return { error: "La date de naissance est requise pour créer ce membre." };
    }
    return { error: "Erreur lors de l'ajout. Réessaie." };
  }

  const { error: linkErr } = await ub(supabase, "membre_club").insert({ membre_id: inserted.id, club_id });
  if (linkErr) return { error: "Membre créé mais non rattaché au crew. Réessaie." };

  return { success: true, membreId: inserted.id, pin, linkedExisting: false };
}
