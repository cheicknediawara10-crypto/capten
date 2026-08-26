"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Calendar, MapPin, Users, QrCode, CheckSquare, FileText, List,
  Download, Globe, Lock, Trash2, Loader2, Wifi, Megaphone, Camera, MessageCircle,
  Luggage, Gauge, Coffee, Bell, Shield, Sparkles, CreditCard, Link2, Check, Send,
  UserCheck, UserX, AlertCircle, Phone, Mail, ExternalLink, ArrowUpRight, X
} from "lucide-react";
import Link from "next/link";
import { formatDateShort } from "@/lib/utils/format";
import { parsePracticalInfo } from "@/lib/utils/practical-info";
import dynamic from "next/dynamic";
import CrewVisualModal from "@/components/visuals/CrewVisualModal";
import { hasProAccess } from "@/lib/plan-access";
import { getAppUrl } from "@/lib/domain";
import { getRunDetail, setRunStatus, deleteRun, setRunFlag, sendRunPushNotification } from "../actions";
import {
  validatePaymentByCaptain,
  cancelInscriptionByCaptain,
  promoteNextInWaitlist,
} from "@/lib/evenements/actions";
import { getOrCreateStaffToken, revokeStaffToken } from "@/lib/staff/actions";

const QRCodeSVG = dynamic(() => import("qrcode.react").then((m) => ({ default: m.QRCodeSVG })), { ssr: false });

type Tab = "details" | "inscriptions" | "checkins" | "qr";

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  draft:     { label: "Brouillon",  color: "#F59E0B", bg: "rgba(245,158,11,0.14)" },
  published: { label: "Publié",     color: "#3DD68C", bg: "rgba(61,214,140,0.14)" },
  completed: { label: "Terminé",    color: "#94A3B8", bg: "rgba(148,163,184,0.14)" },
  cancelled: { label: "Annulé",     color: "#F87171", bg: "rgba(248,113,113,0.14)" },
};

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  meeting_point_address: string | null;
  meeting_point_lat: number | null;
  meeting_point_lng: number | null;
  max_participants: number | null;
  status: string;
  is_recurring: boolean;
  checkin_radius_meters: number;
  club_id: string;
  distance_km: number | null;
  affiche_telechargee?: boolean;
  story_telechargee?: boolean;
  is_evenement?: boolean;
  jauge_max?: number | null;
  prix?: number | null;
  devise?: string;
  lien_paiement?: string | null;
  description_evenement?: string | null;
}

interface Inscription {
  id: string;
  event_id: string;
  nom: string;
  prenom: string;
  email: string | null;
  telephone: string | null;
  statut_paiement: "en_attente" | "paye" | "rembourse";
  position_liste_attente: number | null;
  confirme_par_coureur: boolean;
  confirme_par_fondateur: boolean;
  expires_at: string | null;
  promoted_at: string | null;
  created_at: string;
}

interface MembreLite { first_name: string | null; last_name: string | null; phone: string | null }
const membreName = (m: MembreLite | null) =>
  [m?.first_name, m?.last_name].filter(Boolean).join(" ").trim();
const membreInitials = (m: MembreLite | null) =>
  membreName(m).split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

