import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Phone, Shield, Calendar, MapPin, CheckCircle2,
  FileText, LogOut, ChevronRight, ExternalLink, ArrowRight, AlertTriangle
} from "lucide-react";
import { requireMembreSession } from "@/lib/membre-session";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDateShort } from "@/lib/utils/format";
import LogoutButton from "./LogoutButton";
import PushNotificationPrompt from "@/components/push/PushNotificationPrompt";
import SuggestSpotModal from "./SuggestSpotModal";

type MembreProfile = {
  id: string; first_name: string; last_name: string;
  date_of_birth: string; phone: string | null; created_at: string;
};
type MembreIce = {
  contact_name: string; contact_phone: string; relationship: string | null;
  blood_type: string | null; allergies: string | null; medical_notes: string | null;
};
type CrewSpot = {
  id: string; nom: string; categorie: string; adresse: string | null;
  lien_maps: string | null; mot_du_fondateur: string | null; avantage: string | null;
  suggested_by_name?: string | null; status?: string;
};

const CAT_EMOJI: Record<string, string> = {
  cafe: "☕", boulangerie: "🥐", shop: "👟", kine: "🦵", osteo: "🤸", autre: "📍",
};

// Tables not yet in Supabase generated types — cast query results explicitly
function ub(supabase: ReturnType<typeof createAdminClient>, table: string): any { // any bypasses builder generics for untyped tables
  return supabase.from(table as Parameters<ReturnType<typeof createAdminClient>["from"]>[0]);
}

async function getMembreData(membreId: string) {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    return null;
  }

  const [
    { data: membreRaw },
    { data: clubs },
    { data: iceRaw },
    { data: waivers },
    { count: checkinCount },
    { data: upcomingEvents },
  ] = await Promise.all([
    ub(supabase, "membre_profiles")
      .select("id, first_name, last_name, date_of_birth, phone, created_at")
      .eq("id", membreId)
      .single(),

    ub(supabase, "membre_club")
      .select("club_id, joined_at, clubs(id, name, logo_url, city, website_url, cagnotte_url)")
      .eq("membre_id", membreId)
      .eq("is_active", true),

    ub(supabase, "membre_ice")
      .select("contact_name, contact_phone, relationship, blood_type, allergies, medical_notes")
      .eq("membre_id", membreId)
      .maybeSingle(),

    ub(supabase, "membre_waivers")
      .select("signed_at, waiver_version, clubs(name)")
      .eq("membre_id", membreId),

    ub(supabase, "membre_checkins")
      .select("*", { count: "exact", head: true })
      .eq("membre_id", membreId)
      .eq("is_valid", true),

    supabase
      .from("events")
      .select("id, title, event_date, meeting_point_address, clubs(name)")
      .eq("status", "published")
      .gte("event_date", new Date().toISOString())
      .order("event_date")
      .limit(5),
  ]);

  const membre = membreRaw as MembreProfile | null;
  const ice = iceRaw as MembreIce | null;

  if (!membre) return null;

  // Spots recommandés par les clubs du membre
  const clubIds = (clubs ?? []).map((mc: any) => mc.club_id).filter(Boolean);
  const { data: spotsRaw } = clubIds.length > 0
    ? await ub(supabase, "crew_spots")
        .select("id, nom, categorie, adresse, lien_maps, mot_du_fondateur, avantage, suggested_by_name, status")
        .in("club_id", clubIds)
        .neq("status", "pending")
        .order("ordre")
    : { data: [] };

  return {
    membre,
    clubs: (clubs ?? []) as any[],
    ice,
    waivers: (waivers ?? []) as any[],
    checkinCount: checkinCount ?? 0,
    upcomingEvents: (upcomingEvents ?? []) as any[],
    spots: (spotsRaw ?? []) as CrewSpot[],
  };
}

