"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, Phone, Shield, FileCheck, Calendar, CheckCircle2,
  Loader2, AlertTriangle, Cake,
} from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import Link from "next/link";
import { formatDateShort } from "@/lib/utils/format";

interface MembreProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  date_of_birth: string | null;
  created_at: string;
}

interface IceContact {
  contact_name: string;
  contact_phone: string;
  relationship: string | null;
}

interface Checkin {
  id: string;
  checked_in_at: string;
  is_valid: boolean;
  events: { title: string; event_date: string } | null;
}

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<MembreProfile | null>(null);
  const [ice, setIce] = useState<IceContact | null>(null);
  const [hasWaiver, setHasWaiver] = useState(false);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = getSupabase();
      if (!supabase) { setLoading(false); return; }

      const [{ data: prof }, { data: iceData }, { data: waiverData }, { data: checkinsData }] = await Promise.all([
        supabase.from("membre_profiles").select("*").eq("id", id).single(),
        supabase.from("membre_ice").select("contact_name, contact_phone, relationship").eq("membre_id", id).single(),
        supabase.from("membre_waivers").select("id").eq("membre_id", id).limit(1),
        supabase.from("membre_checkins").select("id, checked_in_at, is_valid, events(title, event_date)")
          .eq("membre_id", id).order("checked_in_at", { ascending: false }).limit(20),
      ]);

      setProfile(prof as MembreProfile | null);
      setIce((iceData as IceContact) || null);
      setHasWaiver(!!(waiverData && waiverData.length));
      setCheckins((checkinsData as unknown as Checkin[]) || []);
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

  const name = [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim() || "Membre";
  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const validCheckins = checkins.filter((c) => c.is_valid).length;

  return (
    <div className="pb-20 space-y-6">
      {/* Header */}
      <Link href="/dashboard/members"
        className="inline-flex items-center gap-1.5 text-[#666562] hover:text-black transition-colors text-sm font-medium">
        <ArrowLeft size={15} />
        Membres
      </Link>

      {/* Profile card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[24px] border border-black/5 p-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-[#FF5500]/10 flex items-center justify-center font-black text-[20px] text-[#FF5500] shrink-0">
            {initials || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[24px] font-display italic font-black uppercase text-black leading-none tracking-tighter">
              {name}
            </h1>
            {profile.date_of_birth && (
              <p className="text-[12px] text-[#A3A3A3] flex items-center gap-1 mt-1">
                <Cake size={10} />
                {formatDateShort(profile.date_of_birth)}
              </p>
            )}
          </div>
          {profile.phone && (
            <a href={`tel:${profile.phone}`}
              className="flex items-center gap-2 bg-[#FF5500] text-white px-4 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all">
              <Phone size={13} />
              Appeler
            </a>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-black/5 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-[24px] font-display font-black italic text-black leading-none">{validCheckins}</p>
            <p className="text-[10px] text-[#A3A3A3] uppercase tracking-wider mt-0.5">Check-ins</p>
          </div>
          <div>
            <p className={`text-[24px] font-display font-black italic leading-none ${hasWaiver ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
              {hasWaiver ? "OK" : "—"}
            </p>
            <p className="text-[10px] text-[#A3A3A3] uppercase tracking-wider mt-0.5">Décharge</p>
          </div>
          <div>
            <p className="text-[13px] font-black text-black leading-none mt-1">{formatDateShort(profile.created_at)}</p>
            <p className="text-[10px] text-[#A3A3A3] uppercase tracking-wider mt-0.5">Membre depuis</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ICE Card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-white rounded-[24px] border border-black/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[11px] font-black uppercase tracking-widest text-[#666562] flex items-center gap-1.5">
              <Shield size={12} />
              Contact d'Urgence (ICE)
            </h2>
            {ice ? <CheckCircle2 size={16} className="text-[#22C55E]" /> : <AlertTriangle size={16} className="text-[#EF4444]" />}
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
              <a href={`tel:${ice.contact_phone}`}
                className="flex items-center gap-2 w-full justify-center bg-[#DCFCE7] text-[#22C55E] px-4 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-[#22C55E] hover:text-white transition-all">
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

        {/* Décharge */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-[24px] border border-black/5 p-6">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-[#666562] flex items-center gap-1.5 mb-4">
            <FileCheck size={12} />
            Décharge de responsabilité
          </h2>
          <div className="flex flex-col items-center py-6 text-center">
            {hasWaiver ? (
              <>
                <CheckCircle2 size={28} className="text-[#22C55E] mb-2" />
                <p className="text-[13px] font-semibold text-[#22C55E]">Décharge signée</p>
                <p className="text-[11px] text-[#A3A3A3] mt-1">Preuve légale horodatée enregistrée.</p>
              </>
            ) : (
              <>
                <AlertTriangle size={28} className="text-[#F59E0B] mb-2" />
                <p className="text-[13px] font-semibold text-[#F59E0B]">Décharge manquante</p>
                <p className="text-[11px] text-[#A3A3A3] mt-1">Ce membre n'a pas encore signé.</p>
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* Historique */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-white rounded-[24px] border border-black/5 overflow-hidden">
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
            {checkins.map((c) => (
              <div key={c.id} className="flex items-center gap-3 px-6 py-3">
                <div className={`w-2 h-2 rounded-full shrink-0 ${c.is_valid ? "bg-[#22C55E]" : "bg-[#F59E0B]"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-black truncate">{c.events?.title || "Sortie"}</p>
                  <p className="text-[11px] text-[#A3A3A3]">{formatDateShort(c.events?.event_date || c.checked_in_at)}</p>
                </div>
                {c.is_valid && <CheckCircle2 size={14} className="text-[#22C55E] shrink-0" />}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
