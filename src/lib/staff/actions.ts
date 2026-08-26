"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthenticatedCaptainId } from "@/lib/auth-server";
import { getAppUrl } from "@/lib/domain";

function ub(supabase: ReturnType<typeof createAdminClient>, table: string): any {
  return supabase.from(table as Parameters<ReturnType<typeof createAdminClient>["from"]>[0]);
}

/**
 * 1. Génère ou récupère le lien Staff pour un run (Action Capitaine)
 */
export async function getOrCreateStaffToken(eventId: string, label = "Co-Capitaine") {
  const clubId = await getAuthenticatedCaptainId();
  if (!clubId) return { error: "unauth" };

  let sb: ReturnType<typeof createAdminClient>;
  try {
    sb = createAdminClient();
  } catch {
    return { error: "Service indisponible." };
  }

  // Vérifie que l'event appartient bien au club
  const { data: ev } = await ub(sb, "events").select("id, club_id, title").eq("id", eventId).maybeSingle();
  if (!ev || ev.club_id !== clubId) return { error: "not_found" };

  // Recherche d'un token actif existant
  const { data: existing } = await ub(sb, "club_staff_tokens")
    .select("*")
    .eq("club_id", clubId)
    .eq("event_id", eventId)
    .eq("is_active", true)
    .maybeSingle();

  if (existing) {
    return {
      token: existing.token,
      staffUrl: `${getAppUrl()}/staff/${existing.token}`,
      label: existing.label,
    };
  }

  // Création d'un nouveau token
  const { data: created, error } = await ub(sb, "club_staff_tokens")
    .insert({
      club_id: clubId,
      event_id: eventId,
      label,
      is_active: true,
    })
    .select()
    .single();

  if (error || !created) {
    return { error: error?.message || "Impossible de générer le lien staff." };
  }

  return {
    token: created.token,
    staffUrl: `${getAppUrl()}/staff/${created.token}`,
    label: created.label,
  };
}

/**
 * 1b. Génère ou récupère le lien Staff permanent du Club (depuis les Réglages)
 */
export async function getOrCreateClubStandingStaffToken(label = "Co-Capitaine Général") {
  const clubId = await getAuthenticatedCaptainId();
  if (!clubId) return { error: "unauth" };

  let sb: ReturnType<typeof createAdminClient>;
  try {
    sb = createAdminClient();
  } catch {
    return { error: "Service indisponible." };
  }

  // Recherche d'un token permanent actif existant (event_id null)
  const { data: existing } = await ub(sb, "club_staff_tokens")
    .select("*")
    .eq("club_id", clubId)
    .is("event_id", null)
    .eq("is_active", true)
    .maybeSingle();

  if (existing) {
    return {
      token: existing.token,
      staffUrl: `${getAppUrl()}/staff/${existing.token}`,
      label: existing.label,
    };
  }

  // Création d'un nouveau token permanent
  const { data: created, error } = await ub(sb, "club_staff_tokens")
    .insert({
      club_id: clubId,
      event_id: null,
      label,
      is_active: true,
    })
    .select()
    .single();

  if (error || !created) {
    return { error: error?.message || "Impossible de générer le lien staff." };
  }

  return {
    token: created.token,
    staffUrl: `${getAppUrl()}/staff/${created.token}`,
    label: created.label,
  };
}

/**
 * 2. Révoque un lien Staff (Action Capitaine)
 */
export async function revokeStaffToken(tokenString: string) {
  const clubId = await getAuthenticatedCaptainId();
  if (!clubId) return { error: "unauth" };

  let sb: ReturnType<typeof createAdminClient>;
  try {
    sb = createAdminClient();
  } catch {
    return { error: "Service indisponible." };
  }

  await ub(sb, "club_staff_tokens")
    .update({ is_active: false })
    .eq("token", tokenString)
    .eq("club_id", clubId);

  return { ok: true };
}

/**
 * 3. Récupère le contexte du Cockpit Staff Terrain (Public avec Token)
 */
