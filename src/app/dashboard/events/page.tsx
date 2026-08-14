"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Calendar, MapPin, Users, ChevronRight, Clock, Filter } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { formatDate, formatDateShort } from "@/lib/utils/format";

type EventStatus = "all" | "published" | "draft" | "completed" | "cancelled";

interface Event {
  id: string;
  title: string;
  event_date: string;
  meeting_point_address: string | null;
  max_participants: number | null;
  status: string;
  club_id: string;
  _registrations?: number;
  _checkins?: number;
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  draft:     { label: "Brouillon",  color: "#F59E0B", bg: "#FEF3C7" },
  published: { label: "Publié",     color: "#22C55E", bg: "#DCFCE7" },
  completed: { label: "Terminé",    color: "#6B7280", bg: "#F3F4F6" },
  cancelled: { label: "Annulé",     color: "#EF4444", bg: "#FEE2E2" },
};

export default function EventsPage() {
  const { club } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<EventStatus>("all");

  useEffect(() => {
    async function loadEvents() {
      const supabase = getSupabase();
      if (!supabase || !club) { setLoading(false); return; }

      const query = supabase
        .from("events")
        .select("*")
        .eq("club_id", club.id)
        .order("event_date", { ascending: false });

      const { data } = await query;
      setEvents(data || []);
      setLoading(false);
    }
    loadEvents();
  }, [club]);

  const filtered = events.filter((e) => {
    if (activeTab === "all") return true;
    if (activeTab === "published") return e.status === "published";
    if (activeTab === "draft") return e.status === "draft";
    if (activeTab === "completed") return e.status === "completed";
    if (activeTab === "cancelled") return e.status === "cancelled";
    return true;
  });

  const upcoming = events.filter((e) => e.status === "published" && new Date(e.event_date) > new Date()).length;

  const TABS: { key: EventStatus; label: string }[] = [
    { key: "all", label: "Toutes" },
    { key: "published", label: "À venir" },
    { key: "completed", label: "Passées" },
    { key: "draft", label: "Brouillons" },
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[30px] sm:text-[40px] font-display italic font-black uppercase text-[color:var(--app-text)] leading-none tracking-tighter">
            Les Runs
          </h1>
          <p className="text-[13px] text-[color:var(--app-text-muted)] font-sans mt-1">
            {upcoming > 0 ? `${upcoming} run${upcoming > 1 ? "s" : ""} à venir` : "Planifie ton prochain run"}
          </p>
        </div>
        <Link
          href="/dashboard/events/new"
          className="flex items-center gap-2 bg-[#FF5C00] text-white px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-[#E04B00] transition-all active:scale-95"
        >
          <Plus size={14} />
          Nouveau Run
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-[var(--app-surface)] border border-[color:var(--app-border)] rounded-full p-1 w-fit shadow-sm">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${
              activeTab === tab.key
                ? "bg-[#FF5C00] text-white shadow-sm"
                : "text-[color:var(--app-text-muted)] hover:text-[color:var(--app-text)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-[var(--app-surface)] rounded-[24px] p-6 animate-pulse h-48 border border-[color:var(--app-border)]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 space-y-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#FF5C00]/[0.08] flex items-center justify-center">
            <MapPin size={26} className="text-[#FF5C00]" />
          </div>
          <h3 className="text-[20px] font-display italic font-black uppercase text-[color:var(--app-text)]">
            Aucun run prévu
          </h3>
          <p className="text-[13px] text-[color:var(--app-text-muted)] font-sans text-center max-w-xs">
            Lance ton premier run et partage le lien avec ton crew.
          </p>
          <Link
            href="/dashboard/events/new"
            className="flex items-center gap-2 bg-[#FF5C00] text-white px-6 py-3 rounded-full text-[12px] font-black uppercase tracking-widest hover:bg-[#E04B00] transition-all"
          >
            <Plus size={14} />
            Créer un run
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((event, i) => {
            const s = STATUS_LABELS[event.status] || STATUS_LABELS.draft;
            const isPast = new Date(event.event_date) < new Date();
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/dashboard/events/${event.id}`}
                  className="block bg-[var(--app-surface)] rounded-[24px] border border-[color:var(--app-border)] p-6 hover:shadow-[0_12px_40px_rgba(0,0,0,0.10)] hover:-translate-y-0.5 transition-all group"
                >
                  {/* Date bar */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2 text-[11px] text-[color:var(--app-text-muted)] font-medium">
                      <Calendar size={13} className="text-[#FF5C00]" />
                      {formatDateShort(event.event_date)}
                    </div>
                    <span
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: s.color, backgroundColor: s.bg }}
                    >
                      {s.label}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-[16px] font-black uppercase text-[color:var(--app-text)] mb-3 leading-tight tracking-tight group-hover:text-[#FF5C00] transition-colors">
                    {event.title}
                  </h3>

                  {/* Meta */}
                  <div className="space-y-1.5">
                    {event.meeting_point_address && (
                      <div className="flex items-center gap-2 text-[12px] text-[color:var(--app-text-muted)]">
                        <MapPin size={12} />
                        <span className="truncate">{event.meeting_point_address}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-[12px] text-[color:var(--app-text-muted)]">
                      <Clock size={12} />
                      {new Date(event.event_date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    {event.max_participants && (
                      <div className="flex items-center gap-2 text-[12px] text-[color:var(--app-text-muted)]">
                        <Users size={12} />
                        <span>Max {event.max_participants} participants</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-[color:var(--app-border)] flex justify-between items-center">
                    <span className="text-[10px] text-[color:var(--app-text-muted)] font-mono uppercase tracking-wider">
                      Voir les détails
                    </span>
                    <ChevronRight size={14} className="text-[color:var(--app-text-muted)] group-hover:text-[#FF5C00] transition-colors" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
