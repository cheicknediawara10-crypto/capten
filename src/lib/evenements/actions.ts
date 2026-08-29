"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthenticatedCaptainId } from "@/lib/auth-server";
import { sendReservationEmail, sendWaitlistPromotionEmail, sendExpiredReservationEmail } from "./emails";
import { getAppUrl } from "@/lib/domain";

function ub(supabase: ReturnType<typeof createAdminClient>, table: string): any {
  return supabase.from(table as Parameters<ReturnType<typeof createAdminClient>["from"]>[0]);
}

/**
 * Infos PUBLIQUES d'un run pour la page d'inscription (côté coureur).
 * Passe par la clé service (jamais la clé anon) : on ne renvoie QUE l'événement
 * public + deux COMPTEURS. Aucune donnée personnelle des autres inscrits (nom,
 * email, téléphone) ne transite — contrairement à une lecture directe anon.
 */
export async function getPublicEventInfo(eventId: string) {
  if (!eventId) return { error: "not_found" };
  let sb: ReturnType<typeof createAdminClient>;
  try { sb = createAdminClient(); } catch { return { error: "Service indisponible." }; }

  const { data: event } = await ub(sb, "events")
    .select("*, clubs(name, logo_url, city)")
    .eq("id", eventId)
    .maybeSingle();

  // Ne jamais exposer un brouillon : uniquement les runs publiés/terminés.
  if (!event || (event.status !== "published" && event.status !== "completed")) {
    return { error: "not_found" };
  }

  const [{ count: mainCount }, { count: wlCount }] = await Promise.all([
    ub(sb, "event_inscriptions").select("id", { count: "exact", head: true }).eq("event_id", eventId).is("position_liste_attente", null),
    ub(sb, "event_inscriptions").select("id", { count: "exact", head: true }).eq("event_id", eventId).not("position_liste_attente", "is", null),
  ]);

  return { event, mainCount: mainCount || 0, waitlistCount: wlCount || 0 };
}

export interface RegisterInput {
  eventId: string;
  nom: string;
  prenom: string;
  email?: string | null;
  telephone?: string | null;
  membreId?: string | null;
  paceGroup?: string | null;
}

/**
 * Inscription publique d'un coureur à un run (standard ou événement)
 */
export async function registerToEvent(input: RegisterInput) {
  let sb: ReturnType<typeof createAdminClient>;
  try {
    sb = createAdminClient();
  } catch {
    return { error: "Service indisponible, réessaie plus tard." };
  }

  // 1. Récupération des informations de la sortie
  const { data: event, error: eventErr } = await ub(sb, "events")
    .select("id, title, event_date, is_evenement, jauge_max, prix, devise, lien_paiement, status, club_id")
    .eq("id", input.eventId)
    .single();

  if (eventErr || !event || event.status !== "published") {
    return { error: "Sortie introuvable ou fermée aux inscriptions." };
  }

  const isEvenement = !!event.is_evenement;
  const jaugeMax = event.jauge_max || 0;

  // 2. Inscription ATOMIQUE (anti-surbooking) via la fonction SQL à verrou d'avis.
  //    Fallback count-then-insert si la fonction n'est pas encore déployée en base.
  let inscription: any = null;
  const { data: rpcRow, error: rpcErr } = await (sb as any).rpc("register_event_inscription", {
    p_event_id: input.eventId,
    p_membre_id: input.membreId || null,
    p_nom: input.nom,
    p_prenom: input.prenom,
    p_email: input.email || null,
    p_telephone: input.telephone || null,
  });

  if (!rpcErr && rpcRow) {
    inscription = Array.isArray(rpcRow) ? rpcRow[0] : rpcRow;
  } else {
    // Fallback : la fonction atomique n'existe pas encore (SQL non exécuté).
    const { count: currentCount } = await ub(sb, "event_inscriptions")
      .select("id", { count: "exact", head: true })
      .eq("event_id", input.eventId)
      .is("position_liste_attente", null);
    const activeCount = currentCount || 0;
    const full = isEvenement && jaugeMax > 0 && activeCount >= jaugeMax;

    let positionListeAttente: number | null = null;
    let expiresAt: string | null = null;
    if (full) {
      const { count: waitlistCount } = await ub(sb, "event_inscriptions")
        .select("id", { count: "exact", head: true })
        .eq("event_id", input.eventId)
        .not("position_liste_attente", "is", null);
      positionListeAttente = (waitlistCount || 0) + 1;
    } else if (isEvenement) {
      expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    }

    const { data: ins, error: insErr } = await ub(sb, "event_inscriptions")
      .insert({
        event_id: input.eventId,
        membre_id: input.membreId || null,
        nom: input.nom.trim(),
        prenom: input.prenom.trim(),
        email: input.email?.trim() || null,
        telephone: input.telephone?.trim() || null,
        pace_group: input.paceGroup?.trim() || null,
        statut_paiement: "en_attente",
        position_liste_attente: positionListeAttente,
        confirme_par_coureur: false,
        confirme_par_fondateur: false,
        expires_at: expiresAt,
      })
      .select()
      .single();
    if (insErr || !ins) return { error: insErr?.message || "Impossible de valider l'inscription." };
    inscription = ins;
  }

  // pace_group : la fonction atomique RPC ne le prend pas en paramètre → on le
  // pose après coup pour couvrir le chemin RPC (le fallback l'a déjà inséré).
  if (input.paceGroup && inscription && !inscription.pace_group) {
    const { data: upd } = await ub(sb, "event_inscriptions")
      .update({ pace_group: input.paceGroup.trim() })
      .eq("id", inscription.id)
      .select()
      .single();
    if (upd) inscription = upd;
  }

  const isFull = inscription.position_liste_attente !== null;

  // 3. Email de réservation (uniquement inscrit + événement + email fourni)
  if (input.email && !isFull && isEvenement) {
    const formattedDate = new Date(event.event_date).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
    await sendReservationEmail({
      to: input.email,
      prenom: input.prenom,
      runTitle: event.title,
      eventDate: formattedDate,
      lienPaiement: event.lien_paiement,
      prix: event.prix,
      devise: event.devise,
    });
  }

  // 4. Places restantes : recompté frais après insertion (source de vérité fiable).
  let remainingSpots: number | null = null;
  if (jaugeMax > 0) {
    const { count: activeNow } = await ub(sb, "event_inscriptions")
      .select("id", { count: "exact", head: true })
      .eq("event_id", input.eventId)
      .is("position_liste_attente", null);
    remainingSpots = Math.max(0, jaugeMax - (activeNow || 0));
  }

  return {
    status: isFull ? "waitlisted" : "registered",
    inscription,
    position: inscription.position_liste_attente,
    remainingSpots,
  };
}

