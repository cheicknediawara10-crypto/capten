"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Upload, Save, Loader2, Globe, Copy, Check, Link2, ArrowLeft } from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import { getMyClub, saveMyClub } from "./actions";

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

// Génère un slug d'URL propre à partir du nom du crew.
function slugify(s: string): string {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export default function ClubSettingsPage() {
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const emptyClub: Club = {
        id: "", name: "", slug: "", description: null,
        logo_url: null, city: null, sport_type: null, website_url: null,
      };
      // L'id + les données viennent de la SESSION (server action, cookies) —
      // fiable même si le contexte client n'est pas hydraté.
      const res = await getMyClub();
      if ("error" in res) { setClub(emptyClub); setLoading(false); return; }
      if (res.club) {
        const c = res.club as Club & { whatsapp_display_name?: string | null };
        const defaultName = ["MON RUN CLUB", "Mon Run Club"].includes(c.whatsapp_display_name || "");
        setClub({ ...c, name: c.name || (defaultName ? "" : (c.whatsapp_display_name || "")) });
      } else {
        setClub({ ...emptyClub, id: res.id });
      }
      setLoading(false);
    })();
  }, []);

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
    if (!club.name?.trim()) { alert("Donne un nom à ton crew pour générer ton lien d'inscription."); return; }

    setSaving(true);
    // Enregistrement via server action : l'auth (cookies) + l'écriture se font
    // côté serveur → ne dépend plus de la session client.
    const res = await saveMyClub({
      name: club.name,
      description: club.description,
      logo_url: club.logo_url,
      city: club.city,
      website_url: club.website_url,
    });

    if ("error" in res) alert(res.error);
    else { update("slug", res.slug); showSaved(); }
    setSaving(false);
  }

  const [saved, setSaved] = useState(false);
  const showSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  // Aperçu : slug enregistré, sinon dérivé du nom (généré définitivement à l'enregistrement).
  const previewSlug = club?.slug?.trim() || (club?.name?.trim() ? slugify(club.name) : "");
  const slugReady = !!club?.slug?.trim();
  const joinLink = typeof window !== "undefined" && previewSlug
    ? `${window.location.origin}/join/${previewSlug}`
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
        <Link
          href="/dashboard/members"
          className="inline-flex items-center gap-2 text-[color:var(--app-text-muted)] hover:text-[color:var(--app-text)] transition-colors text-[13px] font-medium mb-4"
        >
          <ArrowLeft size={15} />
          Membres
        </Link>
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
              className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-[color:var(--app-border)] text-[11px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)] hover:border-[#FF5C00] hover:text-[color:var(--app-text)] transition-all disabled:opacity-50"
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
          <label className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--app-text-muted)]">Nom du crew</label>
          <input
            type="text"
            value={club.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Paris Night Runners"
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
            <label className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--app-text-muted)] flex items-center justify-between">
              <span className="flex items-center gap-1"><Globe size={10} /> Lien de Cotisation / Adhésion (Optionnel)</span>
              <span className="text-[#FF5C00] font-normal lowercase">helloasso · lydia · site</span>
            </label>
            <input
              type="url"
              value={club.website_url || ""}
              onChange={(e) => update("website_url", e.target.value)}
              placeholder="https://www.helloasso.com/... ou https://lydia-app.com/..."
              className="w-full h-11 px-4 rounded-[12px] border border-[color:var(--app-border)] text-sm font-medium focus:border-[#FF5C00] focus:ring-2 focus:ring-[#FF5C00]/20 outline-none transition-all"
            />
            <p className="text-[11px] text-[color:var(--app-text-muted)]">
              Permet aux membres de cotiser ou de soutenir le crew (ex: 10€/an pour l&apos;équipement, l&apos;after-run ou financer ton abonnement).
            </p>
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
        {joinLink ? (
          <>
            <div className="flex items-center gap-2">
              <p className="flex-1 text-[12px] font-mono text-[color:var(--app-text-muted)] bg-[var(--app-surface-2)] rounded-[12px] px-4 py-2.5 truncate">
                {joinLink}
              </p>
              <button
                onClick={copyLink}
                disabled={!slugReady}
                title={slugReady ? "" : "Enregistre d'abord pour activer le lien"}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-[12px] bg-[#FF5C00] text-white text-[11px] font-black uppercase tracking-widest hover:bg-[#E04B00] transition-all shrink-0 disabled:opacity-40"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? "Copié" : "Copier"}
              </button>
            </div>
            <p className="text-[10px] text-[color:var(--app-text-muted)] mt-2">
              {slugReady
                ? "Partage ce lien pour que les coureurs rejoignent ton crew et remplissent leur fiche."
                : "Aperçu du lien. Clique sur « Enregistrer » ci-dessous pour l'activer définitivement."}
            </p>
          </>
        ) : (
          <p className="text-[12px] text-[color:var(--app-text-muted)] leading-relaxed">
            Donne un nom à ton crew puis enregistre : ton lien d&apos;inscription se génère automatiquement.
          </p>
        )}
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
