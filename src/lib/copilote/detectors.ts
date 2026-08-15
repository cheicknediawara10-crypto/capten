// ─── COPILOTE — Détecteurs 100% SQL (zéro IA) ────────────────────────────────
// Fonctions pures qui interrogent la base et produisent des alertes candidates.
// Utilisable côté serveur (cron, service-role) comme côté client (session
// fondateur, RLS). Chaque alerte a une dedup_key pour éviter les doublons.

export interface AlertCandidate {
  category: "accueil" | "logistique" | "visuels" | "celebration" | "securite" | "sante" | "admin";
  priority: number; // 1 haute · 2 moyenne · 3 agréable
  title: string;
  message: string;
  cta_label?: string | null;
  cta_href?: string | null;
  dedup_key: string;
  expires_at?: string | null;
}

const DAY = 86_400_000;

function weekKey(d = new Date()): string {
  const dt = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (dt.getUTCDay() + 6) % 7;
  dt.setUTCDate(dt.getUTCDate() - dayNum + 3);
  const firstThu = new Date(Date.UTC(dt.getUTCFullYear(), 0, 4));
  const week =
    1 +
    Math.round(
      ((dt.getTime() - firstThu.getTime()) / DAY - 3 + ((firstThu.getUTCDay() + 6) % 7)) / 7
    );
  return `${dt.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

const frDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
const frDay = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { weekday: "long" });

function joinNames(list: string[], max = 2): string {
  const clean = list.filter(Boolean);
  if (clean.length === 0) return "";
  if (clean.length <= max) return clean.join(" et ");
  const rest = clean.length - max;
  return `${clean.slice(0, max).join(", ")} et ${rest} autre${rest > 1 ? "s" : ""}`;
}

async function validCheckins(supabase: any, eventId: string): Promise<number> {
  const { count } = await supabase
    .from("membre_checkins")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId)
    .eq("is_valid", true);
  return count || 0;
}

export async function detectAlertsForClub(
  supabase: any,
  club: { id: string }
): Promise<AlertCandidate[]> {
  const clubId = club.id;
  const now = new Date();
  const nowIso = now.toISOString();
  const in3d = new Date(now.getTime() + 3 * DAY).toISOString();
  const in5d = new Date(now.getTime() + 5 * DAY).toISOString();
  const last2d = new Date(now.getTime() - 2 * DAY).toISOString();
  const last7d = new Date(now.getTime() - 7 * DAY).toISOString();
  const wk = weekKey(now);
  const out: AlertCandidate[] = [];

  // ── Runs publiés à venir ──
  const { data: upcoming } = await supabase
    .from("events")
    .select("id, title, event_date, affiche_telechargee")
    .eq("club_id", clubId)
    .eq("status", "published")
    .gte("event_date", nowIso)
    .order("event_date", { ascending: true });
  const up: any[] = upcoming || [];

  // 1. Aucun run prévu
  if (up.length === 0) {
    out.push({
      category: "logistique",
      priority: 2,
      title: "Aucun run prévu",
      message: "Aucun run à venir cette semaine. Tu en lances un ?",
      cta_label: "Créer un run",
      cta_href: "/dashboard/events/new",
      dedup_key: `no_run_${wk}`,
    });
  } else {
    // 2. Un run approche (dans 3 jours) → rappel
    const soon = up.find((e) => e.event_date <= in3d);
    if (soon) {
      out.push({
        category: "logistique",
        priority: 2,
        title: "Un run approche",
        message: `Ton run « ${soon.title} » approche (${frDate(soon.event_date)}). Un rappel au crew ?`,
        cta_label: "Envoyer un rappel",
        cta_href: "/messages",
        dedup_key: `run_soon_${soon.id}`,
        expires_at: soon.event_date,
      });
    }
    // 3. Affiche à partager (run dans 5j, pas encore téléchargée)
    for (const e of up.filter((x) => x.event_date <= in5d && !x.affiche_telechargee)) {
      out.push({
        category: "visuels",
        priority: 3,
        title: "Affiche à partager",
        message: `📢 Ton run « ${e.title} » (${frDay(e.event_date)}) approche. Crée l'affiche pour le partager.`,
        cta_label: "Créer l'affiche",
        cta_href: `/dashboard/events/${e.id}`,
        dedup_key: `affiche_${e.id}`,
        expires_at: e.event_date,
      });
    }
  }

  // ── Runs terminés récents (48h) → story + record ──
  const { data: recentDone } = await supabase
    .from("events")
    .select("id, title, event_date, story_telechargee")
    .eq("club_id", clubId)
    .eq("status", "completed")
    .gte("event_date", last2d)
    .order("event_date", { ascending: false });
  const recent: any[] = recentDone || [];

  for (const e of recent) {
    const present = await validCheckins(supabase, e.id);
    // 4. Story prête
    if (present >= 1 && !e.story_telechargee) {
      out.push({
        category: "visuels",
        priority: 3,
        title: "Story prête",
        message: `📸 Ta story du run « ${e.title} » est prête (${present} coureur${present > 1 ? "s" : ""}).`,
        cta_label: "Créer ma story",
        cta_href: `/dashboard/events/${e.id}`,
        dedup_key: `story_${e.id}`,
        expires_at: new Date(now.getTime() + 2 * DAY).toISOString(),
      });
    }
  }

  // 5. Nouveaux membres cette semaine (accueil)
  const { data: newMembers } = await supabase
    .from("membre_club")
    .select("joined_at, membre_profiles(first_name)")
    .eq("club_id", clubId)
    .eq("is_active", true)
    .gte("joined_at", last7d);
  const nm: any[] = newMembers || [];
  if (nm.length > 0) {
    const firsts = nm.map((m) => m.membre_profiles?.first_name).filter(Boolean);
    const label = joinNames(firsts) || `${nm.length} coureur${nm.length > 1 ? "s" : ""}`;
    const plural = nm.length > 1;
    out.push({
      category: "accueil",
      priority: 2,
      title: "Nouveaux dans le crew",
      message: `${label} ${plural ? "ont" : "a"} rejoint le crew cette semaine. Accueille-${plural ? "les" : "le"} 🖤`,
      cta_label: "Écrire un mot",
      cta_href: "/messages",
      dedup_key: `welcome_${wk}`,
    });
  }

  // 6. Fiches ICE manquantes (sécurité)
  const { data: activeM } = await supabase
    .from("membre_club")
    .select("membre_id")
    .eq("club_id", clubId)
    .eq("is_active", true);
  const memberIds: string[] = (activeM || []).map((m: any) => m.membre_id).filter(Boolean);
  if (memberIds.length > 0) {
    const { data: iceRows } = await supabase
      .from("membre_ice")
      .select("membre_id")
      .in("membre_id", memberIds);
    const withIce = new Set((iceRows || []).map((i: any) => i.membre_id));
    const missing = memberIds.filter((id) => !withIce.has(id)).length;
    if (missing > 0) {
      out.push({
        category: "securite",
        priority: 2,
        title: "Fiches ICE manquantes",
        message: `${missing} membre${missing > 1 ? "s" : ""} n'${missing > 1 ? "ont" : "a"} pas de fiche d'urgence (ICE). Sécurise ton crew.`,
        cta_label: "Voir les membres",
        cta_href: "/dashboard/members",
        dedup_key: `no_ice_${wk}`,
      });
    }
  }

  // 7. Record d'affluence (le dernier run terminé bat tous les autres)
  if (recent.length > 0) {
    const { data: allDone } = await supabase
      .from("events")
      .select("id, title")
      .eq("club_id", clubId)
      .eq("status", "completed");
    const doneList: any[] = allDone || [];
    if (doneList.length >= 2) {
      const last = recent[0];
      const lastCount = await validCheckins(supabase, last.id);
      if (lastCount > 0) {
        let recordBeaten = true;
        for (const e of doneList) {
          if (e.id === last.id) continue;
          if ((await validCheckins(supabase, e.id)) >= lastCount) {
            recordBeaten = false;
            break;
          }
        }
        if (recordBeaten) {
          out.push({
            category: "celebration",
            priority: 3,
            title: "Record d'affluence 🔥",
            message: `Record battu : ${lastCount} coureurs au run « ${last.title} ». Annonce-le au crew !`,
            cta_label: "Créer ma story",
            cta_href: `/dashboard/events/${last.id}`,
            dedup_key: `record_${last.id}`,
            expires_at: new Date(now.getTime() + 3 * DAY).toISOString(),
          });
        }
      }
    }
  }

  return out;
}

// Transforme les candidats en lignes prêtes pour un upsert (ignoreDuplicates).
export function alertsToRows(clubId: string, cands: AlertCandidate[]) {
  return cands.map((a) => ({
    club_id: clubId,
    category: a.category,
    priority: a.priority,
    title: a.title,
    message: a.message,
    cta_label: a.cta_label ?? null,
    cta_href: a.cta_href ?? null,
    dedup_key: a.dedup_key,
    expires_at: a.expires_at ?? null,
  }));
}
