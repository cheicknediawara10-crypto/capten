"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Phone, Shield, FileCheck, ChevronRight, Users, UserPlus, X, Loader2, CheckCircle2, Copy, Link2, Settings } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { addMemberManually } from "./actions";

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
  const [showAdd, setShowAdd] = useState(false);
  const [clubMeta, setClubMeta] = useState<{ slug: string | null; name: string | null } | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || !club) return;
    supabase.from("clubs").select("slug, name").eq("id", club.id).maybeSingle()
      .then(({ data }) => setClubMeta(data as { slug: string | null; name: string | null } | null));
  }, [club]);

  const joinLink = clubMeta?.slug && typeof window !== "undefined"
    ? `${window.location.origin}/join/${clubMeta.slug}`
    : "";

  const copyJoinLink = () => {
    if (!joinLink) return;
    navigator.clipboard?.writeText(joinLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 1800);
  };

  const load = useCallback(async () => {
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
  }, [club]);

  useEffect(() => { load(); }, [load]);

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

  const card = "bg-[var(--app-surface)] border border-[color:var(--app-border)]";

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[30px] sm:text-[40px] font-display italic font-black uppercase text-[color:var(--app-text)] leading-none tracking-tighter">
            Les Membres
          </h1>
          <p className="text-[13px] text-[color:var(--app-text-muted)] font-sans mt-1">
            {members.length} membre{members.length > 1 ? "s" : ""} dans ton crew
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="shrink-0 flex items-center gap-2 px-4 sm:px-5 h-11 rounded-full bg-[#FF5C00] text-white text-[11px] font-black uppercase tracking-widest hover:bg-[#E04B00] transition-all active:scale-95"
        >
          <UserPlus size={15} />
          <span className="hidden sm:inline">Ajouter</span>
        </button>
      </div>

      {/* Invite — lien d'inscription du crew */}
      <div className={`${card} rounded-2xl p-5`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-7 h-7 rounded-lg bg-[var(--app-accent-soft)] flex items-center justify-center shrink-0">
            <Link2 size={14} className="text-[#FF5C00]" />
          </span>
          <h2 className="text-[11px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)]">
            Inviter des coureurs
          </h2>
        </div>

        {joinLink ? (
          <>
            <div className="flex items-center gap-2">
              <p className="flex-1 text-[12px] font-mono text-[color:var(--app-text-muted)] bg-[var(--app-surface-2)] rounded-[12px] px-4 py-2.5 truncate">
                {joinLink}
              </p>
              <button
                onClick={copyJoinLink}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-[12px] bg-[#FF5C00] text-white text-[11px] font-black uppercase tracking-widest hover:bg-[#E04B00] transition-all shrink-0"
              >
                {linkCopied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                {linkCopied ? "Copié" : "Copier"}
              </button>
            </div>
            <p className="text-[11px] text-[color:var(--app-text-muted)] mt-2">
              Partage-le (WhatsApp, Insta, QR) : le coureur remplit sa fiche et rejoint ton crew.
            </p>
          </>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <p className="text-[12px] text-[color:var(--app-text-muted)] leading-snug">
              Nomme ton crew pour activer ton lien d&apos;inscription public.
            </p>
            <Link
              href="/dashboard/club"
              className="shrink-0 flex items-center gap-1.5 px-4 h-9 rounded-full border border-[color:var(--app-border)] text-[10px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)] hover:border-[#FF5C00] hover:text-[color:var(--app-text)] transition-all"
            >
              <Settings size={13} /> Configurer
            </Link>
          </div>
        )}

        {joinLink && (
          <div className="mt-3 pt-3 border-t border-[color:var(--app-border)]">
            <Link
              href="/dashboard/club"
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[color:var(--app-text-muted)] hover:text-[#FF5C00] transition-colors"
            >
              <Settings size={12} /> Personnaliser la page d&apos;inscription (nom, logo, ville)
            </Link>
          </div>
        )}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--app-text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nom, téléphone…"
            className={`w-full h-11 pl-10 pr-4 rounded-full ${card} text-sm text-[color:var(--app-text)] placeholder:text-[color:var(--app-text-muted)] focus:border-[#FF5C00] outline-none transition-all`}
          />
        </div>
        <div className={`flex gap-1 ${card} rounded-full p-1 h-fit`}>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                filter === f.key ? "bg-[#FF5C00] text-white" : "text-[color:var(--app-text-muted)] hover:text-[color:var(--app-text)]"
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
          <div key={stat.label} className={`${card} rounded-2xl p-4 text-center`}>
            <p className="text-[28px] font-display font-black italic leading-none" style={{ color: stat.color }}>
              {loading ? "—" : stat.value}
            </p>
            <p className="text-[10px] text-[color:var(--app-text-muted)] uppercase tracking-wider mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Members list */}
      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => (
            <div key={i} className={`${card} rounded-2xl p-4 animate-pulse h-16`} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 py-16 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-[var(--app-accent-soft)] flex items-center justify-center">
            <Users size={26} className="text-[#FF5C00]" />
          </div>
          <p className="text-[15px] font-semibold text-[color:var(--app-text)]">
            {members.length === 0 ? "Aucun membre encore" : "Aucun membre trouvé"}
          </p>
          <p className="text-[12px] text-[color:var(--app-text-muted)] max-w-xs">
            {members.length === 0
              ? "Partage ton lien d'inscription, ou ajoute un membre à la main."
              : "Essaie un autre filtre ou terme de recherche."}
          </p>
          {members.length === 0 && (
            <button
              onClick={() => setShowAdd(true)}
              className="mt-2 flex items-center gap-2 px-5 h-11 rounded-full bg-[#FF5C00] text-white text-[11px] font-black uppercase tracking-widest hover:bg-[#E04B00] transition-all active:scale-95"
            >
              <UserPlus size={15} />
              Ajouter un membre
            </button>
          )}
        </motion.div>
      ) : (
        <div className={`${card} rounded-2xl overflow-hidden`}>
          <div className="divide-y divide-[color:var(--app-border)]">
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
                    className="flex items-center gap-4 p-4 hover:bg-[var(--app-hover)] transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-[var(--app-accent-soft)] flex items-center justify-center shrink-0 font-bold text-[12px] text-[#FF5C00]">
                      {initials || "?"}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-[color:var(--app-text)] truncate">{name}</p>
                      <p className="text-[11px] text-[color:var(--app-text-muted)] flex items-center gap-1">
                        <Phone size={9} />
                        {member.membre_profiles?.phone || "—"}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center ${member._has_ice ? "bg-[#22C55E]/15" : "bg-[#EF4444]/12"}`} title={member._has_ice ? "ICE renseigné" : "ICE manquant"}>
                        <Shield size={11} className={member._has_ice ? "text-[#22C55E]" : "text-[#EF4444]"} />
                      </span>
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center ${member._has_waiver ? "bg-[#22C55E]/15" : "bg-[#EF4444]/12"}`} title={member._has_waiver ? "Décharge signée" : "Décharge manquante"}>
                        <FileCheck size={11} className={member._has_waiver ? "text-[#22C55E]" : "text-[#EF4444]"} />
                      </span>
                      {(member._checkins || 0) > 0 && (
                        <span className="bg-[var(--app-surface-2)] text-[color:var(--app-text-muted)] text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {member._checkins}
                        </span>
                      )}
                    </div>

                    <ChevronRight size={14} className="text-[color:var(--app-text-muted)] group-hover:text-[#FF5C00] transition-colors shrink-0" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      <AddMemberModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onAdded={() => load()}
      />
    </div>
  );
}

// ── Ajout manuel d'un membre ────────────────────────────────────────────────

function AddMemberModal({
  open, onClose, onAdded,
}: { open: boolean; onClose: () => void; onAdded: () => void }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ pin: string; name: string; linked: boolean } | null>(null);
  const [copied, setCopied] = useState(false);

  function reset() {
    setFirstName(""); setLastName(""); setDob(""); setPhone(""); setEmail("");
    setError(""); setDone(null); setCopied(false); setSaving(false);
  }

  function close() { reset(); onClose(); }

  async function submit() {
    if (!firstName.trim() || !lastName.trim()) {
      setError("Prénom et nom sont requis."); return;
    }
    setError(""); setSaving(true);
    const res = await addMemberManually({
      first_name: firstName, last_name: lastName,
      date_of_birth: dob, phone, email,
    });
    setSaving(false);
    if ("error" in res) { setError(res.error); return; }
    onAdded();
    setDone({ pin: res.pin, name: firstName.trim(), linked: res.linkedExisting });
  }

  const input =
    "w-full h-11 px-4 rounded-[12px] border border-[color:var(--app-border)] bg-[var(--app-surface-2)] text-sm font-medium text-[color:var(--app-text)] placeholder:text-[color:var(--app-text-muted)] focus:border-[#FF5C00] focus:ring-2 focus:ring-[#FF5C00]/20 outline-none transition-all";
  const lbl = "text-[10px] font-bold uppercase tracking-widest text-[color:var(--app-text-muted)] block mb-1";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={close}
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md bg-[var(--app-surface)] border border-[color:var(--app-border)] rounded-t-3xl sm:rounded-3xl p-6 space-y-5 max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-[var(--app-accent-soft)] flex items-center justify-center">
                  <UserPlus size={17} className="text-[#FF5C00]" />
                </span>
                <h2 className="text-[17px] font-display italic font-black uppercase text-[color:var(--app-text)] leading-none">
                  {done ? "Membre ajouté" : "Ajouter un membre"}
                </h2>
              </div>
              <button onClick={close} className="w-8 h-8 rounded-full flex items-center justify-center text-[color:var(--app-text-muted)] hover:bg-[var(--app-hover)] transition-colors">
                <X size={17} />
              </button>
            </div>

            {done ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#22C55E]">
                  <CheckCircle2 size={18} />
                  <p className="text-[14px] font-semibold text-[color:var(--app-text)]">
                    {done.name} fait partie de ton crew.
                  </p>
                </div>

                {done.linked ? (
                  <p className="text-[12px] text-[color:var(--app-text-muted)] leading-relaxed">
                    Ce membre avait déjà un compte Capten : il garde son code PIN existant pour accéder à son espace.
                  </p>
                ) : (
                  <>
                    <p className="text-[12px] text-[color:var(--app-text-muted)] leading-relaxed">
                      Communique ce code PIN provisoire à {done.name} (par WhatsApp). Il accède à son espace avec son nom, sa date de naissance et ce PIN.
                    </p>
                    <div className="flex items-center justify-between gap-3 bg-[var(--app-surface-2)] border border-[color:var(--app-border)] rounded-[16px] px-5 py-4">
                      <span className="text-[34px] font-display font-black italic tracking-[0.3em] text-[color:var(--app-text)] leading-none">
                        {done.pin}
                      </span>
                      <button
                        onClick={() => { navigator.clipboard?.writeText(done.pin); setCopied(true); setTimeout(() => setCopied(false), 1600); }}
                        className="flex items-center gap-1.5 px-3 h-9 rounded-full border border-[color:var(--app-border)] text-[11px] font-bold uppercase tracking-wider text-[color:var(--app-text-muted)] hover:border-[#FF5C00] hover:text-[color:var(--app-text)] transition-all"
                      >
                        {copied ? <CheckCircle2 size={13} className="text-[#22C55E]" /> : <Copy size={13} />}
                        {copied ? "Copié" : "Copier"}
                      </button>
                    </div>
                    {!dob && (
                      <p className="text-[11px] text-[#F59E0B] leading-snug">
                        Astuce : sans date de naissance, le membre ne pourra pas se connecter seul. Ajoute-la depuis sa fiche si besoin.
                      </p>
                    )}
                  </>
                )}

                <div className="flex gap-3 pt-1">
                  <button onClick={reset} className="flex-1 h-11 rounded-full border border-[color:var(--app-border)] text-[11px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)] hover:border-[#FF5C00] hover:text-[color:var(--app-text)] transition-all">
                    Ajouter un autre
                  </button>
                  <button onClick={close} className="flex-1 h-11 rounded-full bg-[#FF5C00] text-white text-[11px] font-black uppercase tracking-widest hover:bg-[#E04B00] transition-all">
                    Terminé
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>Prénom</label>
                    <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Ahmed" className={input} autoFocus />
                  </div>
                  <div>
                    <label className={lbl}>Nom</label>
                    <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Diallo" className={input} />
                  </div>
                </div>

                <div>
                  <label className={lbl}>Date de naissance (recommandé)</label>
                  <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} max={new Date().toISOString().split("T")[0]} className={input} />
                </div>

                <div>
                  <label className={lbl}>Téléphone (optionnel)</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="06 12 34 56 78" className={input} />
                </div>

                <div>
                  <label className={lbl}>E-mail (optionnel)</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ahmed@exemple.fr" className={input} />
                </div>

                {error && (
                  <p className="text-[12px] text-[#EF4444] font-medium">{error}</p>
                )}

                <button
                  onClick={submit}
                  disabled={saving}
                  className="w-full h-12 rounded-full bg-[#FF5C00] text-white text-[12px] font-black uppercase tracking-widest hover:bg-[#E04B00] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
                  Ajouter au crew
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