export default async function ProfilPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const membreId = await requireMembreSession();
  const data = await getMembreData(membreId);
  const { tab = "profil" } = await searchParams;

  if (!data) {
    redirect("/mon-espace");
  }

  const { membre, clubs, ice, waivers, checkinCount, upcomingEvents, spots } = data;
  const initials = `${membre.first_name[0] ?? ""}${membre.last_name[0] ?? ""}`.toUpperCase();
  const primaryClub = (clubs[0] as any)?.clubs;

  // Ce qui compte pour le coureur : est-il prêt à courir, et c'est quand le prochain run ?
  const isReady = waivers.length > 0 && !!ice;
  const nextRun = upcomingEvents[0] as any | undefined;

  const TABS = [
    { key: "profil",    label: "Profil",    icon: CheckCircle2 },
    { key: "ice",       label: "ICE",       icon: Shield },
    { key: "agenda",    label: "Agenda",    icon: Calendar },
    { key: "spots",     label: "Adresses",  icon: MapPin },
    { key: "decharges", label: "Décharges", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F3]">

      {/* Header — dark card */}
      <div className="bg-[#111111] px-5 pt-12 pb-8 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, #FF5500 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8 relative">
          <Link href="/" className="text-white/40 hover:text-white/70 transition-colors">
            <img src="/logo.png" alt="CAPTEN" className="h-5 w-auto brightness-0 invert opacity-50" />
          </Link>
          <LogoutButton />
        </div>

        {/* Avatar + name */}
        <div className="flex flex-col items-center text-center relative">
          <div className="w-20 h-20 rounded-2xl bg-[#FF5500]/20 border-2 border-[#FF5500]/50 flex items-center justify-center text-2xl font-extrabold text-[#FF5500] mb-4">
            {initials}
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">
            {membre.first_name} {membre.last_name}
          </h1>
          {primaryClub && (
            <p className="text-sm text-white/50 mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {primaryClub.name}
              {primaryClub.city ? ` · ${primaryClub.city}` : ""}
            </p>
          )}

          {/* Statut "prêt à courir" — l'info n°1 pour le coureur */}
          <div
            className={`mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-bold ${
              isReady
                ? "bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30"
                : "bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30"
            }`}
          >
            {isReady ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
            {isReady ? "Prêt à courir" : "Complète ta fiche"}
          </div>

          {/* Stats */}
          <div className="flex gap-8 mt-6">
            <div className="text-center">
              <p className="text-3xl font-extrabold text-[#FF5500] leading-none">{checkinCount}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Run{checkinCount > 1 ? "s" : ""} couru{checkinCount > 1 ? "s" : ""}</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <p className="text-3xl font-extrabold text-[#FF5500] leading-none">{clubs.length}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Crew{clubs.length > 1 ? "s" : ""}</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <p className="text-3xl font-extrabold text-[#FF5500] leading-none">{waivers.length}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Décharge{waivers.length > 1 ? "s" : ""}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-[#E8E8E8] sticky top-0 z-20 overflow-x-auto">
        {TABS.map(({ key, label, icon: Icon }) => (
          <Link
            key={key}
            href={`/mon-espace/profil?tab=${key}`}
            className={`flex-1 min-w-0 flex flex-col items-center gap-1 py-3 text-[10px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
              tab === key
                ? "text-[#FF5500] border-b-2 border-[#FF5500]"
                : "text-[#9CA3AF] hover:text-[#6B7280]"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </div>

      {/* Tab content */}
      <div className="max-w-sm mx-auto px-4 py-6 space-y-4">
        <PushNotificationPrompt clubId={primaryClub?.id} />

        {/* ── PROFIL ── */}
        {tab === "profil" && (
          <>
            {/* Prochain run — l'action que le coureur cherche */}
            {nextRun ? (
              <Link
                href={`/checkin/${nextRun.id}`}
                className="block rounded-2xl overflow-hidden bg-gradient-to-br from-[#FF5500] to-[#E04B00] text-white p-5 active:scale-[0.99] transition-transform shadow-[0_8px_24px_rgba(255,85,0,0.28)]"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">Ton prochain run</p>
                <p className="text-[11px] font-bold uppercase tracking-wider text-white/90 mt-2">
                  {formatDateShort(nextRun.event_date)}
                </p>
                <p className="text-lg font-extrabold leading-tight mt-0.5">{nextRun.title}</p>
                {nextRun.meeting_point_address && (
                  <p className="text-xs text-white/80 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {nextRun.meeting_point_address}
                  </p>
                )}
                <span className="inline-flex items-center gap-1.5 mt-4 bg-white text-[#FF5500] text-[11px] font-black uppercase tracking-widest px-3.5 py-2 rounded-full">
                  Voir le run <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            ) : (
              <Link
                href="/mon-espace/profil?tab=agenda"
                className="block bg-white rounded-2xl border border-[#E8E8E8] p-6 text-center hover:border-[#D0D0D0] transition-colors"
              >
                <Calendar className="w-8 h-8 text-[#E8E8E8] mx-auto mb-2" />
                <p className="text-sm font-bold text-[#111111]">Aucun run prévu</p>
                <p className="text-xs text-[#9CA3AF] mt-0.5">Ton crew publiera bientôt le prochain.</p>
              </Link>
            )}

            {/* Soutien / Cotisation du Crew */}
            {(primaryClub?.website_url || primaryClub?.cagnotte_url) && (
              <div className="bg-gradient-to-br from-amber-500/[0.08] via-white to-white rounded-2xl border border-amber-500/30 p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 font-bold text-base shrink-0">
                    ☕
                  </span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-tight text-[#111111]">
                      Cotisation & Soutien du Crew
                    </p>
                    <p className="text-[11px] text-[#6B7280]">
                      {primaryClub.name}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  Participe à la caisse du club pour soutenir l&apos;organisation des runs, les ravitaillements et les équipements du crew.
                </p>
                <a
                  href={primaryClub.website_url || primaryClub.cagnotte_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-black uppercase tracking-wider transition-all shadow-sm"
                >
                  Soutenir le crew en 1 clic ↗
                </a>
              </div>
            )}

            {/* Ta fiche — statut prêt à courir en un coup d'œil */}
            <div className="bg-white rounded-2xl border border-[#E8E8E8] p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">Ta fiche</p>
              <div className="space-y-2">
                <ReadyRow ok={waivers.length > 0} label="Décharge de responsabilité" okText="Signée" koText="À signer avec ton crew" />
                <Link href="/mon-espace/profil?tab=ice" className="block">
                  <ReadyRow ok={!!ice} label="Contact d'urgence (ICE)" okText="Renseigné" koText="À compléter" chevron />
                </Link>
              </div>
            </div>

            {clubs.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#E8E8E8] p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-4">
                  Mes crews
                </p>
                <div className="space-y-3">
                  {clubs.map((mc: any) => (
                    <div key={mc.club_id} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#FF5500]/10 flex items-center justify-center text-sm font-bold text-[#FF5500] shrink-0 overflow-hidden">
                        {mc.clubs?.logo_url
                          ? <img src={mc.clubs.logo_url} alt="" className="w-full h-full object-cover" />
                          : (mc.clubs?.name?.[0] ?? "C")}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#111111]">{mc.clubs?.name}</p>
                        <p className="text-xs text-[#9CA3AF]">
                          Rejoint {new Date(mc.joined_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                        </p>
                      </div>
                      <div className="ml-auto w-2 h-2 rounded-full bg-[#22C55E]" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Infos — replié en bas, secondaire */}
            <details className="group bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden">
              <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">Mes informations</p>
                <ChevronRight className="w-4 h-4 text-[#9CA3AF] group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-5 pb-5 space-y-3">
                <Row label="Prénom" value={membre.first_name} />
                <Row label="Nom" value={membre.last_name} />
                <Row label="Date de naissance" value={new Date(membre.date_of_birth).toLocaleDateString("fr-FR")} />
                {membre.phone && <Row label="Téléphone" value={membre.phone} />}
                <Row label="Membre depuis" value={new Date(membre.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })} />
              </div>
            </details>

            <Link
              href="/mon-espace/profil?tab=spots"
              className="flex items-center gap-3 w-full bg-white rounded-2xl border border-[#E8E8E8] p-5 hover:border-[#D0D0D0] transition-colors"
            >
              <span className="w-10 h-10 rounded-xl bg-[#FF5500]/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-[#FF5500]" />
              </span>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-bold text-[#111111]">Les Bonnes Adresses du Crew</p>
                <p className="text-xs text-[#9CA3AF] mt-0.5">Cafés, boulangeries, kinés &amp; bons plans partagés</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#9CA3AF] shrink-0" />
            </Link>

            <Link
              href="/mon-espace/signaler"
              className="flex items-center gap-3 w-full bg-white rounded-2xl border border-[#E8E8E8] p-5 hover:border-[#D0D0D0] transition-colors"
            >
              <span className="w-10 h-10 rounded-xl bg-[#FF5500]/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-[#FF5500]" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#111111]">Signaler un problème / donner mon avis</p>
                <p className="text-xs text-[#9CA3AF] mt-0.5">Sécurité, organisation, idée — vu par ton organisateur seul. Anonyme possible.</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#9CA3AF] shrink-0" />
            </Link>

            <Link
              href="/mon-espace/pin-oublie"
              className="flex items-center justify-between w-full bg-white rounded-2xl border border-[#E8E8E8] p-5 hover:border-[#D0D0D0] transition-colors"
            >
              <div>
                <p className="text-sm font-bold text-[#111111]">Changer mon code PIN</p>
                <p className="text-xs text-[#9CA3AF] mt-0.5">Via e-mail de réinitialisation</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
            </Link>
          </>
        )}

        {/* ── ICE ── */}
        {tab === "ice" && (
          <div className="bg-white rounded-2xl border border-[#E8E8E8] p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-[#22C55E]" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-[#111111]">Contact d'urgence</p>
                <p className="text-xs text-[#9CA3AF]">In Case of Emergency</p>
              </div>
            </div>

            {ice ? (
              <div className="space-y-4">
                <div className="bg-[#F5F5F3] rounded-xl p-4 space-y-3">
                  <Row label="Nom" value={ice.contact_name} />
                  {ice.relationship && <Row label="Relation" value={ice.relationship} />}
                  {ice.blood_type && <Row label="Groupe sanguin" value={ice.blood_type} />}
                  {ice.allergies && <Row label="Allergies" value={ice.allergies} />}
                  {ice.medical_notes && <Row label="Notes médicales" value={ice.medical_notes} />}
                </div>
                <a
                  href={`tel:${ice.contact_phone}`}
                  className="flex items-center justify-center gap-3 w-full h-14 rounded-2xl bg-[#EF4444] text-white font-extrabold text-sm tracking-wide hover:bg-[#DC2626] transition-colors active:scale-[0.97]"
                >
                  <Phone className="w-5 h-5" />
                  {ice.contact_phone}
                </a>
                <p className="text-[11px] text-[#9CA3AF] text-center">
                  Appuie pour appeler en cas d'urgence
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <Shield className="w-10 h-10 text-[#E8E8E8] mx-auto mb-3" />
                <p className="text-sm font-semibold text-[#374151]">Fiche ICE non renseignée</p>
                <p className="text-xs text-[#9CA3AF] mt-1 max-w-[220px] mx-auto">
                  Contacte ton organisateur pour mettre à jour ta fiche.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── AGENDA ── */}
        {tab === "agenda" && (
          <div className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-12 px-5">
                <Calendar className="w-10 h-10 text-[#E8E8E8] mx-auto mb-3" />
                <p className="text-sm font-semibold text-[#374151]">Aucun run prévu</p>
                <p className="text-xs text-[#9CA3AF] mt-1">Les prochains runs apparaîtront ici.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#F5F5F3]">
                {upcomingEvents.map((ev: any) => (
                  <div key={ev.id} className="p-4">
                    <p className="text-[11px] text-[#FF5500] font-bold uppercase tracking-wider">
                      {formatDateShort(ev.event_date)}
                    </p>
                    <p className="text-sm font-extrabold text-[#111111] mt-0.5">{ev.title}</p>
                    {ev.meeting_point_address && (
                      <p className="text-xs text-[#9CA3AF] flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {ev.meeting_point_address}
                      </p>
                    )}
                    {(ev as any).clubs?.name && (
                      <p className="text-xs text-[#9CA3AF] mt-0.5">{(ev as any).clubs.name}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SPOTS DU CREW ── */}
        {tab === "spots" && (
          <>
            <div className="bg-white rounded-2xl border border-[#E8E8E8] p-4 flex items-start gap-2.5">
              <span className="text-lg shrink-0">🗺️</span>
              <p className="text-xs text-[#6B7280] leading-snug">
                Les adresses &amp; bons plans recommandés par ton crew — café d&apos;après-run, boulangerie, shop, kiné. Tu as une pépite ? Partage-la ci-dessous !
              </p>
            </div>

            <SuggestSpotModal />

            {spots.length === 0 && (
              <div className="bg-white rounded-2xl border border-[#E8E8E8] p-8 text-center space-y-2">
                <span className="text-3xl block mb-2">🥐☕👟</span>
                <p className="text-sm font-extrabold text-[#111111]">Aucune adresse pour l&apos;instant</p>
                <p className="text-xs text-[#9CA3AF] max-w-xs mx-auto leading-relaxed">
                  Sois le premier à proposer ton café after-run, ta boulangerie ou ton bon plan avec le bouton ci-dessus !
                </p>
              </div>
            )}

            {spots.map((s) => {
              const isSponsor = s.avantage?.toLowerCase().includes("sponsor") || s.mot_du_fondateur?.toLowerCase().includes("sponsor");
              return (
                <div
                  key={s.id}
                  className={`rounded-2xl border p-4 transition-all ${
                    isSponsor
                      ? "bg-gradient-to-br from-amber-500/[0.08] via-white to-white border-amber-500/40 shadow-sm"
                      : "bg-white border-[#E8E8E8]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl shrink-0 mt-0.5">{CAT_EMOJI[s.categorie] ?? "📍"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-extrabold text-[#111111] leading-tight">{s.nom}</p>
                        {isSponsor && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black text-[9.5px] font-black uppercase tracking-wider">
                            ⭐ Sponsor Officiel
                          </span>
                        )}
                      </div>
                      {s.suggested_by_name && (
                        <p className="text-[10.5px] font-bold text-[#FF5500] mt-0.5">
                          🤝 Découvert par {s.suggested_by_name}
                        </p>
                      )}
                      {s.mot_du_fondateur && (
                        <p className="text-xs text-[#9CA3AF] italic mt-0.5">« {s.mot_du_fondateur} »</p>
                      )}
                      {s.adresse && (
                        <p className="text-xs text-[#9CA3AF] flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {s.adresse}
                        </p>
                      )}
                      {s.avantage && (
                        <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          isSponsor ? "bg-amber-500 text-black font-black" : "bg-[#FF5500] text-white"
                        }`}>
                          {isSponsor ? "⭐" : "🎁"} {s.avantage}
                        </span>
                      )}
                    </div>
                    {s.lien_maps && (
                      <a
                        href={s.lien_maps}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 w-8 h-8 rounded-full bg-[#F5F5F3] flex items-center justify-center text-[#9CA3AF] hover:bg-[#FF5500] hover:text-white transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* ── DÉCHARGES ── */}
        {tab === "decharges" && (
          <div className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden">
            {waivers.length === 0 ? (
              <div className="text-center py-12 px-5">
                <FileText className="w-10 h-10 text-[#E8E8E8] mx-auto mb-3" />
                <p className="text-sm font-semibold text-[#374151]">Aucune décharge signée</p>
              </div>
            ) : (
              <div className="divide-y divide-[#F5F5F3]">
                {waivers.map((w: any, i: number) => (
                  <div key={i} className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#111111] truncate">
                        {(w as any).clubs?.name ?? "Club"}
                      </p>
                      <p className="text-xs text-[#9CA3AF]">
                        Signée le {new Date(w.signed_at).toLocaleDateString("fr-FR")} · {w.waiver_version}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-xs text-[#9CA3AF] font-medium shrink-0">{label}</span>
      <span className="text-xs font-bold text-[#111111] text-right">{value}</span>
    </div>
  );
}

function ReadyRow({
  ok, label, okText, koText, chevron,
}: { ok: boolean; label: string; okText: string; koText: string; chevron?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${ok ? "bg-[#DCFCE7]" : "bg-[#FEF3C7]"}`}>
        {ok ? <CheckCircle2 className="w-4 h-4 text-[#22C55E]" /> : <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-[#111111] leading-tight">{label}</p>
        <p className={`text-[11px] font-semibold ${ok ? "text-[#22C55E]" : "text-[#F59E0B]"}`}>{ok ? okText : koText}</p>
      </div>
      {chevron && <ChevronRight className="w-4 h-4 text-[#9CA3AF] shrink-0" />}
    </div>
  );
}
