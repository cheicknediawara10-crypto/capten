"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Wallet, Check, ExternalLink, Copy, CheckCheck, 
  Sparkles, Heart, ShieldCheck, ArrowUpRight, Share2 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getSupabase } from "@/lib/supabase";

export default function CagnottePage() {
  const { club, refreshClub } = useAuth();
  const [cagnotteUrl, setCagnotteUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const c = club as any;
    if (c?.cagnotte_url || c?.website_url) {
      setCagnotteUrl(c.cagnotte_url || c.website_url || "");
    } else {
      const saved = localStorage.getItem("capten_cagnotte_url");
      if (saved) setCagnotteUrl(saved);
    }
  }, [club]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    localStorage.setItem("capten_cagnotte_url", cagnotteUrl);

    try {
      const supabase = getSupabase();
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from("clubs")
            .update({ cagnotte_url: cagnotteUrl, website_url: cagnotteUrl })
            .eq("owner_id", user.id);
          
          if (refreshClub) await refreshClub();
        }
      }
      showToast("Lien de cagnotte enregistré avec succès !");
    } catch {
      showToast("Enregistré localement.");
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = () => {
    if (!cagnotteUrl) return;
    navigator.clipboard.writeText(cagnotteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-20 max-w-4xl">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#111111] text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/10 text-xs font-black uppercase tracking-wider flex items-center gap-2 animate-fade-in">
          <Check size={14} className="text-[#22C55E]" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-[30px] sm:text-[40px] font-display italic font-black uppercase text-[color:var(--app-text)] leading-none tracking-tighter">
          Cagnotte &amp; Adhésions
        </h1>
        <p className="text-[13px] text-[color:var(--app-text-muted)] font-sans mt-1">
          Collecte les cotisations, dons ou adhésions annuelles de ton crew sans intermédiaire.
        </p>
      </div>

      {/* Main card */}
      <div className="bg-[var(--app-surface)] border border-[color:var(--app-border)] rounded-[28px] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-[color:var(--app-border)] pb-4">
          <span className="w-10 h-10 rounded-2xl bg-[#FF5C00]/10 flex items-center justify-center text-[#FF5C00]">
            <Wallet size={20} />
          </span>
          <div>
            <h2 className="text-[15px] font-black uppercase tracking-tight text-[color:var(--app-text)]">
              Lien de Collecte du Crew
            </h2>
            <p className="text-[11px] text-[color:var(--app-text-muted)]">
              HelloAsso, Lydia, Sumeria ou PayPal — 100% direct sur ton compte
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-[color:var(--app-text-muted)]">
              URL de ta cagnotte ou adhésion
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={cagnotteUrl}
                onChange={(e) => setCagnotteUrl(e.target.value)}
                placeholder="https://www.helloasso.com/associations/... ou https://lydia-app.com/..."
                className="flex-1 h-12 px-4 rounded-xl bg-[var(--app-surface-2)] border border-transparent focus:border-[#FF5C00] focus:bg-[var(--app-surface)] text-sm font-mono font-medium text-[color:var(--app-text)] outline-none transition-all"
              />
              <button
                type="submit"
                disabled={isSaving}
                className="h-12 px-6 rounded-xl bg-[#FF5C00] text-white text-xs font-black uppercase tracking-wider hover:bg-[#E04B00] transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-sm"
              >
                {isSaving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>

          {cagnotteUrl && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={copyToClipboard}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[color:var(--app-border)] text-xs font-bold text-[color:var(--app-text)] hover:border-[#FF5C00] transition-colors"
              >
                {copied ? <CheckCheck size={13} className="text-[#22C55E]" /> : <Copy size={13} />}
                {copied ? "Lien copié !" : "Copier le lien"}
              </button>
              <a
                href={cagnotteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--app-surface-2)] text-xs font-bold text-[color:var(--app-text-muted)] hover:text-[color:var(--app-text)] transition-colors"
              >
                <ExternalLink size={12} />
                Tester le lien
              </a>
            </div>
          )}
        </form>

        {/* Plateformes recommandées */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-[var(--app-surface-2)] border border-[color:var(--app-border)] space-y-1">
            <p className="text-xs font-black text-[color:var(--app-text)]">🟢 HelloAsso (0% frais)</p>
            <p className="text-[11px] text-[color:var(--app-text-muted)] leading-relaxed">
              Idéal pour les associations et clubs sportifs loi 1901. Zéro commission.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--app-surface-2)] border border-[color:var(--app-border)] space-y-1">
            <p className="text-xs font-black text-[color:var(--app-text)]">🟣 Lydia / Sumeria</p>
            <p className="text-[11px] text-[color:var(--app-text-muted)] leading-relaxed">
              Ultra rapide pour créer une cagnotte en 2 minutes et partager entre potes.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--app-surface-2)] border border-[color:var(--app-border)] space-y-1">
            <p className="text-xs font-black text-[color:var(--app-text)]">🔵 PayPal.me</p>
            <p className="text-[11px] text-[color:var(--app-text-muted)] leading-relaxed">
              Pratique pour les petits groupes et contributions directes.
            </p>
          </div>
        </div>

        {/* Info affichage */}
        <div className="bg-[#FF5C00]/[0.06] border border-[#FF5C00]/20 rounded-2xl p-4 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-[#FF5C00] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="text-xs font-black text-[color:var(--app-text)] uppercase tracking-wide">
              Où apparaît ce lien pour tes coureurs ?
            </p>
            <p className="text-xs text-[color:var(--app-text-muted)] leading-relaxed">
              Ce lien est automatiquement affiché sur la page d&apos;inscription publique du club (<code>/join/{(club as any)?.slug || "ton-crew"}</code>) et sur le passeport de chaque coureur pour faciliter les adhésions et le soutien logistique.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
