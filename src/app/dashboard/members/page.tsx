"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Phone, Shield, FileCheck, ChevronRight } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

interface MembreProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  email: string | null;
}

interface Member {
  id: string;          // membre_club id
  membre_id: string;   // membre_profiles id
  joined_at: string;
  membre_profiles: MembreProfile | null;
  _checkins?: number;
  _has_ice?: boolean;
  _has_waiver?: boolean;
}

type Filter = "all" | "has_ice" | "no_ice" | "no_waiver";

const fullName = (p: MembreProfile | null) =>
  [p?.first_name, p?.last_name].filter(Boolean).join(" ").trim();

export default function MembersPage() {
  const { club } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    async function load() {
      const supabase = getSupabase();
      if (!supabase || !club) { setLoading(false); return; }

      const { data } = await supabase
        .from("membre_club")
        .select("id, membre_id, joined_at, membre_profiles(id, first_name, last_name, phone, email)")
        .eq("club_id", club.id)
        .eq("is_active", true)
        .order("joined_at", { ascending: false });

      if (!data) { setLoading(false); return; }

      const ids = (data as any[]).map((m) => m.membre_id).filter(Boolean);
      const [{ data: iceData }, { data: waiverData }, { data: checkinData }] = await Promise.all([
        supabase.from("membre_ice").select("membre_id").in("membre_id", ids),
        supabase.from("membre_waivers").select("membre_id").eq("club_id", club.id).in("membre_id", ids),
        supabase.from("membre_checkins").select("membre_id").in("membre_id", ids).eq("is_valid", true),
      ]);

      const iceSet = new Set((iceData || []).map((i: any) => i.membre_id));
      const waiverSet = new Set((waiverData || []).map((w: any) => w.membre_id));
      const checkinCounts: Record<string, number> = {};
      for (const c of (checkinData || [])) {
        checkinCounts[c.membre_id] = (checkinCounts[c.membre_id] || 0) + 1;
      }

      const enriched = (data as any[]).map((m) => ({
        ...m,
        _has_ice: iceSet.has(m.membre_id),
        _has_waiver: waiverSet.has(m.membre_id),
        _checkins: checkinCounts[m.membre_id] || 0,
      })) as Member[];

      setMembers(enriched);
      setLoading(false);
    }
    load();
  }, [club]);

  const filtered = members.filter((m) => {
    const name = fullName(m.membre_profiles).toLowerCase();
    const phone = (m.membre_profiles?.phone || "").toLowerCase();
    const q = search.toLowerCase();
    if (q && !name.includes(q) && !phone.includes(q)) return false;
    if (filter === "has_ice" && !m._has_ice) return false;
    if (filter === "no_ice" && m._has_ice) return false;
    if (filter === "no_waiver" && m._has_waiver) return false;
    return true;
  });

  const FILTERS: { key: Filter; label: string }[] = [
    { key: "all", label: "Tous" },
    { key: "no_ice", label: "Sans ICE" },
    { key: "no_waiver", label: "Sans décharge" },
    { key: "has_ice", label: "ICE OK" },
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] sm:text-[36px] font-display italic font-black uppercase text-black leading-none tracking-tighter">
            Les Membres
          </h1>
          <p className="text-[13px] text-[#A3A3A3] font-sans mt-1">
            {members.length} membre{members.length > 1 ? "s" : ""} dans ton crew
          </p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A3A3A3]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nom, téléphone…"
            className="w-full h-11 pl-10 pr-4 rounded-full border border-[#E5E7EB] text-sm focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/20 outline-none transition-all bg-white"
          />
        </div>
        <div className="flex gap-1 bg-white border border-black/5 rounded-full p-1 shadow-sm h-fit">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                filter === f.key ? "bg-[#FF5500] text-white" : "text-[#666562] hover:text-black"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Sans ICE", value: members.filter(m => !m._has_ice).length, color: "#EF4444" },
          { label: "Sans décharge", value: members.filter(m => !m._has_waiver).length, color: "#F59E0B" },
          { label: "Ont couru", value: members.filter(m => (m._checkins || 0) > 0).length, color: "#22C55E" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-[20px] border border-black/5 p-4 text-center">
            <p className="text-[28px] font-display font-black italic leading-none" style={{ color: stat.color }}>
              {loading ? "—" : stat.value}
            </p>
            <p className="text-[10px] text-[#A3A3A3] uppercase tracking-wider mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Members list */}
      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="bg-white rounded-[20px] p-4 animate-pulse h-16 border border-black/5" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center py-16 text-center"
        >
          <div className="text-4xl mb-3">🫂</div>
          <p className="text-[15px] font-black uppercase text-black">
            {members.length === 0 ? "Aucun membre encore" : "Aucun membre trouvé"}
          </p>
          <p className="text-[12px] text-[#A3A3A3] mt-1">
            {members.length === 0
              ? "Partage ton lien d'inscription pour que ton crew rejoigne."
              : "Essaie un autre filtre ou terme de recherche."}
          </p>
        </motion.div>
      ) : (
        <div className="bg-white rounded-[24px] border border-black/5 overflow-hidden">
          <div className="divide-y divide-black/5">
            {filtered.map((member, i) => {
              const name = fullName(member.membre_profiles) || "Membre sans nom";
              const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Link
                    href={`/dashboard/members/${member.membre_id}`}
                    className="flex items-center gap-4 p-4 hover:bg-[#FAFAFA] transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#FF5500]/10 flex items-center justify-center shrink-0 font-black text-[12px] text-[#FF5500]">
                      {initials || "?"}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-black truncate">{name}</p>
                      <p className="text-[11px] text-[#A3A3A3] flex items-center gap-1">
                        <Phone size={9} />
                        {member.membre_profiles?.phone || "—"}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center ${member._has_ice ? "bg-[#DCFCE7]" : "bg-[#FEE2E2]"}`} title={member._has_ice ? "ICE renseigné" : "ICE manquant"}>
                        <Shield size={11} className={member._has_ice ? "text-[#22C55E]" : "text-[#EF4444]"} />
                      </span>
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center ${member._has_waiver ? "bg-[#DCFCE7]" : "bg-[#FEE2E2]"}`} title={member._has_waiver ? "Décharge signée" : "Décharge manquante"}>
                        <FileCheck size={11} className={member._has_waiver ? "text-[#22C55E]" : "text-[#EF4444]"} />
                      </span>
                      {(member._checkins || 0) > 0 && (
                        <span className="bg-[#F4F4EE] text-[#666562] text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {member._checkins}
                        </span>
                      )}
                    </div>

                    <ChevronRight size={14} className="text-[#A3A3A3] group-hover:text-[#FF5500] transition-colors shrink-0" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
