"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, Phone, Shield, FileCheck, MapPin, Calendar, CheckCircle2,
  Loader2, AlertTriangle, Star
} from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { formatDateShort } from "@/lib/utils/format";

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  city: string | null;
  date_of_birth: string | null;
  created_at: string;
}

interface IceContact {
  id: string;
  contact_name: string;
  contact_phone: string;
  relationship: string | null;
}

interface MemberBadge {
  id: string;
  awarded_at: string;
  badges: { name: string; slug: string; description: string; icon_url: string | null; category: string } | null;
}

interface EventCheckin {
  id: string;
  created_at: string;
  is_validated: boolean;
  events: { title: string; event_date: string } | null;
}

const BADGE_EMOJIS: Record<string, string> = {
  first_run: "🎽",
  regular_runner: "🔥",
  legend: "🏆",
  explorer: "🗺️",
  ambassador: "📣",
  early_member: "⭐",
};

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { club } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ice, setIce] = useState<IceContact | null>(null);
  const [badges, setBadges] = useState<MemberBadge[]>([]);
  const [checkins, setCheckins] = useState<EventCheckin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = getSupabase();
      if (!supabase) { setLoading(false); return; }

      const [{ data: prof }, { data: iceData }, { data: badgesData }, { data: checkinsData }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", id).single(),
        supabase.from("ice_contacts").select("*").eq("profile_id", id).single(),
        supabase.from("member_badges").select("*, badges(name, slug, description, icon_url, category)").eq("member_id", id).order("awarded_at", { ascending: false }),
        supabase.from("checkins").select("*, events(title, event_date)").eq("member_id", id).order("created_at", { ascending: false }).limit(20),
      ]);

      setProfile(prof);
      setIce(iceData);
      setBadges(badgesData || []);
      setCheckins(checkinsData || []);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[#FF5500]" size={32} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-24">
        <p className="text-[#666562]">Membre introuvable.</p>
        <Link href="/dashboard/members" className="text-[#FF5500] mt-4 inline-block text-sm">← Retour</Link>
      </div>
    );
  }

  const initials = (profile.full_name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const validCheckins = checkins.filter(c => c.is_validated).length;

  return (
    <div className="pb-20 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/members"
          className="flex items-center gap-1.5 text-[#666562] hover:text-black transition-colors text-sm font-medium"
        >
          <ArrowLeft size={15} />
          Membres
        </Link>
      </div>

      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[24px] border border-black/5 p-6"
      >
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-[#FF5500]/10 flex items-center justify-center font-black text-[20px] text-[#FF5500] shrink-0">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover" />
            ) : initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[24px] font-display italic font-black uppercase text-black leading-none tracking-tighter">
              {profile.full_name || "Membre"}
            </h1>
            {profile.city && (
              <p className="text-[12px] text-[#A3A3A3] flex items-center gap-1 mt-0.5">
                <MapPin size={10} />
                {profile.city}
              </p>
            )}
          </div>
          <a
            href={`tel:${profile.phone}`}
            className="flex items-center gap-2 bg-[#FF5500] text-white px-4 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all"
          >
            <Phone size={13} />
            Appeler
          </a>
        </div>

        <div className="mt-4 pt-4 border-t border-black/5 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-[24px] font-display font-black italic text-black leading-none">{validCheckins}</p>
            <p className="text-[10px] text-[#A3A3A3] uppercase tracking-wider mt-0.5">Check-ins</p>
          </div>
          <div>
            <p className="text-[24px] font-display font-black italic text-black leading-none">{badges.length}</p>
            <p className="text-[10px] text-[#A3A3A3] uppercase tracking-wider mt-0.5">Badges</p>
          </div>
          <div>
            <p className="text-[13px] font-black text-black leading-none mt-1">
              {formatDateShort(profile.created_at)}
            </p>
            <p className="text-[10px] text-[#A3A3A3] uppercase tracking-wider mt-0.5">Membre depuis</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ICE Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-[24px] border border-black/5 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[11px] font-black uppercase tracking-widest text-[#666562] flex items-center gap-1.5">
              <Shield size={12} />
              Contact d'Urgence (ICE)
            </h2>
            {ice ? (
              <CheckCircle2 size={16} className="text-[#22C55E]" />
            ) : (
              <AlertTriangle size={16} className="text-[#EF4444]" />
            )}
          </div>

          {ice ? (
            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-[#A3A3A3] uppercase tracking-wider">Nom</p>
                <p className="text-sm font-semibold text-black">{ice.contact_name}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#A3A3A3] uppercase tracking-wider">Relation</p>
                <p className="text-sm font-semibold text-black">{ice.relationship || "Non précisé"}</p>
              </div>
              <a
                href={`tel:${ice.contact_phone}`}
                className="flex items-center gap-2 w-full justify-center bg-[#DCFCE7] text-[#22C55E] px-4 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-[#22C55E] hover:text-white transition-all"
              >
                <Phone size={13} />
                {ice.contact_phone}
              </a>
            </div>
          ) : (
            <div className="flex flex-col items-center py-6 text-center">
              <AlertTriangle size={24} className="text-[#EF4444] mb-2" />
              <p className="text-[12px] text-[#EF4444] font-semibold">ICE non renseigné</p>
              <p className="text-[11px] text-[#A3A3A3] mt-1">Ce membre n'a pas encore fourni de contact d'urgence.</p>
            </div>
          )}
        </motion.div>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[24px] border border-black/5 p-6"
        >
          <h2 className="text-[11px] font-black uppercase tracking-widest text-[#666562] flex items-center gap-1.5 mb-4">
            <Star size={12} />
            Badges ({badges.length})
          </h2>
          {badges.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-4xl mb-2">🎽</p>
              <p className="text-[12px] text-[#A3A3A3]">Aucun badge encore.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {badges.map((b) => (
                <div key={b.id} className="flex flex-col items-center gap-1.5 p-3 bg-[#F4F4EE] rounded-[16px]">
                  <span className="text-2xl">{BADGE_EMOJIS[b.badges?.slug || ""] || "🏅"}</span>
                  <p className="text-[10px] font-black uppercase tracking-wider text-center text-[#1A1918] leading-tight">
                    {b.badges?.name}
                  </p>
                  <p className="text-[9px] text-[#A3A3A3]">{formatDateShort(b.awarded_at)}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Run history */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-[24px] border border-black/5 overflow-hidden"
      >
        <div className="p-6 pb-0">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-[#666562] flex items-center gap-1.5">
            <Calendar size={12} />
            Historique des sorties ({checkins.length})
          </h2>
        </div>
        {checkins.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-[12px] text-[#A3A3A3]">Aucun historique.</p>
          </div>
        ) : (
          <div className="divide-y divide-black/5 mt-4">
            {checkins.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3 px-6 py-3">
                <div className={`w-2 h-2 rounded-full shrink-0 ${c.is_validated ? "bg-[#22C55E]" : "bg-[#F59E0B]"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-black truncate">{c.events?.title || "Sortie"}</p>
                  <p className="text-[11px] text-[#A3A3A3]">{formatDateShort(c.events?.event_date || c.created_at)}</p>
                </div>
                {c.is_validated && (
                  <CheckCircle2 size={14} className="text-[#22C55E] shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
