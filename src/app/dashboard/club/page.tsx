"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Save, Loader2, Globe, Copy, Check, Link2 } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

interface Club {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  city: string | null;
  sport_type: string | null;
  website_url: string | null;
}

export default function ClubSettingsPage() {
  const { user, club: authClub } = useAuth();
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const clubId = authClub?.id || user?.id || "";
      const emptyClub: Club = {
        id: clubId,
        name: (authClub?.name && !["MON RUN CLUB", "Mon Run Club"].includes(authClub.name)) ? authClub.name : "",
        slug: (authClub as any)?.slug || "",
        description: null,
        logo_url: (authClub?.branding as any)?.logo || null,
        city: null,
        sport_type: null,
        website_url: null,
      };

      const supabase = getSupabase();
      // On rend toujours un formulaire éditable, même sans ligne clubs encore créée.
      if (!supabase || !clubId) { setClub(emptyClub); setLoading(false); return; }

      const { data } = await supabase.from("clubs").select("*").eq("id", clubId).maybeSingle();
      setClub((data as Club) || emptyClub);
      setLoading(false);
    }
    load();
  }, [authClub, user]);

  const update = (key: keyof Club, value: string) =>
    setClub((prev) => prev ? { ...prev, [key]: value } : prev);

  async function uploadLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !club) return;

    setLogoUploading(true);
    const supabase = getSupabase();
    if (!supabase) { setLogoUploading(false); return; }

    const ext = file.name.split(".").pop();
    const path = `clubs/${club.id}/logo.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      update("logo_url", publicUrl);
    }

    setLogoUploading(false);
  }

  async function save() {
    if (!club) return;
    const clubId = club.id || user?.id;
    if (!clubId) { alert("Session introuvable, reconnecte-toi."); return; }
    setSaving(true);
    const supabase = getSupabase();
    if (!supabase) { setSaving(false); return; }

    // Upsert : crée la ligne du crew si elle n'existe pas encore (crew tout neuf)
    const { error } = await supabase.from("clubs").upsert({
      id: clubId,
      owner_id: clubId,
      name: club.name,
      description: club.description,
      logo_url: club.logo_url,
      city: club.city,
      website_url: club.website_url,
    }, { onConflict: "id" });

    if (error) alert("Erreur : " + error.message);
    else showSaved();
    setSaving(false);
  }

  const [saved, setSaved] = useState(false);
  const showSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const joinLink = typeof window !== "undefined" && club
    ? `${window.location.origin}/join/${club.slug}`
    : "";

  const copyLink = () => {
    navigator.clipboard.writeText(joinLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[#FF5C00]" size={32} />
      </div>
    );
  }

  if (!club) return null;

  return (
    <div className="pb-20 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-[28px] sm:text-[36px] font-display italic font-black uppercase text-[color:var(--app-text)] leading-none tracking-tighter">
          Mon Crew
        </h1>
        <p className="text-[13px] text-[color:var(--app-text-muted)] mt-1">Paramètres et identité de ton crew</p>
      </div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--app-surface)] rounded-[24px] border border-[color:var(--app-border)] p-6"
      >
        <h2 className="text-[11px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)] mb-4">Logo</h2>
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-[20px] bg-[var(--app-surface-2)] flex items-center justify-center overflow-hidden shrink-0">
            {club.logo_url ? (
              <img src={club.logo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl">🏃</span>
            )}
          </div>
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={uploadLogo}
              className="hidden"
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={logoUploading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-[color:var(--app-border)] text-[11px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)] hover:border-black hover:text-[color:var(--app-text)] transition-all disabled:opacity-50"
            >
              {logoUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
              {logoUploading ? "Envoi…" : "Changer le logo"}
            </button>
            <p className="text-[10px] text-[color:var(--app-text-muted)] mt-1.5">PNG ou JPG · max 2 Mo</p>
          </div>
        </div>
      </motion.div>

      {/* Infos */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-[var(--app-surface)] rounded-[24px] border border-[color:var(--app-border)] p-6 space-y-4"
      >
        <h2 className="text-[11px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)]">Informations</h2>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--app-text-muted)]">Nom du club</label>
          <input
            type="text"
            value={club.name}
            onChange={(e) => update("name", e.target.value)}
            className="w-full h-11 px-4 rounded-[12px] border border-[color:var(--app-border)] text-sm font-medium focus:border-[#FF5C00] focus:ring-2 focus:ring-[#FF5C00]/20 outline-none transition-all"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--app-text-muted)]">Description</label>
          <textarea
            value={club.description || ""}
            onChange={(e) => update("description", e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-[12px] border border-[color:var(--app-border)] text-sm font-medium focus:border-[#FF5C00] focus:ring-2 focus:ring-[#FF5C00]/20 outline-none transition-all resize-none"
            placeholder="Qui êtes-vous ? Quand courrez-vous ?"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--app-text-muted)]">Ville</label>
            <input
              type="text"
              value={club.city || ""}
              onChange={(e) => update("city", e.target.value)}
              placeholder="Paris"
              className="w-full h-11 px-4 rounded-[12px] border border-[color:var(--app-border)] text-sm font-medium focus:border-[#FF5C00] focus:ring-2 focus:ring-[#FF5C00]/20 outline-none transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--app-text-muted)] flex items-center gap-1">
              <Globe size={10} />
              Site web
            </label>
            <input
              type="url"
              value={club.website_url || ""}
              onChange={(e) => update("website_url", e.target.value)}
              placeholder="https://…"
              className="w-full h-11 px-4 rounded-[12px] border border-[color:var(--app-border)] text-sm font-medium focus:border-[#FF5C00] focus:ring-2 focus:ring-[#FF5C00]/20 outline-none transition-all"
            />
          </div>
        </div>
      </motion.div>

      {/* Join link */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[var(--app-surface)] rounded-[24px] border border-[color:var(--app-border)] p-6"
      >
        <h2 className="text-[11px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)] mb-3 flex items-center gap-1.5">
          <Link2 size={12} />
          Lien d'inscription membres
        </h2>
        <div className="flex items-center gap-2">
          <p className="flex-1 text-[12px] font-mono text-[color:var(--app-text-muted)] bg-[var(--app-surface-2)] rounded-[12px] px-4 py-2.5 truncate">
            {joinLink}
          </p>
          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-[12px] bg-black text-white text-[11px] font-black uppercase tracking-widest hover:bg-[#FF5C00] transition-all shrink-0"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copié" : "Copier"}
          </button>
        </div>
        <p className="text-[10px] text-[color:var(--app-text-muted)] mt-2">
          Partage ce lien pour que les membres rejoignent ton club et remplissent leur fiche.
        </p>
      </motion.div>

      {/* Save */}
      <button
        onClick={save}
        disabled={saving}
        className="flex items-center gap-2 px-8 py-3 rounded-full bg-[#FF5C00] text-white text-[11px] font-black uppercase tracking-widest hover:bg-[#E04B00] transition-all active:scale-95 disabled:opacity-50"
      >
        {saving ? <Loader2 size={13} className="animate-spin" /> : saved ? <Check size={13} /> : <Save size={13} />}
        {saved ? "Enregistré ✓" : "Enregistrer les modifications"}
      </button>
    </div>
  );
}