/**
 * Déclaration de paiement par le coureur (« J'ai payé »)
 */
export async function declarePaymentByRunner(inscriptionId: string) {
  let sb: ReturnType<typeof createAdminClient>;
  try {
    sb = createAdminClient();
  } catch {
    return { error: "Service indisponible." };
  }

  const { data, error } = await ub(sb, "event_inscriptions")
    .update({
      confirme_par_coureur: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", inscriptionId)
    .select()
    .single();

  if (error) return { error: error.message };
  return { ok: true, inscription: data };
}

/**
 * Validation de paiement par le capitaine (Organisateur)
 */
export async function validatePaymentByCaptain(inscriptionId: string) {
  const clubId = await getAuthenticatedCaptainId();
  if (!clubId) return { error: "unauth" };

  let sb: ReturnType<typeof createAdminClient>;
  try {
    sb = createAdminClient();
  } catch {
    return { error: "Service indisponible." };
  }

  // Vérifier que l'inscription appartient bien à un événement du club
  const { data: ins } = await ub(sb, "event_inscriptions")
    .select("id, event_id, events(club_id)")
    .eq("id", inscriptionId)
    .single();

  if (!ins || ins.events?.club_id !== clubId) {
    return { error: "Action non autorisée." };
  }

  const { data, error } = await ub(sb, "event_inscriptions")
    .update({
      confirme_par_fondateur: true,
      statut_paiement: "paye",
      updated_at: new Date().toISOString(),
    })
    .eq("id", inscriptionId)
    .select()
    .single();

  if (error) return { error: error.message };
  return { ok: true, inscription: data };
}

/**
 * Promotion automatique du premier coureur sur liste d'attente
 */
export async function promoteNextInWaitlist(eventId: string) {
  let sb: ReturnType<typeof createAdminClient>;
  try {
    sb = createAdminClient();
  } catch {
    return { error: "Service indisponible." };
  }

  // 1. Trouver le coureur au rang 1
  const { data: firstInWaitlist } = await ub(sb, "event_inscriptions")
    .select("*, events(title, event_date, prix, devise, lien_paiement)")
    .eq("event_id", eventId)
    .eq("position_liste_attente", 1)
    .maybeSingle();

  if (!firstInWaitlist) return { promoted: false };

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  // 2. Promouvoir le coureur (quitte la liste d'attente)
  await ub(sb, "event_inscriptions")
    .update({
      position_liste_attente: null,
      promoted_at: new Date().toISOString(),
      expires_at: expiresAt,
      statut_paiement: "en_attente",
      confirme_par_coureur: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", firstInWaitlist.id);

  // 3. Décaler tous les rangs suivants (-1)
  const { data: remainingWaitlist } = await ub(sb, "event_inscriptions")
    .select("id, position_liste_attente")
    .eq("event_id", eventId)
    .gt("position_liste_attente", 1)
    .order("position_liste_attente", { ascending: true });

  if (remainingWaitlist && remainingWaitlist.length > 0) {
    for (const item of remainingWaitlist) {
      await ub(sb, "event_inscriptions")
        .update({
          position_liste_attente: (item.position_liste_attente as number) - 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id);
    }
  }

  // 4. Envoyer l'email d'information Resend
  if (firstInWaitlist.email) {
    const formattedDate = new Date(firstInWaitlist.events?.event_date || Date.now()).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    await sendWaitlistPromotionEmail({
      to: firstInWaitlist.email,
      prenom: firstInWaitlist.prenom,
      runTitle: firstInWaitlist.events?.title || "Run Événement",
      eventDate: formattedDate,
      confirmationUrl: `${getAppUrl()}/event/${eventId}`,
    });
  }

  return { promoted: true, runner: firstInWaitlist };
}

/**
 * Annulation d'une inscription par le capitaine (libère la place et promeut la liste d'attente)
 */
export async function cancelInscriptionByCaptain(inscriptionId: string) {
  const clubId = await getAuthenticatedCaptainId();
  if (!clubId) return { error: "unauth" };

  let sb: ReturnType<typeof createAdminClient>;
  try {
    sb = createAdminClient();
  } catch {
    return { error: "Service indisponible." };
  }

  const { data: ins } = await ub(sb, "event_inscriptions")
    .select("id, event_id, position_liste_attente, events(club_id)")
    .eq("id", inscriptionId)
    .single();

  if (!ins || ins.events?.club_id !== clubId) {
    return { error: "Action non autorisée." };
  }

  const eventId = ins.event_id;
  const wasInWaitlist = ins.position_liste_attente !== null;
  const oldPosition = ins.position_liste_attente;

  // Suppression de l'inscription
  await ub(sb, "event_inscriptions").delete().eq("id", inscriptionId);

  if (wasInWaitlist && oldPosition) {
    // Réajuster les positions de liste d'attente
    const { data: below } = await ub(sb, "event_inscriptions")
      .select("id, position_liste_attente")
      .eq("event_id", eventId)
      .gt("position_liste_attente", oldPosition);

    if (below) {
      for (const item of below) {
        await ub(sb, "event_inscriptions")
          .update({ position_liste_attente: (item.position_liste_attente as number) - 1 })
          .eq("id", item.id);
      }
    }
  } else {
    // Une place s'est libérée dans la jauge principale : promotion automatique du rang 1
    await promoteNextInWaitlist(eventId);
  }

  return { ok: true };
}

/**
 * Récupération du résumé complet des inscriptions d'un run pour le Cockpit
 */
export async function getEventInscriptionsSummary(eventId: string) {
  const clubId = await getAuthenticatedCaptainId();
  if (!clubId) return { error: "unauth" };

  let sb: ReturnType<typeof createAdminClient>;
  try {
    sb = createAdminClient();
  } catch {
    return { error: "Service indisponible." };
  }

  const { data: event } = await ub(sb, "events").select("*").eq("id", eventId).single();
  if (!event || event.club_id !== clubId) return { error: "not_found" };

  const { data: allInscriptions } = await ub(sb, "event_inscriptions")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

  const inscriptions = allInscriptions || [];

  const mainList = inscriptions.filter((i: any) => i.position_liste_attente === null);
  const waitlist = inscriptions
    .filter((i: any) => i.position_liste_attente !== null)
    .sort((a: any, b: any) => (a.position_liste_attente || 0) - (b.position_liste_attente || 0));

  const paidCount = mainList.filter((i: any) => i.statut_paiement === "paye" || i.confirme_par_fondateur).length;
  const waitingCount = mainList.length - paidCount;

  return {
    event,
    mainList,
    waitlist,
    stats: {
      registered: mainList.length,
      jaugeMax: event.jauge_max,
      paidCount,
      waitingCount,
      waitlistCount: waitlist.length,
    },
  };
}