interface Checkin {
  id: string;
  checked_in_at: string;
  method: string;
  is_valid: boolean;
  membre_profiles: MembreLite | null;
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [club, setClub] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<Tab>("details");
  const [event, setEvent] = useState<Event | null>(null);
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [waitlist, setWaitlist] = useState<Inscription[]>([]);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveCount, setLiveCount] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);
  const [visualModal, setVisualModal] = useState<null | "affiche" | "story">(null);
  const [notifying, setNotifying] = useState(false);
  const [notifiedMsg, setNotifiedMsg] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Modal Staff / Co-Capitaine
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [staffData, setStaffData] = useState<{ token: string; staffUrl: string; label: string } | null>(null);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffCopied, setStaffCopied] = useState(false);

  async function handleOpenStaffModal() {
    if (!event) return;
    setStaffLoading(true);
    const res = await getOrCreateStaffToken(event.id);
    if ("error" in res) {
      alert(res.error);
    } else {
      setStaffData(res);
      setStaffModalOpen(true);
    }
    setStaffLoading(false);
  }

  async function handleRevokeStaff() {
    if (!staffData) return;
    if (!confirm("Révoquer ce lien staff ? Les co-capitaines ne pourront plus pointer avec ce lien.")) return;
    await revokeStaffToken(staffData.token);
    setStaffModalOpen(false);
    setStaffData(null);
    alert("Lien staff révoqué.");
  }

  async function handleSendPush() {
    if (!event) return;
    setNotifying(true);
    const res = await sendRunPushNotification(event.id);
    if ("ok" in res) {
      setNotifiedMsg(`🔔 ${res.sent} envoyé(s)`);
      setTimeout(() => setNotifiedMsg(null), 3000);
    } else {
      alert("Erreur lors de l'envoi de la notification.");
    }
    setNotifying(false);
  }

  const checkinUrl = typeof window !== "undefined"
    ? `${window.location.origin}/checkin/${id}`
    : `https://capten.run/checkin/${id}`;

  const loadEvent = useCallback(async () => {
    const res = await getRunDetail(id);
    if ("error" in res) {
      if (res.error === "unauth") router.push("/login");
      else router.push("/dashboard/events");
      return;
    }
    setEvent(res.event);
    setInscriptions(res.inscriptions || []);
    setWaitlist(res.waitlist || []);
    setCheckins(res.checkins);
    setLiveCount(res.checkins.filter((c) => c.is_valid).length);
    setClub(res.club);
    setLoading(false);
  }, [id, router]);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  async function togglePublish() {
    if (!event) return;
    setIsPublishing(true);
    const next = event.status === "published" ? "draft" : "published";
    const res = await setRunStatus(event.id, next);
    if ("event" in res && res.event) {
      setEvent(res.event);
    }
    setIsPublishing(false);
  }

  async function deleteEvent() {
    if (!confirm("Supprimer définitivement ce run ?")) return;
    const res = await deleteRun(id);
    if ("ok" in res) router.push("/dashboard/events");
  }

  // ── Actions Paiements & Liste d'Attente ──
  async function handleValidatePayment(insId: string) {
    setActionLoadingId(insId);
    const res = await validatePaymentByCaptain(insId);
    if ("ok" in res) {
      await loadEvent();
    } else {
      alert(res.error || "Erreur de validation.");
    }
    setActionLoadingId(null);
  }

  async function handleCancelInscription(insId: string, nom: string) {
    if (!confirm(`Annuler l'inscription de ${nom} ? Sa place sera libérée et proposée au premier de la liste d'attente.`)) return;
    setActionLoadingId(insId);
    const res = await cancelInscriptionByCaptain(insId);
    if ("ok" in res) {
      await loadEvent();
    } else {
      alert(res.error || "Erreur d'annulation.");
    }
    setActionLoadingId(null);
  }

  async function handlePromoteWaitlist() {
    if (!event) return;
    const res = await promoteNextInWaitlist(event.id);
    if (res.promoted) {
      alert(`Une place a été proposée à ${res.runner?.prenom} ${res.runner?.nom} par email.`);
      await loadEvent();
    } else {
      alert("Aucun coureur en attente.");
    }
  }

  function getWhatsAppRelanceUrl(ins: Inscription) {
    if (!event) return "#";
    const text = `Salut ${ins.prenom} ! Ta place pour ${event.title} est réservée. Pense à régler ici : ${event.lien_paiement || getAppUrl() + '/event/' + event.id} 🖤`;
    const cleanPhone = (ins.telephone || "").replace(/\s+/g, "").replace(/^0/, "+33");
    if (cleanPhone) {
      return `https://wa.me/${cleanPhone.replace("+", "")}?text=${encodeURIComponent(text)}`;
    }
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="animate-spin text-[#FF5500]" size={32} />
      </div>
    );
  }

  if (!event) return null;

  const s = STATUS_LABELS[event.status] || STATUS_LABELS.draft;
  const isPro = hasProAccess(club);
  const isEvenement = !!event.is_evenement;
  const jaugeMax = event.jauge_max || event.max_participants || 0;

  // Calculs statistiques
  const paidCount = inscriptions.filter((i) => i.statut_paiement === "paye" || i.confirme_par_fondateur).length;
  const waitingPaymentCount = inscriptions.filter((i) => i.statut_paiement !== "paye" && !i.confirme_par_fondateur).length;

  const TABS: { key: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: "details", label: "Détails", icon: <FileText size={13} /> },
    {
      key: "inscriptions",
      label: isEvenement ? "Inscriptions & Paiements" : "Inscriptions",
      icon: <Users size={13} />,
      count: inscriptions.length,
    },
    { key: "checkins", label: "Check-ins", icon: <CheckSquare size={13} />, count: liveCount },
    { key: "qr", label: "QR Code", icon: <QrCode size={13} /> },
  ];

  return (
    <div className="pb-20 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-start gap-4">
          <Link
            href="/dashboard/events"
            className="flex items-center gap-1.5 text-[color:var(--app-text-muted)] hover:text-[color:var(--app-text)] transition-colors text-sm font-medium mt-1"
          >
            <ArrowLeft size={15} />
            Retour
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                style={{ color: s.color, backgroundColor: s.bg }}
              >
                {s.label}
              </span>
              {isEvenement && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FF5500] text-white">
                  <Sparkles size={9} /> Événement
                </span>
              )}
              {event.status === "published" && (
                <span className="flex items-center gap-1 text-[10px] text-[#22C55E] font-bold uppercase tracking-wider">
                  <Wifi size={9} className="animate-pulse" />
                  Live
                </span>
              )}
            </div>
            <h1 className="text-[24px] sm:text-[32px] font-display italic font-black uppercase text-[color:var(--app-text)] leading-none tracking-tighter">
              {event.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {event.status === "published" && (
            <button
              onClick={handleOpenStaffModal}
              disabled={staffLoading}
              title="Générer un lien pour tes co-capitaines et pacers"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest bg-[var(--app-surface-2)] text-[color:var(--app-text)] hover:border-[#FF5500] border border-[color:var(--app-border)] transition-all shadow-sm"
            >
              {staffLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} className="text-[#FF5500]" />}
              Lien Staff / Pacer
            </button>
          )}
          {event.status === "published" && (
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `${event.title} 🏃\n📅 ${formatDateShort(event.event_date)}\n📍 ${event.meeting_point_address || "Point de RDV"}\n\nInscriptions : ${getAppUrl()}/event/${event.id} 🖤`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest bg-[#25D366] text-white hover:bg-[#1EBE5D] transition-all shadow-sm"
            >
              <MessageCircle size={13} /> Annoncer
            </a>
          )}
          {event.status === "published" && (
            <button
              onClick={handleSendPush}
              disabled={notifying}
              title="Envoyer une notification push aux membres"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest bg-[var(--app-surface-2)] text-[color:var(--app-text)] hover:border-[#FF5500] border border-[color:var(--app-border)] transition-all shadow-sm"
            >
              {notifying ? <Loader2 size={13} className="animate-spin" /> : <Bell size={13} className="text-[#FF5500]" />}
              {notifiedMsg || "Notifier (Push)"}
            </button>
          )}
          <button
            onClick={togglePublish}
            disabled={isPublishing}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${
              event.status === "published"
                ? "border border-[color:var(--app-border)] text-[color:var(--app-text-muted)] hover:border-black hover:text-[color:var(--app-text)]"
                : "bg-[#FF5500] text-white hover:bg-black"
            }`}
          >
            {isPublishing ? <Loader2 size={12} className="animate-spin" /> : event.status === "published" ? <Lock size={12} /> : <Globe size={12} />}
            {event.status === "published" ? "Dépublier" : "Publier"}
          </button>
          <button
            onClick={deleteEvent}
            className="p-2 rounded-full text-[#EF4444] hover:bg-red-50 transition-all"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-[var(--app-surface)] border border-[color:var(--app-border)] rounded-full p-1 w-fit shadow-sm overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? "bg-[#FF5500] text-white shadow-sm"
                : "text-[color:var(--app-text-muted)] hover:text-[color:var(--app-text)]"
            }`}
          >
            {tab.icon}
            {tab.label}
            {typeof tab.count === "number" && (
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ${
                activeTab === tab.key ? "bg-white/20 text-white" : "bg-[var(--app-surface-2)] text-[color:var(--app-text-muted)]"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* DETAILS TAB */}
        {activeTab === "details" && (
          <motion.div key="details" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Infos générales */}
              <div className="bg-[var(--app-surface)] rounded-[24px] border border-[color:var(--app-border)] p-6 space-y-4">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)]">Informations</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-[#FF5500] shrink-0" />
                    <div>
                      <p className="text-[11px] text-[color:var(--app-text-muted)] uppercase tracking-wider">Date</p>
                      <p className="text-sm font-semibold text-[color:var(--app-text)]">
                        {formatDateShort(event.event_date)} à {new Date(event.event_date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                  {event.meeting_point_address && (
                    <div className="flex items-center gap-3">
                      <MapPin size={16} className="text-[#FF5500] shrink-0" />
                      <div>
                        <p className="text-[11px] text-[color:var(--app-text-muted)] uppercase tracking-wider">Point RDV</p>
                        <p className="text-sm font-semibold text-[color:var(--app-text)]">{event.meeting_point_address}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Users size={16} className="text-[#FF5500] shrink-0" />
                    <div>
                      <p className="text-[11px] text-[color:var(--app-text-muted)] uppercase tracking-wider">Jauge</p>
                      <p className="text-sm font-semibold text-[color:var(--app-text)]">
                        {inscriptions.length}{jaugeMax ? ` / ${jaugeMax}` : ""} inscrits
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Spécificités Événement */}
              {isEvenement && (
                <div className="bg-[var(--app-surface)] rounded-[24px] border border-[#FF5500]/30 p-6 space-y-4 shadow-sm">
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-[#FF5500] flex items-center gap-1.5">
                    <Sparkles size={14} /> Configuration Événement
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between pb-2 border-b border-[color:var(--app-border)]">
                      <span className="text-[color:var(--app-text-muted)]">Prix unitaire</span>
                      <span className="font-black text-[#FF5500] text-base">{event.prix ? `${event.prix} ${event.devise || "EUR"}` : "Gratuit"}</span>
                    </div>
                    {event.description_evenement && (
                      <div>
                        <span className="text-[11px] font-bold text-[color:var(--app-text-muted)] uppercase tracking-wider block mb-1">Inclus :</span>
                        <p className="text-[color:var(--app-text)] font-medium bg-[var(--app-surface-2)] p-3 rounded-xl">{event.description_evenement}</p>
                      </div>
                    )}
                    {event.lien_paiement && (
                      <div>
                        <span className="text-[11px] font-bold text-[color:var(--app-text-muted)] uppercase tracking-wider block mb-1">Lien de paiement externe :</span>
                        <a
                          href={event.lien_paiement}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#FF5500] hover:underline flex items-center gap-1 text-xs font-mono break-all"
                        >
                          {event.lien_paiement} <ExternalLink size={12} />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Check-in direct */}
              <div className="bg-[var(--app-surface)] rounded-[24px] border border-[color:var(--app-border)] p-6">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)] mb-4">Check-in en direct</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[40px] font-display font-black italic text-[color:var(--app-text)] leading-none">{liveCount}</p>
                    <p className="text-[11px] text-[color:var(--app-text-muted)] mt-1">check-ins validés</p>
                  </div>
                  <div className="w-16 h-16 rounded-full border-4 border-[#FF5500]/20 flex items-center justify-center">
                    <Wifi size={24} className="text-[#FF5500]" />
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* INSCRIPTIONS & PAIEMENTS TAB */}
        {activeTab === "inscriptions" && (
          <motion.div key="inscriptions" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-6">
            
            {/* Compteurs Synthétiques */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-[var(--app-surface)] border border-[color:var(--app-border)]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--app-text-muted)]">Inscrits</p>
                <p className="text-2xl font-black text-[color:var(--app-text)] mt-1">
                  {inscriptions.length} {jaugeMax ? `<span className="text-sm font-normal text-[color:var(--app-text-muted)]">/ ${jaugeMax}</span>` : ""}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--app-surface)] border border-[#22C55E]/20">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#166534]">Payés / Validés</p>
                <p className="text-2xl font-black text-[#22C55E] mt-1">{paidCount}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--app-surface)] border border-[#F59E0B]/20">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#B45309]">En attente</p>
                <p className="text-2xl font-black text-[#F59E0B] mt-1">{waitingPaymentCount}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--app-surface)] border border-[color:var(--app-border)]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--app-text-muted)]">Liste d&apos;attente</p>
                <p className="text-2xl font-black text-[color:var(--app-text)] mt-1">{waitlist.length}</p>
              </div>
            </div>

            {/* Tableau des Inscrits dans la Jauge */}
            <div className="bg-[var(--app-surface)] rounded-[24px] border border-[color:var(--app-border)] overflow-hidden shadow-sm">
              <div className="p-4 sm:p-5 border-b border-[color:var(--app-border)] flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-[13px] font-black uppercase tracking-tight text-[color:var(--app-text)]">
                    Inscrits confirmés ({inscriptions.length})
                  </h3>
                  <p className="text-[11px] text-[color:var(--app-text-muted)]">
                    Gestion logistique et validation déclarative des règlements.
                  </p>
                </div>
              </div>

              {inscriptions.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-3xl mb-2">🏃</p>
                  <p className="text-sm font-medium text-[color:var(--app-text-muted)]">Aucun inscrit pour le moment.</p>
                </div>
              ) : (
                <div className="divide-y divide-[color:var(--app-border)]">
                  {inscriptions.map((ins) => {
                    const isPaid = ins.statut_paiement === "paye" || ins.confirme_par_fondateur;
                    const declaredPaid = ins.confirme_par_coureur && !isPaid;

                    return (
                      <div key={ins.id} className="p-4 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
                        <div className="flex items-center gap-3 min-w-[200px]">
                          <div className="w-10 h-10 rounded-full bg-[#FF5500]/10 flex items-center justify-center shrink-0">
                            <span className="text-[12px] font-black text-[#FF5500]">
                              {ins.prenom[0]}{ins.nom[0]}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[color:var(--app-text)] leading-tight">
                              {ins.prenom} {ins.nom}
                            </p>
                            <p className="text-[11px] text-[color:var(--app-text-muted)] flex items-center gap-2 mt-0.5">
                              {ins.telephone && <span className="flex items-center gap-1"><Phone size={10} /> {ins.telephone}</span>}
                              {ins.email && <span className="flex items-center gap-1 truncate max-w-[160px]"><Mail size={10} /> {ins.email}</span>}
                            </p>
                          </div>
                        </div>

                        {/* Statut paiement */}
                        <div className="flex items-center gap-2">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#DCFCE7] text-[#166534] border border-[#22C55E]/30">
                              🟢 Payé (validé)
                            </span>
                          ) : declaredPaid ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                              🟡 Dit avoir payé
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                              🔴 En attente
                            </span>
                          )}
                        </div>

                        {/* Actions du Fondateur */}
                        <div className="flex items-center gap-2 shrink-0">
                          {!isPaid && (
                            <button
                              onClick={() => handleValidatePayment(ins.id)}
                              disabled={actionLoadingId === ins.id}
                              className="px-3 py-1.5 rounded-full bg-[#22C55E] text-white text-[11px] font-bold uppercase tracking-wider hover:bg-[#16A34A] transition-all flex items-center gap-1 shadow-sm"
                            >
                              {actionLoadingId === ins.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                              Valider
                            </button>
                          )}

                          {!isPaid && (
                            <a
                              href={getWhatsAppRelanceUrl(ins)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-full border border-[color:var(--app-border)] text-[11px] font-bold text-[color:var(--app-text)] hover:border-[#25D366] hover:text-[#25D366] transition-all flex items-center gap-1"
                            >
                              <MessageCircle size={12} className="text-[#25D366]" /> Relancer
                            </a>
                          )}

                          <button
                            onClick={() => handleCancelInscription(ins.id, `${ins.prenom} ${ins.nom}`)}
                            disabled={actionLoadingId === ins.id}
                            title="Annuler l'inscription et promouvoir le suivant"
                            className="p-2 rounded-full text-[color:var(--app-text-muted)] hover:text-[#EF4444] hover:bg-red-50 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Vue Liste d'Attente */}
            {waitlist.length > 0 && (
              <div className="bg-[var(--app-surface)] rounded-[24px] border border-[color:var(--app-border)] overflow-hidden shadow-sm">
                <div className="p-4 sm:p-5 border-b border-[color:var(--app-border)] flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-[13px] font-black uppercase tracking-tight text-[color:var(--app-text)] flex items-center gap-2">
                      <span>Liste d&apos;attente ({waitlist.length})</span>
                    </h3>
                    <p className="text-[11px] text-[color:var(--app-text-muted)]">
                      Coureurs promus automatiquement dès qu&apos;une place se libère.
                    </p>
                  </div>
                  <button
                    onClick={handlePromoteWaitlist}
                    className="px-3.5 py-1.5 rounded-full bg-[#FF5500] text-white text-[11px] font-black uppercase tracking-wider hover:bg-[#E04B00] transition-all flex items-center gap-1.5"
                  >
                    <ArrowUpRight size={13} /> Proposer une place (#1)
                  </button>
                </div>

                <div className="divide-y divide-[color:var(--app-border)]">
                  {waitlist.map((w, idx) => (
                    <div key={w.id} className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--app-surface-2)] flex items-center justify-center font-black text-xs text-[color:var(--app-text)]">
                          #{w.position_liste_attente || idx + 1}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[color:var(--app-text)]">
                            {w.prenom} {w.nom}
                          </p>
                          <p className="text-[11px] text-[color:var(--app-text-muted)]">
                            {w.telephone || w.email || "Contact non renseigné"}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCancelInscription(w.id, `${w.prenom} ${w.nom}`)}
                        className="p-1.5 text-[color:var(--app-text-muted)] hover:text-[#EF4444] transition-colors"
                        title="Retirer de la liste d'attente"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </motion.div>
        )}

        {/* CHECKINS TAB */}
        {activeTab === "checkins" && (
          <motion.div key="checkins" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div className="bg-[var(--app-surface)] rounded-[24px] border border-[color:var(--app-border)] overflow-hidden">
              {checkins.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center">
                  <div className="text-4xl mb-3">📍</div>
                  <p className="text-[13px] text-[color:var(--app-text-muted)]">Aucun check-in encore.</p>
                </div>
              ) : (
                <div className="divide-y divide-[color:var(--app-border)]">
                  {checkins.map((chk, i) => (
                    <motion.div
                      key={chk.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-4 p-4"
                    >
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${chk.is_valid ? "bg-[#22C55E]" : "bg-[#F59E0B]"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[color:var(--app-text)]">{membreName(chk.membre_profiles) || "Membre"}</p>
                        <p className="text-[11px] text-[color:var(--app-text-muted)]">
                          {chk.checked_in_at ? new Date(chk.checked_in_at).toLocaleTimeString("fr-FR") : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          chk.method === "qr_code" ? "bg-[#EDE9FE] text-[#7C3AED]" : "bg-[#DBEAFE] text-[#3B82F6]"
                        }`}>
                          {chk.method === "qr_code" ? "QR" : chk.method === "manual" ? "Manuel" : "GPS"}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          chk.is_valid ? "bg-[#3DD68C]/15 text-[#3DD68C]" : "bg-[#F59E0B]/15 text-[#F59E0B]"
                        }`}>
                          {chk.is_valid ? "✓" : "Attente"}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* QR CODE TAB */}
        {activeTab === "qr" && (
          <motion.div key="qr" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div className="max-w-sm mx-auto">
              <div className="bg-[var(--app-surface)] rounded-[24px] border border-[color:var(--app-border)] p-8 flex flex-col items-center gap-6">
                <p className="text-[11px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)]">QR Code Check-in</p>
                <div className="p-4 bg-[var(--app-surface)] rounded-[16px] border-2 border-[color:var(--app-border)]">
                  <QRCodeSVG
                    value={checkinUrl}
                    size={200}
                    fgColor="#1A1918"
                    bgColor="#FFFFFF"
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <div className="w-full text-center">
                  <p className="text-[11px] text-[color:var(--app-text-muted)] break-all font-mono">{checkinUrl}</p>
                </div>
                <button
                  onClick={() => {
                    const svg = document.querySelector("svg");
                    if (!svg) return;
                    const blob = new Blob([svg.outerHTML], { type: "image/svg+xml" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `checkin-${event.title.replace(/\s+/g, "-").toLowerCase()}.svg`;
                    a.click();
                  }}
                  className="flex items-center gap-2 w-full justify-center px-6 py-3 rounded-full bg-black text-white text-[11px] font-black uppercase tracking-widest hover:bg-[#FF5500] transition-all"
                >
                  <Download size={13} />
                  Télécharger le QR Code
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Partage Lien Staff / Pacer */}
      <AnimatePresence>
        {staffModalOpen && staffData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setStaffModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-[var(--app-surface)] border border-[color:var(--app-border)] rounded-[28px] p-6 sm:p-7 space-y-5 shadow-2xl z-10"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#FF5500]/10 flex items-center justify-center text-[#FF5500]">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase tracking-tight text-[color:var(--app-text)]">
                      Lien Staff / Co-Capitaine
                    </h3>
                    <p className="text-xs text-[color:var(--app-text-muted)] font-medium">
                      Pour tes pacers et organisateurs terrain
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setStaffModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-[var(--app-surface-2)] flex items-center justify-center text-[color:var(--app-text-muted)] hover:text-[color:var(--app-text)]"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--app-surface-2)] border border-[color:var(--app-border)] space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[color:var(--app-text-muted)]">
                  Lien direct terrain
                </p>
                <div className="flex items-center gap-2 bg-[var(--app-surface)] p-2.5 rounded-xl border border-[color:var(--app-border)]">
                  <input
                    type="text"
                    readOnly
                    value={staffData.staffUrl}
                    className="w-full text-xs font-mono bg-transparent outline-none text-[color:var(--app-text)] truncate"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(staffData.staffUrl);
                      setStaffCopied(true);
                      setTimeout(() => setStaffCopied(false), 2500);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#FF5500] text-white text-[11px] font-black uppercase tracking-wider hover:bg-[#E04B00] transition-colors shrink-0"
                  >
                    {staffCopied ? "Copié !" : "Copier"}
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs leading-relaxed space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Shield size={14} className="text-[#22C55E]" /> Accès Terrain Sécurisé
                </p>
                <p className="text-[11px] opacity-90">
                  Ce lien permet à tes co-capitaines de pointer les coureurs au départ et d&apos;accéder aux fiches d&apos;urgence (ICE). Il ne donne <strong>aucun accès à tes réglages sensibles ni à Stripe</strong>.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Salut l'équipe ! Voici le lien Staff pour pointer les coureurs et voir les fiches ICE ce soir pour « ${event.title} » : ${staffData.staffUrl} 🖤`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-11 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <MessageCircle size={15} /> Partager sur WhatsApp
                </a>

                <button
                  onClick={handleRevokeStaff}
                  className="w-full h-10 rounded-full border border-red-500/20 text-red-500 text-xs font-bold hover:bg-red-500/10 transition-colors"
                >
                  Révoquer ce lien staff
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