export async function getStaffCockpitContext(tokenString: string) {
  let sb: ReturnType<typeof createAdminClient>;
  try {
    sb = createAdminClient();
  } catch {
    return { error: "Service indisponible." };
  }

  // 1. Validation du token
  const { data: staffToken } = await ub(sb, "club_staff_tokens")
    .select("*, clubs(name, logo_url), events(*)")
    .eq("token", tokenString)
    .eq("is_active", true)
    .maybeSingle();

  if (!staffToken) {
    return { error: "Lien staff invalide ou expiré." };
  }

  const clubId = staffToken.club_id;
  const club = staffToken.clubs;
  let event = staffToken.events;
  let eventId = staffToken.event_id;

  // Si token permanent (event_id null), on cherche le prochain run ou le dernier run actif
  if (!eventId || !event) {
    const now = new Date().toISOString();
    const { data: nextEv } = await ub(sb, "events")
      .select("*")
      .eq("club_id", clubId)
      .gte("event_date", now)
      .order("event_date", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (nextEv) {
      event = nextEv;
      eventId = nextEv.id;
    } else {
      // Sinon le dernier run
      const { data: lastEv } = await ub(sb, "events")
        .select("*")
        .eq("club_id", clubId)
        .order("event_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastEv) {
        event = lastEv;
        eventId = lastEv.id;
      }
    }
  }

  if (!event || !eventId) {
    return { error: "Aucun run n'est programmé pour ce crew actuellement." };
  }

  // 2. Récupération des membres du club + check-ins du run + fiches ICE existantes
  const [{ data: rawMembers }, { data: rawCheckins }, { data: rawIce }] = await Promise.all([
    ub(sb, "membre_club")
      .select("membre_id, membre_profiles(id, first_name, last_name, phone)")
      .eq("club_id", clubId)
      .eq("is_active", true),
    ub(sb, "membre_checkins")
      .select("id, membre_id, checked_in_at, method, is_valid")
      .eq("event_id", eventId),
    ub(sb, "membre_ice")
      .select("membre_id"),
  ]);

  const checkinsMap = new Map((rawCheckins || []).map((c: any) => [c.membre_id, c]));
  const iceSet = new Set((rawIce || []).map((i: any) => i.membre_id));

  const members = (rawMembers || [])
    .map((m: any) => {
      const p = m.membre_profiles;
      if (!p) return null;
      const chk = checkinsMap.get(p.id) as any;
      return {
        id: p.id,
        firstName: p.first_name || "",
        lastName: p.last_name || "",
        phone: p.phone || "",
        isCheckedIn: !!chk,
        checkedInAt: chk?.checked_in_at || null,
        method: chk?.method || null,
        hasIce: iceSet.has(p.id),
      };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => a.lastName.localeCompare(b.lastName, "fr"));

  const checkedInCount = members.filter((m: any) => m.isCheckedIn).length;

  return {
    event: {
      id: event.id,
      title: event.title,
      date: event.event_date,
      address: event.meeting_point_address,
      description: event.description,
      is_evenement: event.is_evenement,
      jauge_max: event.jauge_max,
    },
    club: {
      name: club?.name || "Crew",
      logoUrl: club?.logo_url || null,
    },
    staffLabel: staffToken.label,
    members,
    stats: {
      totalMembers: members.length,
      checkedInCount,
    },
  };
}

/**
 * 4. Valide le check-in manuel d'un coureur par le Staff
 */
export async function staffSubmitCheckin(tokenString: string, memberId: string) {
  let sb: ReturnType<typeof createAdminClient>;
  try {
    sb = createAdminClient();
  } catch {
    return { error: "Service indisponible." };
  }

  // Vérifie le token
  const { data: staffToken } = await ub(sb, "club_staff_tokens")
    .select("event_id, club_id, is_active")
    .eq("token", tokenString)
    .eq("is_active", true)
    .maybeSingle();

  if (!staffToken || !staffToken.is_active) {
    return { error: "Lien staff invalide ou révoqué." };
  }

  let eventId = staffToken.event_id;
  if (!eventId) {
    const now = new Date().toISOString();
    const { data: nextEv } = await ub(sb, "events")
      .select("id")
      .eq("club_id", staffToken.club_id)
      .gte("event_date", now)
      .order("event_date", { ascending: true })
      .limit(1)
      .maybeSingle();
    eventId = nextEv?.id;
  }

  if (!eventId) {
    return { error: "Aucun run actif trouvé." };
  }

  // Insert ou ignore si déjà pointé
  const { data: existing } = await ub(sb, "membre_checkins")
    .select("id")
    .eq("membre_id", memberId)
    .eq("event_id", eventId)
    .maybeSingle();

  if (existing) {
    return { ok: true, already: true };
  }

  const { error } = await ub(sb, "membre_checkins").insert({
    membre_id: memberId,
    event_id: eventId,
    method: "manual",
    is_valid: true,
  });

  if (error) return { error: error.message };
  return { ok: true, already: false };
}

/**
 * 5. Valide un check-in par scan QR (code ou ID coureur)
 */
export async function staffScanQrCheckin(tokenString: string, scannedText: string) {
  let sb: ReturnType<typeof createAdminClient>;
  try {
    sb = createAdminClient();
  } catch {
    return { error: "Service indisponible." };
  }

  const { data: staffToken } = await ub(sb, "club_staff_tokens")
    .select("event_id, club_id, is_active")
    .eq("token", tokenString)
    .eq("is_active", true)
    .maybeSingle();

  if (!staffToken || !staffToken.is_active) {
    return { error: "Lien staff invalide ou révoqué." };
  }

  let eventId = staffToken.event_id;
  const clubId = staffToken.club_id;

  if (!eventId) {
    const now = new Date().toISOString();
    const { data: nextEv } = await ub(sb, "events")
      .select("id")
      .eq("club_id", clubId)
      .gte("event_date", now)
      .order("event_date", { ascending: true })
      .limit(1)
      .maybeSingle();
    eventId = nextEv?.id;
  }

  if (!eventId) {
    return { error: "Aucun run actif trouvé." };
  }

  // Le QR peut contenir un ID membre (UUID) ou un numéro de téléphone
  const query = scannedText.trim();
  
  let memberProfile: any = null;

  // Recherche par UUID
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(query);
  if (isUuid) {
    const { data: p } = await ub(sb, "membre_profiles").select("id, first_name, last_name").eq("id", query).maybeSingle();
    memberProfile = p;
  } else {
    // Recherche par téléphone ou extrait
    const { data: p } = await ub(sb, "membre_profiles").select("id, first_name, last_name").eq("phone", query).maybeSingle();
    memberProfile = p;
  }

  if (!memberProfile) {
    return { error: "Coureur non reconnu." };
  }

  // Vérifier appartenance au club
  const { data: rel } = await ub(sb, "membre_club")
    .select("id")
    .eq("membre_id", memberProfile.id)
    .eq("club_id", clubId)
    .maybeSingle();

  if (!rel) {
    return { error: `${memberProfile.first_name} ${memberProfile.last_name} n'est pas inscrit à ce crew.` };
  }

  // Valider le check-in
  const { data: existing } = await ub(sb, "membre_checkins")
    .select("id")
    .eq("membre_id", memberProfile.id)
    .eq("event_id", eventId)
    .maybeSingle();

  if (existing) {
    return { ok: true, already: true, runnerName: `${memberProfile.first_name} ${memberProfile.last_name}` };
  }

  await ub(sb, "membre_checkins").insert({
    membre_id: memberProfile.id,
    event_id: eventId,
    method: "qr_code",
    is_valid: true,
  });

  return { ok: true, already: false, runnerName: `${memberProfile.first_name} ${memberProfile.last_name}` };
}

/**
 * 6. Récupère la fiche d'urgence médicale (ICE) d'un coureur pour le Staff
 */
export async function staffGetRunnerIce(tokenString: string, memberId: string) {
  let sb: ReturnType<typeof createAdminClient>;
  try {
    sb = createAdminClient();
  } catch {
    return { error: "Service indisponible." };
  }

  const { data: staffToken } = await ub(sb, "club_staff_tokens")
    .select("is_active")
    .eq("token", tokenString)
    .eq("is_active", true)
    .maybeSingle();

  if (!staffToken || !staffToken.is_active) {
    return { error: "Accès non autorisé." };
  }

  const [{ data: profile }, { data: ice }] = await Promise.all([
    ub(sb, "membre_profiles").select("first_name, last_name, phone").eq("id", memberId).single(),
    ub(sb, "membre_ice").select("*").eq("membre_id", memberId).maybeSingle(),
  ]);

  if (!profile) return { error: "Coureur introuvable." };

  return {
    runner: {
      name: `${profile.first_name} ${profile.last_name}`,
      phone: profile.phone,
    },
    ice: ice ? {
      contactName: ice.contact_name,
      contactPhone: ice.contact_phone,
      relationship: ice.relationship || "Non précisé",
      bloodType: ice.blood_type || "Non renseigné",
      allergies: ice.allergies || "Aucune connue",
      medicalNotes: ice.medical_notes || "Aucune note",
    } : null,
  };
}
