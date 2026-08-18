"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { hashPin } from "@/lib/membre-auth";
import { getAuthenticatedCaptainId } from "@/lib/auth-server";

// Tables not yet in generated Supabase types.
function ub(supabase: ReturnType<typeof createAdminClient>, table: string): any {
  return supabase.from(table as Parameters<ReturnType<typeof createAdminClient>["from"]>[0]);
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
