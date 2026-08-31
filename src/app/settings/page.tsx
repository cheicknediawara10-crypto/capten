"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  Building2, Upload, Globe, Copy, CheckCheck, 
  ExternalLink, CreditCard, HelpCircle, MessageCircle, 
  Mail, Shield, Sparkles, Check, ChevronDown, ChevronUp,
  Instagram, Phone, Share2, AlertCircle, Loader2
} from "lucide-react";
import { getMyClub, saveMyClub } from "@/app/dashboard/club/actions";
import { getSupabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { getOrCreateClubStandingStaffToken, revokeStaffToken } from "@/lib/staff/actions";

export default function SettingsPage() {
  const { user, refreshClub } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Staff Token State
  const [staffTokenData, setStaffTokenData] = useState<{ token: string; staffUrl: string; label: string } | null>(null);
  const [staffCopied, setStaffCopied] = useState(false);
  const [staffLoading, setStaffLoading] = useState(false);

  // Club identity fields
  const [clubId, setClubId] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [instagramUrl, setInstagramUrl] = useState("");
  const [whatsappLink, setWhatsappLink] = useState("");
  const [logoUploading, setLogoUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    (async () => {
      const res = await getMyClub();
      if (!("error" in res)) {
        const c = res.club as any;
        if (c) {
          setClubId(c.id || "");
          setName(c.name || c.whatsapp_display_name || "");
          setSlug(c.slug || "");
          setCity(c.city || "");
          setDescription(c.description || "");
          setLogoUrl(c.logo_url || null);
          setInstagramUrl(c.instagram_url || "");
          setWhatsappLink(c.whatsapp_link || "");
        }
      }

      // Fetch standing staff token
      const staffRes = await getOrCreateClubStandingStaffToken();
      if (!("error" in staffRes)) {
        setStaffTokenData(staffRes);
      }

      setLoading(false);
    })();
  }, []);

  const handleRevokeStaffToken = async () => {
    if (!staffTokenData) return;
    if (!confirm("Révoquer ce lien staff général ? Tes co-capitaines ne pourront plus l'utiliser pour pointer.")) return;
    setStaffLoading(true);
    await revokeStaffToken(staffTokenData.token);
    // Regenerate a fresh one
    const fresh = await getOrCreateClubStandingStaffToken();
    if (!("error" in fresh)) {
      setStaffTokenData(fresh);
      showToast("Lien staff révoqué et régénéré !");
    }
    setStaffLoading(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !clubId) return;

    setLogoUploading(true);
    try {
      const supabase = getSupabase();
      if (!supabase) {
        // Fallback FileReader preview
        const reader = new FileReader();
        reader.onload = () => setLogoUrl(reader.result as string);
        reader.readAsDataURL(file);
        setLogoUploading(false);
        return;
      }

      const ext = file.name.split(".").pop();
      const path = `clubs/${clubId}/logo_${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
        setLogoUrl(publicUrl);
        showToast("Logo téléversé avec succès !");
      }
    } catch {
      showToast("Erreur lors de l'upload.");
    } finally {
      setLogoUploading(false);
    }
  };

  const handleSaveIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Donne un nom à ton club.");
      return;
    }

    setSaving(true);
    const res = await saveMyClub({
      name: name.trim(),
      city: city.trim() || null,
      description: description.trim() || null,
      logo_url: logoUrl,
      instagram_url: instagramUrl.trim() || null,
      whatsapp_link: whatsappLink.trim() || null,
    });

    if ("ok" in res && res.ok) {
      setSlug(res.slug);
      showToast("Réglages enregistrés avec succès !");
      if (refreshClub) await refreshClub();
    } else {
      showToast("Erreur lors de l'enregistrement.");
    }
    setSaving(false);
  };

  // Garde-fou : pas de lien tant que le crew n'a pas de slug (sinon on partagerait
  // un /join/ton-crew mort). Le slug est généré dès que le nom du crew est enregistré.
  const hasJoinLink = !!slug;
  const joinUrl = hasJoinLink
    ? `${typeof window !== "undefined" ? window.location.origin : "https://www.capten.app"}/join/${slug}`
    : "";

  const copyJoinUrl = () => {
    if (!joinUrl) return;
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const FAQS = [
    {
      q: "Comment un nouveau coureur s'inscrit à mon crew ?",
      a: "Partage-lui simplement ton lien d'inscription unique (/join/...). En 30 secondes chrono, il signe la décharge légale du club, renseigne son contact d'urgence et crée son passeport coureur.",
    },
    {
      q: "Que faire si un coureur a oublié son code PIN ?",
      a: "Rends-toi dans l'onglet « Crew », clique sur sa fiche, puis sur « Réinitialiser le code PIN ». Un nouveau code à 4 chiffres sera généré instantanément pour lui.",
    },
    {
      q: "Comment fonctionne la collecte de cotisation ou cagnotte ?",
      a: "Rends-toi dans l'onglet « Cagnotte », configure ton lien HelloAsso, Lydia ou PayPal. Il s'affichera directement sur le passeport de tes membres et tu pourras suivre qui a cotisé.",
    },
    {
      q: "Où sont stockées les décharges de responsabilité ?",
      a: "Toutes les signatures sont horodatées et conservées de manière sécurisée dans ta base. Elles sont consultables à tout moment sur la fiche de chaque coureur.",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6 pb-20 max-w-4xl animate-pulse">
        <div className="h-10 w-48 bg-black/5 rounded-2xl" />
        <div className="h-96 bg-black/5 rounded-[28px]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24 max-w-4xl">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#111111] text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/10 text-xs font-black uppercase tracking-wider flex items-center gap-2 animate-fade-in">
          <Check size={14} className="text-[#22C55E]" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-[32px] sm:text-[42px] font-display italic font-black uppercase text-[color:var(--app-text)] leading-none tracking-tighter">
          Réglages
        </h1>
        <p className="text-[13px] text-[color:var(--app-text-muted)] font-sans mt-1">
          Gère l&apos;identité de ton crew, ton forfait et ton assistance.
        </p>
      </div>

      {/* ── SECTION 1 : IDENTITÉ DU CLUB & PAGE PUBLIQUE ── */}
      <form onSubmit={handleSaveIdentity} className="bg-[var(--app-surface)] border border-[color:var(--app-border)] rounded-[28px] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-[color:var(--app-border)] pb-4">
          <span className="w-10 h-10 rounded-2xl bg-[#FF5500]/10 flex items-center justify-center text-[#FF5500]">
            <Building2 size={20} />
          </span>
          <div>
            <h2 className="text-base font-extrabold uppercase tracking-tight text-[color:var(--app-text)]">
              1. Identité &amp; Page Publique du Crew
            </h2>
            <p className="text-xs text-[color:var(--app-text-muted)]">
              Ces informations sont affichées sur ta page d&apos;inscription et le passeport de tes membres.
            </p>
          </div>
        </div>

        {/* Logo Upload */}
        <div className="flex items-center gap-5">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="relative w-20 h-20 rounded-2xl bg-[var(--app-surface-2)] border-2 border-dashed border-[color:var(--app-border)] hover:border-[#FF5500] flex items-center justify-center cursor-pointer overflow-hidden transition-colors group shrink-0"
          >
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-2">
                <Upload size={18} className="mx-auto text-[color:var(--app-text-muted)] group-hover:text-[#FF5500] transition-colors" />
                <span className="text-[9px] font-bold text-[color:var(--app-text-muted)] block mt-1 uppercase">Logo</span>
              </div>
            )}
            {logoUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 size={16} className="text-white animate-spin" />
              </div>
            )}
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleLogoUpload} 
            accept="image/*" 
            className="hidden" 
          />

          <div className="space-y-1">
            <p className="text-xs font-black uppercase text-[color:var(--app-text)]">
              Logo du Crew
            </p>
            <p className="text-xs text-[color:var(--app-text-muted)]">
              PNG ou SVG recommandé (carré 400x400 px).
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-bold text-[#FF5500] hover:underline cursor-pointer"
            >
              Changer l&apos;image →
            </button>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)]">
              Nom du Crew *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: DIAWARA CLUB"
              className="w-full h-11 px-4 rounded-xl bg-[var(--app-surface-2)] text-xs font-extrabold text-[color:var(--app-text)] outline-none focus:ring-1 focus:ring-[#FF5500]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)]">
              Ville ou Quartier
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ex: Paris 10ème, Lyon, Bordeaux..."
              className="w-full h-11 px-4 rounded-xl bg-[var(--app-surface-2)] text-xs font-medium text-[color:var(--app-text)] outline-none focus:ring-1 focus:ring-[#FF5500]"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)]">
            Description / Bio du Crew
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Runs tous les mardis et jeudis à 19h. Ambiance bienveillante, tous niveaux bienvenus !"
            className="w-full p-3 rounded-xl bg-[var(--app-surface-2)] text-xs font-medium text-[color:var(--app-text)] outline-none focus:ring-1 focus:ring-[#FF5500] resize-none"
          />
        </div>

        {/* Social Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[color:var(--app-border)]">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)] flex items-center gap-1.5">
              <Instagram size={12} className="text-[#FF5500]" />
              Lien ou Compte Instagram
            </label>
            <input
              type="text"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              placeholder="https://instagram.com/diawaraclub"
              className="w-full h-11 px-4 rounded-xl bg-[var(--app-surface-2)] text-xs font-medium text-[color:var(--app-text)] outline-none focus:ring-1 focus:ring-[#FF5500]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)] flex items-center gap-1.5">
              <Phone size={12} className="text-[#22C55E]" />
              Lien Groupe WhatsApp du Crew
            </label>
            <input
              type="text"
              value={whatsappLink}
              onChange={(e) => setWhatsappLink(e.target.value)}
              placeholder="https://chat.whatsapp.com/..."
              className="w-full h-11 px-4 rounded-xl bg-[var(--app-surface-2)] text-xs font-medium text-[color:var(--app-text)] outline-none focus:ring-1 focus:ring-[#FF5500]"
            />
          </div>
        </div>

        {/* Public Join Link Card */}
        <div className="bg-[#FF5500]/[0.06] border border-[#FF5500]/20 rounded-2xl p-4.5 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#FF5500]">
            🔗 Ton Lien Public d&apos;Adhésion
          </p>
          {hasJoinLink ? (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 px-3.5 py-2 rounded-xl bg-[var(--app-surface)] border border-[color:var(--app-border)] font-mono text-xs font-bold text-[color:var(--app-text)] truncate">
                {joinUrl}
              </div>
              <button
                type="button"
                onClick={copyJoinUrl}
                className="h-10 px-4 rounded-xl bg-[var(--app-surface)] border border-[color:var(--app-border)] text-xs font-bold text-[color:var(--app-text)] hover:border-[#FF5500] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                {copied ? <CheckCheck size={14} className="text-[#22C55E]" /> : <Copy size={14} />}
                {copied ? "Lien copié !" : "Copier le lien"}
              </button>
              <a
                href={joinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 px-3.5 rounded-xl bg-[#FF5500] text-white text-xs font-black uppercase tracking-wider hover:bg-[#E04B00] transition-colors flex items-center justify-center gap-1.5 shrink-0"
              >
                <ExternalLink size={13} />
                Aperçu
              </a>
            </div>
          ) : (
            <p className="text-xs font-medium text-[color:var(--app-text-muted)] leading-snug">
              Renseigne le <strong className="text-[color:var(--app-text)]">nom de ton crew</strong> ci-dessus et enregistre pour activer ton lien d&apos;inscription. Tu pourras ensuite le partager à tes coureurs.
            </p>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="h-11 px-7 rounded-xl bg-[#111111] text-white text-xs font-black uppercase tracking-wider hover:bg-black transition-transform active:scale-95 cursor-pointer shadow-md"
          >
            {saving ? "Enregistrement..." : "Sauvegarder les modifications"}
          </button>
        </div>
      </form>

      {/* ── SECTION 2 : ÉQUIPE & CO-CAPITAINES (DÉLÉGATION STAFF) ── */}
      <div className="bg-[var(--app-surface)] border border-[color:var(--app-border)] rounded-[28px] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-[color:var(--app-border)] pb-4 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-[#FF5500]/10 flex items-center justify-center text-[#FF5500]">
              <Sparkles size={20} />
            </span>
            <div>
              <h2 className="text-base font-extrabold uppercase tracking-tight text-[color:var(--app-text)]">
                2. Équipe &amp; Co-Capitaines (Délégation Staff)
              </h2>
              <p className="text-xs text-[color:var(--app-text-muted)]">
                Permets à tes pacers et co-organisateurs de pointer les coureurs et de voir les fiches d&apos;urgence (ICE).
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[var(--app-surface-2)] border border-[color:var(--app-border)] space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-black uppercase tracking-wider text-[color:var(--app-text-muted)]">
                Lien Magique Staff Permanent (Zéro mot de passe)
              </p>
              <span className="px-2 py-0.5 rounded-full bg-[#22C55E]/10 text-[#22C55E] text-[10px] font-bold uppercase">
                Actif
              </span>
            </div>

            {staffTokenData ? (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex-1 px-3.5 py-2.5 rounded-xl bg-[var(--app-surface)] border border-[color:var(--app-border)] font-mono text-xs font-bold text-[color:var(--app-text)] truncate">
                  {staffTokenData.staffUrl}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(staffTokenData.staffUrl);
                    setStaffCopied(true);
                    setTimeout(() => setStaffCopied(false), 2500);
                  }}
                  className="h-10 px-4 rounded-xl bg-[var(--app-surface)] border border-[color:var(--app-border)] text-xs font-bold text-[color:var(--app-text)] hover:border-[#FF5500] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  {staffCopied ? <CheckCheck size={14} className="text-[#22C55E]" /> : <Copy size={14} />}
                  {staffCopied ? "Copié !" : "Copier"}
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Salut l'équipe ! Voici votre lien Staff pour pointer les coureurs et voir les fiches d'urgence (ICE) : ${staffTokenData.staffUrl} 🖤`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 px-4 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shrink-0 transition-all shadow-sm"
                >
                  <MessageCircle size={14} /> WhatsApp
                </a>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-[color:var(--app-text-muted)]">
                <Loader2 size={14} className="animate-spin text-[#FF5500]" /> Chargement du lien staff...
              </div>
            )}

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs leading-relaxed space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Shield size={14} className="text-[#22C55E]" /> Sécurité &amp; Confidentialité Totale
              </p>
              <p className="text-[11px] opacity-90">
                Tes co-capitaines arrivent directement sur leur cockpit mobile terrain (Scanner QR + Liste + Appels d&apos;urgence ICE). Ils n&apos;ont <strong>aucun accès à tes réglages de compte, ni à Stripe, ni à la facturation</strong>.
              </p>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleRevokeStaffToken}
                disabled={staffLoading}
                className="text-xs font-bold text-red-500 hover:text-red-600 hover:underline cursor-pointer"
              >
                {staffLoading ? "Régénération..." : "Révoquer & régénérer le lien staff"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 3 : FORFAIT & ABONNEMENT ── */}
      <div className="bg-[var(--app-surface)] border border-[color:var(--app-border)] rounded-[28px] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-[color:var(--app-border)] pb-4">
          <span className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
            <CreditCard size={20} />
          </span>
          <div>
            <h2 className="text-base font-extrabold uppercase tracking-tight text-[color:var(--app-text)]">
              3. Forfait &amp; Statut du Compte
            </h2>
            <p className="text-xs text-[color:var(--app-text-muted)]">
              Détails de ton infrastructure CAPTEN.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[var(--app-surface-2)] border border-[color:var(--app-border)]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-[color:var(--app-text)]">
                Plan Fondateur Pro
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 text-[10px] font-black uppercase tracking-wider">
                ✓ Actif &amp; Débloqué
              </span>
            </div>
            <p className="text-xs text-[color:var(--app-text-muted)]">
              Accès complet à toutes les fonctionnalités (Runs illimités, Décharges horodatées, ICE, Spots, Cagnotte).
            </p>
          </div>

          <div className="shrink-0">
            <span className="text-xs font-mono font-bold text-[color:var(--app-text-muted)]">
              Compte : {user?.email || "Fondateur"}
            </span>
          </div>
        </div>
      </div>

      {/* ── SECTION 3 : ASSISTANCE & SUPPORT ── */}
      <div className="bg-[var(--app-surface)] border border-[color:var(--app-border)] rounded-[28px] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-[color:var(--app-border)] pb-4">
          <span className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <HelpCircle size={20} />
          </span>
          <div>
            <h2 className="text-base font-extrabold uppercase tracking-tight text-[color:var(--app-text)]">
              3. Assistance &amp; Support Direct
            </h2>
            <p className="text-xs text-[color:var(--app-text-muted)]">
              Une question, une idée ou un besoin d&apos;assistance ? L&apos;équipe CAPTEN te répond en direct.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href={`https://wa.me/33600000000?text=${encodeURIComponent(`👋 Hello l'équipe CAPTEN ! Je suis le capitaine de ${name || "mon club"} et j'ai une question :`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 rounded-2xl bg-[#22C55E]/10 border border-[#22C55E]/30 hover:bg-[#22C55E]/15 transition-colors flex items-start gap-3.5 group"
          >
            <MessageCircle className="w-6 h-6 text-[#22C55E] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black uppercase text-[color:var(--app-text)]">
                Assistance WhatsApp
              </p>
              <p className="text-[11px] text-[color:var(--app-text-muted)] mt-0.5">
                Chat en direct avec l&apos;équipe produit pour un retour rapide.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#22C55E] mt-2 group-hover:translate-x-0.5 transition-transform">
                Ouvrir WhatsApp →
              </span>
            </div>
          </a>

          <a
            href="mailto:info.captenfr@gmail.com?subject=Assistance%20Capitaine%20CAPTEN"
            className="p-5 rounded-2xl bg-[var(--app-surface-2)] border border-[color:var(--app-border)] hover:border-[#FF5500] transition-colors flex items-start gap-3.5 group"
          >
            <Mail className="w-6 h-6 text-[#FF5500] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black uppercase text-[color:var(--app-text)]">
                Support par Email
              </p>
              <p className="text-[11px] text-[color:var(--app-text-muted)] mt-0.5">
                info.captenfr@gmail.com (réponse sous 24h).
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#FF5500] mt-2 group-hover:translate-x-0.5 transition-transform">
                Envoyer un email →
              </span>
            </div>
          </a>
        </div>

        {/* FAQ Accordion */}
        <div className="pt-3 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)] mb-2">
            Questions Fréquentes (FAQ)
          </p>
          <div className="divide-y divide-[color:var(--app-border)] border border-[color:var(--app-border)] rounded-2xl overflow-hidden">
            {FAQS.map((item, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} className="bg-[var(--app-surface)]">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-[var(--app-hover)] transition-colors cursor-pointer"
                  >
                    <span className="text-xs font-extrabold text-[color:var(--app-text)]">
                      {item.q}
                    </span>
                    {isOpen ? (
                      <ChevronUp size={16} className="text-[#FF5500] shrink-0" />
                    ) : (
                      <ChevronDown size={16} className="text-neutral-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-[color:var(--app-text-muted)] leading-relaxed bg-[var(--app-surface-2)]/30">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
