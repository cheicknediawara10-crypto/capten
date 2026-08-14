"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Calendar, MapPin, Users, QrCode, CheckSquare, FileText, List,
  Download, Globe, Lock, Trash2, Loader2, Wifi
} from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { formatDateShort } from "@/lib/utils/format";
import dynamic from "next/dynamic";

const QRCodeSVG = dynamic(() => import("qrcode.react").then((m) => ({ default: m.QRCodeSVG })), { ssr: false });

type Tab = "details" | "registrations" | "checkins" | "qr";

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
}

interface MembreLite { first_name: string | null; last_name: string | null; phone: string | null }
const membreName = (m: MembreLite | null) =>
  [m?.first_name, m?.last_name].filter(Boolean).join(" ").trim();
const membreInitials = (m: MembreLite | null) =>
  membreName(m).split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

interface Registration {
  id: string;
  membre_profiles: MembreLite | null;
}

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
  const { club } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("details");
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveCount, setLiveCount] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);

  const checkinUrl = typeof window !== "undefined"
    ? `${window.location.origin}/checkin/${id}`
    : `https://capten.run/checkin/${id}`;

  const loadEvent = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;

    const { data: ev } = await supabase.from("events").select("*").eq("id", id).single();
    if (!ev) { setLoading(false); return; }

    const [{ data: regs }, { data: chks }] = await Promise.all([
      supabase.from("membre_club")
        .select("id, membre_profiles(first_name, last_name, phone)")
        .eq("club_id", ev.club_id).eq("is_active", true),
      supabase.from("membre_checkins")
        .select("id, checked_in_at, is_valid, method, membre_profiles(first_name, last_name, phone)")
        .eq("event_id", id).order("checked_in_at", { ascending: false }),
    ]);

    setEvent(ev);
    setRegistrations((regs as unknown as Registration[]) || []);
    setCheckins((chks as unknown as Checkin[]) || []);
    setLiveCount(((chks as unknown as Checkin[]) || []).filter((c) => c.is_valid).length);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadEvent();

    // Supabase Realtime subscription for live check-ins
    const supabase = getSupabase();
    if (!supabase) return;

    const channel = supabase
      .channel(`membre-checkins-${id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "membre_checkins", filter: `event_id=eq.${id}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setCheckins((prev) => [payload.new as Checkin, ...prev]);
            if ((payload.new as Checkin).is_valid) {
              setLiveCount((c) => c + 1);
            }
          } else if (payload.eventType === "UPDATE") {
            setCheckins((prev) =>
              prev.map((c) => c.id === (payload.new as Checkin).id ? { ...c, ...(payload.new as Checkin) } : c)
            );
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id, loadEvent]);

  async function togglePublish() {
    if (!event) return;
    setIsPublishing(true);
    const supabase = getSupabase();
    if (!supabase) { setIsPublishing(false); return; }

    const newStatus = event.status === "published" ? "draft" : "published";
    const { data } = await supabase.from("events").update({ status: newStatus }).eq("id", event.id).select().single();
    if (data) setEvent(data);
    setIsPublishing(false);
  }

  async function deleteEvent() {
    if (!confirm("Supprimer cette sortie ? Cette action est irréversible.")) return;
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.from("events").delete().eq("id", id);
    router.push("/dashboard/events");
  }

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "details", label: "Détails", icon: <FileText size={13} /> },
    { key: "registrations", label: `Inscrits (${registrations.length})`, icon: <Users size={13} /> },
    { key: "checkins", label: `Check-ins (${liveCount})`, icon: <CheckSquare size={13} /> },
    { key: "qr", label: "QR Code", icon: <QrCode size={13} /> },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[#FF5C00]" size={32} />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-24">
        <p className="text-[color:var(--app-text-muted)]">Sortie introuvable.</p>
        <Link href="/dashboard/events" className="text-[#FF5C00] mt-4 inline-block text-sm">← Retour</Link>
      </div>
    );
  }

  const s = STATUS_LABELS[event.status] || STATUS_LABELS.draft;

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

        <div className="flex items-center gap-2">
          <button
            onClick={togglePublish}
            disabled={isPublishing}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${
              event.status === "published"
                ? "border border-[color:var(--app-border)] text-[color:var(--app-text-muted)] hover:border-black hover:text-[color:var(--app-text)]"
                : "bg-[#FF5C00] text-white hover:bg-black"
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
                ? "bg-[#FF5C00] text-white shadow-sm"
                : "text-[color:var(--app-text-muted)] hover:text-[color:var(--app-text)]"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* DETAILS TAB */}
        {activeTab === "details" && (
          <motion.div key="details" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[var(--app-surface)] rounded-[24px] border border-[color:var(--app-border)] p-6 space-y-4">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)]">Informations</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-[#FF5C00] shrink-0" />
                    <div>
                      <p className="text-[11px] text-[color:var(--app-text-muted)] uppercase tracking-wider">Date</p>
                      <p className="text-sm font-semibold text-[color:var(--app-text)]">
                        {formatDateShort(event.event_date)} à {new Date(event.event_date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                  {event.meeting_point_address && (
                    <div className="flex items-center gap-3">
                      <MapPin size={16} className="text-[#FF5C00] shrink-0" />
                      <div>
                        <p className="text-[11px] text-[color:var(--app-text-muted)] uppercase tracking-wider">Point RDV</p>
                        <p className="text-sm font-semibold text-[color:var(--app-text)]">{event.meeting_point_address}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Users size={16} className="text-[#FF5C00] shrink-0" />
                    <div>
                      <p className="text-[11px] text-[color:var(--app-text-muted)] uppercase tracking-wider">Capacité</p>
                      <p className="text-sm font-semibold text-[color:var(--app-text)]">
                        {registrations.length}{event.max_participants ? ` / ${event.max_participants}` : ""} inscrits
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {event.description && (
                <div className="bg-[var(--app-surface)] rounded-[24px] border border-[color:var(--app-border)] p-6">
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)] mb-3">Description</h3>
                  <p className="text-sm text-[color:var(--app-text)] leading-relaxed">{event.description}</p>
                </div>
              )}

              <div className="bg-[var(--app-surface)] rounded-[24px] border border-[color:var(--app-border)] p-6">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)] mb-4">Check-in en direct</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[40px] font-display font-black italic text-[color:var(--app-text)] leading-none">{liveCount}</p>
                    <p className="text-[11px] text-[color:var(--app-text-muted)] mt-1">check-ins validés</p>
                  </div>
                  <div className="w-16 h-16 rounded-full border-4 border-[#FF5C00]/20 flex items-center justify-center">
                    <Wifi size={24} className="text-[#FF5C00]" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* REGISTRATIONS TAB */}
        {activeTab === "registrations" && (
          <motion.div key="registrations" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div className="bg-[var(--app-surface)] rounded-[24px] border border-[color:var(--app-border)] overflow-hidden">
              {registrations.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center">
                  <div className="text-4xl mb-3">🙋</div>
                  <p className="text-[13px] text-[color:var(--app-text-muted)]">Aucun inscrit pour l'instant.</p>
                </div>
              ) : (
                <div className="divide-y divide-[color:var(--app-border)]">
                  {registrations.map((reg) => (
                    <div key={reg.id} className="flex items-center gap-4 p-4">
                      <div className="w-9 h-9 rounded-full bg-[#FF5C00]/10 flex items-center justify-center shrink-0">
                        <span className="text-[11px] font-black text-[#FF5C00]">
                          {membreInitials(reg.membre_profiles)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[color:var(--app-text)] truncate">{membreName(reg.membre_profiles) || "Membre"}</p>
                        <p className="text-[11px] text-[color:var(--app-text-muted)]">{reg.membre_profiles?.phone || "—"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
                  className="flex items-center gap-2 w-full justify-center px-6 py-3 rounded-full bg-black text-white text-[11px] font-black uppercase tracking-widest hover:bg-[#FF5C00] transition-all"
                >
                  <Download size={13} />
                  Télécharger le QR Code
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
