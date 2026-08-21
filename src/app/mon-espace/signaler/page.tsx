"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft, ShieldAlert, Settings, Heart, MessageCircle,
  Lock, CheckCircle2, Loader2, AlertTriangle, Send,
} from "lucide-react";
import { submitSignalement } from "@/lib/signalements/actions";

type T = "securite" | "organisation" | "avis" | "autre";

const TYPES: { key: T; label: string; Icon: any; color: string; bg: string }[] = [
  { key: "securite", label: "Sécurité", Icon: ShieldAlert, color: "#EF4444", bg: "#FEE2E2" },
  { key: "organisation", label: "Organisation", Icon: Settings, color: "#F59E0B", bg: "#FEF3C7" },
  { key: "avis", label: "Avis / idée", Icon: Heart, color: "#22C55E", bg: "#DCFCE7" },
  { key: "autre", label: "Autre", Icon: MessageCircle, color: "#6B7280", bg: "#F3F4F6" },
];

export default function SignalerPage() {
  const [type, setType] = useState<T>("securite");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function submit() {
    if (!message.trim()) { setError("Écris ton message avant d'envoyer."); return; }
    setError(""); setSaving(true);
    const res = await submitSignalement({ type, message, is_anonymous: anonymous });
    setSaving(false);
    if ("error" in res) { setError(res.error); return; }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center px-5 py-12">
        <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm bg-white rounded-3xl border border-[#E8E8E8] p-9 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
          <div className="w-16 h-16 rounded-2xl bg-[#DCFCE7] flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-[#22C55E]" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#111111] mb-2">Bien reçu 🤝</h1>
          <p className="text-sm text-[#6B7280] leading-relaxed">
            Ton message est arrivé {anonymous ? "anonymement " : ""}à ton organisateur. Merci — c'est comme ça qu'on garde un crew sain.
          </p>
          <Link href="/mon-espace/profil"
            className="mt-7 inline-flex items-center justify-center gap-2 w-full h-12 bg-[#FF5500] hover:bg-[#E04B00] text-white font-bold text-sm rounded-xl transition-colors">
            Retour à mon espace
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <header className="px-5 pt-12 pb-4 max-w-lg mx-auto">
        <Link href="/mon-espace/profil" className="inline-flex items-center gap-1.5 text-[#9CA3AF] hover:text-[#111] transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Mon espace
        </Link>
      </header>

      <div className="max-w-lg mx-auto px-5 pb-16">
        <h1 className="text-[26px] font-extrabold text-[#111111] tracking-tight leading-tight">
          Signaler ou donner ton avis
        </h1>
        <p className="text-sm text-[#6B7280] mt-1.5 mb-6">
          Un souci pendant un run, un comportement déplacé, ou juste une idée ? Dis-le à ton organisateur.
        </p>

        {/* Type */}
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-2">De quoi s'agit-il ?</p>
        <div className="grid grid-cols-2 gap-2.5 mb-6">
          {TYPES.map((t) => {
            const active = type === t.key;
            return (
              <button key={t.key} onClick={() => setType(t.key)}
                className={`flex items-center gap-2.5 px-3.5 py-3 rounded-2xl border text-left transition-all ${
                  active ? "border-[#111] bg-white shadow-sm" : "border-[#E8E8E8] bg-white hover:border-[#D0D0D0]"
                }`}>
                <span className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: t.bg }}>
                  <t.Icon className="w-4 h-4" style={{ color: t.color }} />
                </span>
                <span className="text-[13px] font-bold text-[#111]">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sécurité : garde-fou */}
        {type === "securite" && (
          <div className="flex items-start gap-2.5 bg-[#FEE2E2] border border-[#FCA5A5] rounded-2xl p-4 mb-5">
            <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
            <p className="text-[12px] text-[#991B1B] leading-snug">
              <b>En cas de danger immédiat</b>, contacte d'abord les secours (<b>112</b>) ou la police (<b>17</b>). Ton organisateur n'est pas un service d'urgence — mais il doit savoir pour agir.
            </p>
          </div>
        )}

        {/* Message */}
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-2">Ton message</p>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5}
          placeholder={type === "securite"
            ? "Décris ce qui s'est passé, quand, et qui est concerné si tu le souhaites…"
            : "Écris ce que tu as sur le cœur…"}
          className="w-full bg-white border border-[#E8E8E8] rounded-2xl px-4 py-3.5 text-[14px] text-[#111] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#FF5500] transition-colors resize-none leading-snug" />

        {/* Anonyme */}
        <button onClick={() => setAnonymous((a) => !a)}
          className="w-full flex items-center gap-3 mt-4 bg-white border border-[#E8E8E8] rounded-2xl p-4 text-left hover:border-[#D0D0D0] transition-colors">
          <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${anonymous ? "bg-[#111]" : "bg-[#F3F4F6]"}`}>
            <Lock className={`w-4 h-4 ${anonymous ? "text-white" : "text-[#9CA3AF]"}`} />
          </span>
          <span className="flex-1">
            <span className="block text-[13px] font-bold text-[#111]">Envoyer anonymement</span>
            <span className="block text-[11px] text-[#9CA3AF] leading-snug mt-0.5">
              {anonymous ? "Ton organisateur ne verra pas ton nom." : "Ton nom sera visible par ton organisateur."}
            </span>
          </span>
          <span className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ${anonymous ? "bg-[#FF5500]" : "bg-[#E5E7EB]"}`}>
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${anonymous ? "left-[22px]" : "left-0.5"}`} />
          </span>
        </button>

        {error && <p className="text-[12px] text-[#EF4444] font-medium mt-3">{error}</p>}

        <button onClick={submit} disabled={saving}
          className="w-full mt-5 h-13 flex items-center justify-center gap-2 bg-[#FF5500] hover:bg-[#E04B00] disabled:opacity-50 text-white font-bold text-sm rounded-2xl transition-colors"
          style={{ height: 52 }}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Envoyer à mon organisateur</>}
        </button>
        <p className="text-[11px] text-[#9CA3AF] text-center mt-3 leading-snug">
          Visible uniquement par l'organisateur de ton crew. Jamais par les autres membres.
        </p>
      </div>
    </div>
  );
}
