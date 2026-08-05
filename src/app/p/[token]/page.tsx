"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Phone, MapPin, Shield, Star, Calendar, Loader2, AlertTriangle } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { formatDateShort } from "@/lib/utils/format";

const BADGE_EMOJIS: Record<string, string> = {
  first_run: "🎽",
  regular_runner: "🔥",
  legend: "🏆",
  explorer: "🗺️",
  ambassador: "📣",
  early_member: "⭐",
};

interface MemberData {
  profile: {
    id: string;
    full_name: string | null;
    phone: string | null;
    avatar_url: string | null;
    city: string | null;
    created_at: string;
  };
  ice: {
    contact_name: string;
    contact_phone: string;
    relationship: string | null;
  } | null;
  badges: { slug: string; name: string; awarded_at: string }[];
  clubs: { name: string; logo_url: string | null }[];
  upcomingEvents: { id: string; title: string; event_date: string; meeting_point_address: string | null }[];
  checkinCount: number;
}

export default function MemberMicroPage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"card" | "ice" | "events">("card");

  useEffect(() => {
    async function load() {
      const supabase = getSupabase();
      if (!supabase) { setLoading(false); return; }

      // Resolve token to profile
      const { data: tokenData } = await supabase
        .from("member_tokens")
        .select("profile_id")
        .eq("token", token)
        .single();

      if (!tokenData) { setLoading(false); return; }

      const profileId = tokenData.profile_id;

      const [
        { data: profileRaw },
        { data: ice },
        { data: badgesData },
        { data: memberships },
        { count: checkinCount },
      ] = await Promise.all([
        supabase.from("profiles").select("id, full_name, phone, avatar_url, city, created_at").eq("id", profileId).single(),
        supabase.from("ice_contacts").select("contact_name, contact_phone, relationship").eq("profile_id", profileId).single(),
        supabase.from("member_badges").select("awarded_at, badges(slug, name)").eq("member_id", profileId),
        supabase.from("club_members").select("clubs(name, logo_url)").eq("profile_id", profileId),
        supabase.from("checkins").select("*", { count: "exact", head: true }).eq("member_id", profileId).eq("is_validated", true),
      ]);

      // Fetch upcoming events for this member's clubs
      const clubIds = (memberships || []).map((m: any) => m.clubs?.id).filter(Boolean);
      const { data: upcomingEvents } = clubIds.length > 0
        ? await supabase
            .from("events")
            .select("id, title, event_date, meeting_point_address")
            .in("club_id", clubIds)
            .eq("status", "published")
            .gte("event_date", new Date().toISOString())
            .order("event_date")
            .limit(5)
        : { data: [] };

      if (!profileRaw) { setLoading(false); return; }

      setData({
        profile: profileRaw as MemberData["profile"],
        ice: ice || null,
        badges: (badgesData || []).map((b: any) => ({
          slug: b.badges?.slug || "",
          name: b.badges?.name || "",
          awarded_at: b.awarded_at,
        })),
        clubs: (memberships || []).map((m: any) => ({
          name: m.clubs?.name,
          logo_url: m.clubs?.logo_url,
        })).filter((c: any) => c.name),
        upcomingEvents: upcomingEvents || [],
        checkinCount: checkinCount || 0,
      });
      setLoading(false);
    }
    load();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F4EE] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#FF5500]" size={32} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#F4F4EE] flex flex-col items-center justify-center gap-4 p-8 text-center">
        <AlertTriangle size={48} className="text-[#F59E0B]" />
        <h1 className="text-[20px] font-display font-black italic uppercase">Lien invalide</h1>
        <p className="text-[13px] text-[#666562]">Ce lien membre ne correspond à aucun profil.</p>
      </div>
    );
  }

  const { profile, ice, badges, clubs, upcomingEvents, checkinCount } = data;

  const initials = (profile.full_name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-[#F4F4EE] pb-12">
      {/* Header */}
      <div className="bg-black pt-safe pb-8 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `repeating-linear-gradient(45deg, #FF5500 0, #FF5500 1px, transparent 0, transparent 50%)`,
          backgroundSize: "20px 20px",
        }} />
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-[#FF5500]/20 border-2 border-[#FF5500] flex items-center justify-center mx-auto mb-3 text-[22px] font-black text-[#FF5500] overflow-hidden">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : initials}
          </div>
          <h1 className="text-[24px] font-display font-black italic uppercase text-white leading-tight">
            {profile.full_name || "Membre"}
          </h1>
          {profile.city && (
            <p className="text-[12px] text-white/50 mt-1 flex items-center justify-center gap-1">
              <MapPin size={10} />
              {profile.city}
            </p>
          )}

          {/* Club tags */}
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            {clubs.map((c) => (
              <span key={c.name} className="px-3 py-1 rounded-full bg-white/10 text-white text-[11px] font-medium">
                {c.name}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mt-4">
            <div className="text-center">
              <p className="text-[28px] font-display font-black italic text-[#FF5500] leading-none">{checkinCount}</p>
              <p className="text-[9px] text-white/40 uppercase tracking-wider mt-0.5">Check-ins</p>
            </div>
            <div className="text-center">
              <p className="text-[28px] font-display font-black italic text-[#FF5500] leading-none">{badges.length}</p>
              <p className="text-[9px] text-white/40 uppercase tracking-wider mt-0.5">Badges</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-black/10 bg-white sticky top-0 z-10">
        {[
          { key: "card" as const, label: "Profil", icon: <Star size={13} /> },
          { key: "ice" as const, label: "ICE", icon: <Shield size={13} /> },
          { key: "events" as const, label: "Agenda", icon: <Calendar size={13} /> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[11px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.key
                ? "text-[#FF5500] border-b-2 border-[#FF5500]"
                : "text-[#A3A3A3] hover:text-black"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-5 max-w-sm mx-auto">
        {/* PROFIL / BADGES */}
        {activeTab === "card" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-white rounded-[24px] border border-black/5 p-6">
              <h2 className="text-[11px] font-black uppercase tracking-widest text-[#666562] mb-4">Badges</h2>
              {badges.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-3xl mb-2">🎽</p>
                  <p className="text-[12px] text-[#A3A3A3]">Premier run bientôt !</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {badges.map((b) => (
                    <div key={b.slug} className="flex flex-col items-center gap-1.5 p-3 bg-[#F4F4EE] rounded-[16px]">
                      <span className="text-2xl">{BADGE_EMOJIS[b.slug] || "🏅"}</span>
                      <p className="text-[9px] font-black uppercase tracking-wider text-center text-[#1A1918] leading-tight">{b.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ICE */}
        {activeTab === "ice" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-white rounded-[24px] border border-black/5 p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-10 h-10 rounded-[14px] bg-[#DCFCE7] flex items-center justify-center">
                  <Shield size={18} className="text-[#22C55E]" />
                </div>
                <div>
                  <h2 className="text-[13px] font-black uppercase tracking-widest text-black">Contact d'Urgence</h2>
                  <p className="text-[10px] text-[#A3A3A3]">In Case of Emergency</p>
                </div>
              </div>

              {ice ? (
                <div className="space-y-4">
                  <div className="bg-[#F4F4EE] rounded-[16px] p-4 space-y-2">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-[#A3A3A3]">Nom</p>
                      <p className="text-[15px] font-black text-black">{ice.contact_name}</p>
                    </div>
                    {ice.relationship && (
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-[#A3A3A3]">Relation</p>
                        <p className="text-[13px] font-medium text-[#444]">{ice.relationship}</p>
                      </div>
                    )}
                  </div>
                  <a
                    href={`tel:${ice.contact_phone}`}
                    className="flex items-center justify-center gap-3 w-full h-14 rounded-full bg-[#EF4444] text-white font-black uppercase tracking-widest text-[14px] hover:bg-[#DC2626] transition-all active:scale-95"
                  >
                    <Phone size={18} />
                    {ice.contact_phone}
                  </a>
                  <p className="text-[10px] text-[#A3A3A3] text-center">
                    Appuyez pour appeler en cas d'urgence
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle size={32} className="text-[#F59E0B] mx-auto mb-2" />
                  <p className="text-[13px] font-semibold text-[#444]">ICE non renseigné</p>
                  <p className="text-[11px] text-[#A3A3A3] mt-1">Ce membre n'a pas encore fourni de contact d'urgence.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* UPCOMING EVENTS */}
        {activeTab === "events" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-white rounded-[24px] border border-black/5 overflow-hidden">
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-3xl mb-2">📅</p>
                  <p className="text-[12px] text-[#A3A3A3]">Aucune sortie prévue.</p>
                </div>
              ) : (
                <div className="divide-y divide-black/5">
                  {upcomingEvents.map((ev) => (
                    <div key={ev.id} className="p-4">
                      <p className="text-[11px] text-[#FF5500] font-bold uppercase tracking-wider">
                        {formatDateShort(ev.event_date)}
                      </p>
                      <p className="text-[14px] font-black uppercase text-black mt-0.5">{ev.title}</p>
                      {ev.meeting_point_address && (
                        <p className="text-[11px] text-[#A3A3A3] flex items-center gap-1 mt-1">
                          <MapPin size={9} />
                          {ev.meeting_point_address}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
