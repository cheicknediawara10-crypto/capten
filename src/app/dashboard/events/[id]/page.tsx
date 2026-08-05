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
  draft:     { label: "Brouillon",  color: "#F59E0B", bg: "#FEF3C7" },
  published: { label: "Publié",     color: "#22C55E", bg: "#DCFCE7" },
  completed: { label: "Terminé",    color: "#6B7280", bg: "#F3F4F6" },
  cancelled: { label: "Annulé",     color: "#EF4444", bg: "#FEE2E2" },
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

interface Registration {
  id: string;
  created_at: string;
  status: string;
  profiles: { full_name: string | null; phone: string | null; avatar_url: string | null } | null;
}

interface Checkin {
  id: string;
  created_at: string;
  method: string;
  is_validated: boolean;
  distance_meters: number | null;
  profiles: { full_name: string | null; phone: string | null } | null;
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

    const [{ data: ev }, { data: regs }, { data: chks }] = await Promise.all([
      supabase.from("events").select("*").eq("id", id).single(),
      supabase.from("event_registrations").select("*, profiles(full_name, phone, avatar_url)").eq("event_id", id).order("created_at", { ascending: false }),
      supabase.from("checkins").select("*, profiles(full_name, phone)").eq("event_id", id).order("created_at", { ascending: false }),
    ]);

    setEvent(ev);
    setRegistrations(regs || []);
    setCheckins(chks || []);
    setLiveCount((chks || []).filter((c: Checkin) => c.is_validated).length);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadEvent();

    // Supabase Realtime subscription for live check-ins
    const supabase = getSupabase();
    if (!supabase) return;

    const channel = supabase
      .channel(`checkins-${id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "checkins", filter: `event_id=eq.${id}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setCheckins((prev) => [payload.new as Checkin, ...prev]);
            if ((payload.new as Checkin).is_validated) {
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
        <Loader2 className="animate-spin text-[#FF5500]" size={32} />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-24">
        <p className="text-[#666562]">Sortie introuvable.</p>
        <Link href="/dashboard/events" className="text-[#FF5500] mt-4 inline-block text-sm">← Retour</Link>
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
            className="flex items-center gap-1.5 text-[#666562] hover:text-black transition-colors text-sm font-medium mt-1"
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
            <h1 className="text-[24px] sm:text-[32px] font-display italic font-black uppercase text-black leading-none tracking-tighter">
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
                ? "border border-black/10 text-[#666562] hover:border-black hover:text-black"
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
      <div className="flex items-center gap-1 bg-white border border-black/5 rounded-full p-1 w-fit shadow-sm overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? "bg-[#FF5500] text-white shadow-sm"
                : "text-[#666562] hover:text-black"
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
              <div className="bg-white rounded-[24px] border border-black/5 p-6 space-y-4">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-[#666562]">Informations</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-[#FF5500] shrink-0" />
                    <div>
                      <p className="text-[11px] text-[#A3A3A3] uppercase tracking-wider">Date</p>
                      <p className="text-sm font-semibold text-black">
                        {formatDateShort(event.event_date)} à {new Date(event.event_date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                  {event.meeting_point_address && (
                    <div className="flex items-center gap-3">
                      <MapPin size={16} className="text-[#FF5500] shrink-0" />
                      <div>
                        <p className="text-[11px] text-[#A3A3A3] uppercase tracking-wider">Point RDV</p>
                        <p className="text-sm font-semibold text-black">{event.meeting_point_address}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Users size={16} className="text-[#FF5500] shrink-0" />
                    <div>
                      <p className="text-[11px] text-[#A3A3A3] uppercase tracking-wider">Capacité</p>
                      <p className="text-sm font-semibold text-black">
                        {registrations.length}{event.max_participants ? ` / ${event.max_participants}` : ""} inscrits
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {event.description && (
                <div className="bg-white rounded-[24px] border border-black/5 p-6">
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-[#666562] mb-3">Description</h3>
                  <p className="text-sm text-[#1A1918] leading-relaxed">{event.description}</p>
                </div>
              )}

              <div className="bg-white rounded-[24px] border border-black/5 p-6">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-[#666562] mb-4">Check-in en direct</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[40px] font-display font-black italic text-black leading-none">{liveCount}</p>
                    <p className="text-[11px] text-[#A3A3A3] mt-1">check-ins validés</p>
                  </div>
                  <div className="w-16 h-16 rounded-full border-4 border-[#FF5500]/20 flex items-center justify-center">
                    <Wifi size={24} className="text-[#FF5500]" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* REGISTRATIONS TAB */}
        {activeTab === "registrations" && (
          <motion.div key="registrations" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div className="bg-white rounded-[24px] border border-black/5 overflow-hidden">
              {registrations.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center">
                  <div className="text-4xl mb-3">🙋</div>
                  <p className="text-[13px] text-[#666562]">Aucun inscrit pour l'instant.</p>
                </div>
              ) : (
                <div className="divide-y divide-black/5">
                  {registrations.map((reg) => (
                    <div key={reg.id} className="flex items-center gap-4 p-4">
                      <div className="w-9 h-9 rounded-full bg-[#FF5500]/10 flex items-center justify-center shrink-0">
                        <span className="text-[11px] font-black text-[#FF5500]">
                          {reg.profiles?.full_name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2) || "?"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-black truncate">{reg.profiles?.full_name || "Anonyme"}</p>
                        <p className="text-[11px] text-[#A3A3A3]">{reg.profiles?.phone}</p>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        reg.status === "confirmed" ? "bg-[#DCFCE7] text-[#22C55E]" : "bg-[#FEF3C7] text-[#F59E0B]"
                      }`}>
                        {reg.status}
                      </span>
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
            <div className="bg-white rounded-[24px] border border-black/5 overflow-hidden">
              {checkins.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center">
                  <div className="text-4xl mb-3">📍</div>
                  <p className="text-[13px] text-[#666562]">Aucun check-in encore.</p>
                </div>
              ) : (
                <div className="divide-y divide-black/5">
                  {checkins.map((chk, i) => (
                    <motion.div
                      key={chk.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-4 p-4"
                    >
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${chk.is_validated ? "bg-[#22C55E]" : "bg-[#F59E0B]"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-black">{chk.profiles?.full_name || "Anonyme"}</p>
                        <p className="text-[11px] text-[#A3A3A3]">
                          {new Date(chk.created_at).toLocaleTimeString("fr-FR")}
                          {chk.distance_meters !== null && ` · ${Math.round(chk.distance_meters)}m`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          chk.method === "qr" ? "bg-[#EDE9FE] text-[#7C3AED]" : "bg-[#DBEAFE] text-[#3B82F6]"
                        }`}>
                          {chk.method === "qr" ? "QR" : "GPS"}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          chk.is_validated ? "bg-[#DCFCE7] text-[#22C55E]" : "bg-[#FEF3C7] text-[#F59E0B]"
                        }`}>
                          {chk.is_validated ? "✓" : "Attente"}
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
              <div className="bg-white rounded-[24px] border border-black/5 p-8 flex flex-col items-center gap-6">
                <p className="text-[11px] font-black uppercase tracking-widest text-[#666562]">QR Code Check-in</p>
                <div className="p-4 bg-white rounded-[16px] border-2 border-black/10">
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
                  <p className="text-[11px] text-[#A3A3A3] break-all font-mono">{checkinUrl}</p>
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
    </div>
  );
}
