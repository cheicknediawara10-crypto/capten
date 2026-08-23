"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar, MapPin, Users, CheckCircle2, Loader2, ArrowRight, Phone, Shield,
  Luggage, Gauge, Coffee
} from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { formatDateShort } from "@/lib/utils/format";
import { parsePracticalInfo } from "@/lib/utils/practical-info";
import Link from "next/link";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  meeting_point_address: string | null;
  max_participants: number | null;
  status: string;
  checkin_radius_meters: number;
  club_id: string;
  clubs: { name: string; logo_url: string | null; city: string | null } | null;
}

export default function PublicEventPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [regCount, setRegCount] = useState(0);
  const [registered, setRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = getSupabase();
      if (!supabase) { setLoading(false); return; }

      const [{ data: ev }, { count }, { data: { user } }] = await Promise.all([
        supabase.from("events").select("*, clubs(name, logo_url, city)").eq("id", id).single(),
        supabase.from("event_registrations").select("*", { count: "exact", head: true }).eq("event_id", id).eq("status", "confirmed"),
        supabase.auth.getUser(),
      ]);

      setEvent(ev);
      setRegCount(count || 0);
      setUserId(user?.id || null);

      if (user) {
        const { data: reg } = await supabase
          .from("event_registrations")
          .select("id")
          .eq("event_id", id)
          .eq("profile_id", user.id)
          .single();
        setRegistered(!!reg);
      }

      setLoading(false);
    }
    load();
  }, [id]);

  async function register() {
    if (!userId || !event) {
      // Redirect to join page
      const supabase = getSupabase();
      if (supabase) {
        const { data } = await supabase
          .from("clubs")
          .select("slug")
          .eq("id", event!.club_id)
          .single();
        if (data) {
          window.location.href = `/join/${data.slug}`;
        }
      }
      return;
    }

    setRegistering(true);
    const supabase = getSupabase();
    if (!supabase) { setRegistering(false); return; }

    await supabase.from("event_registrations").insert({
      event_id: event.id,
      profile_id: userId,
      status: "confirmed",
    });

    setRegistered(true);
    setRegCount((c) => c + 1);
    setRegistering(false);
  }

  const isFull = event?.max_participants ? regCount >= event.max_participants : false;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F4EE] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#FF5500]" size={32} />
      </div>
    );
  }

  if (!event || event.status !== "published") {
    return (
      <div className="min-h-screen bg-[#F4F4EE] flex flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-4xl">🙅</p>
        <h1 className="text-[20px] font-display font-black italic uppercase">Sortie indisponible</h1>
        <p className="text-[13px] text-[#666562]">Cette sortie n'est pas accessible pour le moment.</p>
      </div>
    );
  }

  const eventDate = new Date(event.event_date);
  const isPast = eventDate < new Date();
  const practical = parsePracticalInfo(event.description);

  return (
    <div className="min-h-screen bg-[#F4F4EE] pb-32">
      {/* Hero */}
      <div className="bg-black text-white px-6 pt-12 pb-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `repeating-linear-gradient(45deg, #FF5500 0, #FF5500 1px, transparent 0, transparent 50%)`,
          backgroundSize: "20px 20px",
        }} />
        <div className="relative max-w-lg mx-auto">
          {/* Club */}
          {event.clubs && (
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-[8px] bg-[#FF5500]/20 flex items-center justify-center overflow-hidden">
                {event.clubs.logo_url ? (
                  <img src={event.clubs.logo_url} alt="" className="w-full h-full object-cover" />
                ) : "🏃"}
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-white/60">{event.clubs.name}</span>
            </div>
          )}

          <h1 className="text-[32px] font-display font-black italic uppercase text-white leading-tight tracking-tighter">
            {event.title}
          </h1>

          <div className="flex flex-wrap gap-3 mt-4">
            <span className="flex items-center gap-1.5 text-[12px] text-white/70">
              <Calendar size={13} className="text-[#FF5500]" />
              {formatDateShort(event.event_date)} · {eventDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </span>
            {event.meeting_point_address && (
              <span className="flex items-center gap-1.5 text-[12px] text-white/70">
                <MapPin size={13} className="text-[#FF5500]" />
                {event.meeting_point_address}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-[12px] text-white/70">
              <Users size={13} className="text-[#FF5500]" />
              {regCount}{event.max_participants ? ` / ${event.max_participants}` : ""} inscrits
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 mt-6 space-y-4">
        {/* Infos Pratiques Anti-Stress */}
        {(practical.bagDrop || practical.pace || practical.sweeper || practical.afterRun) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[24px] border border-black/5 p-5 space-y-3 shadow-sm"
          >
            <h2 className="text-[11px] font-black uppercase tracking-widest text-[#FF5C00] flex items-center gap-1.5">
              <Luggage size={13} /> Infos Pratiques du Run
            </h2>
            <div className="space-y-2.5 pt-1">
              {practical.bagDrop && (
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#F8F8F6]">
                  <span className="w-7 h-7 rounded-xl bg-black/5 flex items-center justify-center text-[#1A1918] shrink-0 mt-0.5">
                    <Luggage size={14} />
                  </span>
                  <div>
                    <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#666562]">Consigne sacs</p>
                    <p className="text-[13px] font-semibold text-[#1A1918]">{practical.bagDrop}</p>
                  </div>
                </div>
              )}
              {practical.pace && (
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#F8F8F6]">
                  <span className="w-7 h-7 rounded-xl bg-[#FF5C00]/10 text-[#FF5C00] flex items-center justify-center shrink-0 mt-0.5">
                    <Gauge size={14} />
                  </span>
                  <div>
                    <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#666562]">Sas d'Allures & Vibe</p>
                    <p className="text-[13px] font-semibold text-[#1A1918]">{practical.pace}</p>
                  </div>
                </div>
              )}
              {practical.sweeper && (
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#DCFCE7]/60 border border-[#22C55E]/30">
                  <span className="w-7 h-7 rounded-xl bg-[#22C55E]/20 text-[#166534] flex items-center justify-center shrink-0 mt-0.5">
                    <Shield size={14} />
                  </span>
                  <div>
                    <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#166534]">Serre-file & Encadrement</p>
                    <p className="text-[13px] font-bold text-[#166534]">{practical.sweeper}</p>
                    <p className="text-[10.5px] text-[#166534]/80 mt-0.5">Veille à ce que personne ne coure seul ou ne soit lâché.</p>
                  </div>
                </div>
              )}
              {practical.afterRun && (
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#F8F8F6]">
                  <span className="w-7 h-7 rounded-xl bg-[#22C55E]/10 text-[#22C55E] flex items-center justify-center shrink-0 mt-0.5">
                    <Coffee size={14} />
                  </span>
                  <div>
                    <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#666562]">After-run</p>
                    <p className="text-[13px] font-semibold text-[#1A1918]">{practical.afterRun}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Description */}
        {practical.textDescription && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[24px] border border-black/5 p-6"
          >
            <h2 className="text-[11px] font-black uppercase tracking-widest text-[#666562] mb-3">Description</h2>
            <p className="text-[14px] text-[#1A1918] leading-relaxed whitespace-pre-wrap">{practical.textDescription}</p>
          </motion.div>
        )}

        {/* Safety reminder */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-[#DCFCE7] rounded-[20px] p-4 flex items-start gap-3"
        >
          <Shield size={18} className="text-[#22C55E] shrink-0 mt-0.5" />
          <div>
            <p className="text-[12px] font-black uppercase tracking-wider text-[#166534]">Ton ICE est requis</p>
            <p className="text-[11px] text-[#166534]/80 mt-0.5">
              Assure-toi que ton contact d'urgence est renseigné avant de partir.
            </p>
          </div>
        </motion.div>

        {/* Check-in info */}
        {!isPast && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-[20px] border border-black/5 p-4 flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-full bg-[#FF5500]/10 flex items-center justify-center shrink-0">
              <MapPin size={16} className="text-[#FF5500]" />
            </div>
            <div>
              <p className="text-[12px] font-black uppercase tracking-wider text-black">Check-in GPS</p>
              <p className="text-[11px] text-[#666562]">Rayon : {event.checkin_radius_meters}m depuis le point de RDV</p>
            </div>
            <Link
              href={`/checkin/${event.id}`}
              className="ml-auto px-3 py-1.5 rounded-full border border-black/10 text-[10px] font-black uppercase tracking-widest text-[#666562] hover:border-black hover:text-black transition-all shrink-0"
            >
              Check-in
            </Link>
          </motion.div>
        )}
      </div>

      {/* Fixed CTA */}
      {!isPast && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/5 p-5">
          <div className="max-w-lg mx-auto">
            {registered ? (
              <div className="flex items-center justify-center gap-2 h-14 rounded-full bg-[#DCFCE7] text-[#22C55E]">
                <CheckCircle2 size={18} />
                <span className="text-[13px] font-black uppercase tracking-widest">Inscrit !</span>
              </div>
            ) : isFull ? (
              <div className="flex items-center justify-center h-14 rounded-full bg-[#F3F4F6] text-[#9CA3AF]">
                <span className="text-[13px] font-black uppercase tracking-widest">Complet</span>
              </div>
            ) : (
              <button
                onClick={register}
                disabled={registering}
                className="w-full flex items-center justify-center gap-2 h-14 rounded-full bg-[#FF5500] text-white text-[13px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 disabled:opacity-60"
              >
                {registering ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    {userId ? "S'inscrire" : "Rejoindre pour s'inscrire"}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
