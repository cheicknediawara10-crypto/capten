"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone, Shield, FileText, CheckCircle2, Loader2, ArrowRight, ChevronLeft
} from "lucide-react";
import { getSupabase } from "@/lib/supabase";

type Step = "phone" | "otp" | "ice" | "waiver" | "success";

interface Club {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  city: string | null;
}

const STEPS: Step[] = ["phone", "otp", "ice", "waiver", "success"];

export default function JoinPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [club, setClub] = useState<Club | null>(null);
  const [clubLoading, setClubLoading] = useState(true);
  const [step, setStep] = useState<Step>("phone");
  const [userId, setUserId] = useState<string | null>(null);

  // Phone step
  const [phone, setPhone] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpError, setOtpError] = useState("");

  // OTP step
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpVerifyError, setOtpVerifyError] = useState("");

  // ICE step
  const [fullName, setFullName] = useState("");
  const [iceName, setIceName] = useState("");
  const [icePhone, setIcePhone] = useState("");
  const [iceRelation, setIceRelation] = useState("");
  const [iceSaving, setIceSaving] = useState(false);

  // Waiver step
  const [waiverChecked, setWaiverChecked] = useState(false);
  const [waiverSaving, setWaiverSaving] = useState(false);

  useEffect(() => {
    async function loadClub() {
      const supabase = getSupabase();
      if (!supabase) { setClubLoading(false); return; }

      const { data } = await supabase
        .from("clubs")
        .select("id, name, slug, logo_url, description, city")
        .eq("slug", slug)
        .single();

      setClub(data);
      setClubLoading(false);
    }
    loadClub();
  }, [slug]);

  async function sendOtp() {
    setOtpError("");
    if (!phone.match(/^\+?[0-9\s\-]{8,15}$/)) {
      setOtpError("Numéro invalide. Format : +33 6 12 34 56 78");
      return;
    }
    setOtpSending(true);
    const supabase = getSupabase();
    if (!supabase) { setOtpSending(false); return; }

    const formatted = phone.replace(/[\s\-]/g, "").startsWith("+") ? phone.replace(/[\s\-]/g, "") : `+33${phone.replace(/[\s\-]/g, "").replace(/^0/, "")}`;

    const { error } = await supabase.auth.signInWithOtp({ phone: formatted });
    if (error) {
      setOtpError(error.message);
    } else {
      setPhone(formatted);
      setStep("otp");
    }
    setOtpSending(false);
  }

  async function verifyOtp() {
    setOtpVerifyError("");
    const code = otp.join("");
    if (code.length < 6) { setOtpVerifyError("Saisis les 6 chiffres."); return; }

    setOtpVerifying(true);
    const supabase = getSupabase();
    if (!supabase) { setOtpVerifying(false); return; }

    const { data, error } = await supabase.auth.verifyOtp({ phone, token: code, type: "sms" });
    if (error) {
      setOtpVerifyError("Code incorrect ou expiré. Réessaie.");
    } else if (data.user) {
      setUserId(data.user.id);

      // Check if already member
      const { data: membership } = await supabase
        .from("club_members")
        .select("id")
        .eq("club_id", club!.id)
        .eq("profile_id", data.user.id)
        .single();

      if (!membership) {
        // Auto-join the club
        await supabase.from("club_members").insert({
          club_id: club!.id,
          profile_id: data.user.id,
          role: "member",
        });
      }

      // Check if profile has name already
      const { data: prof } = await supabase.from("profiles").select("full_name").eq("id", data.user.id).single();
      if (prof?.full_name) setFullName(prof.full_name);

      setStep("ice");
    }
    setOtpVerifying(false);
  }

  function handleOtpInput(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  async function saveIce() {
    if (!iceName || !icePhone) return;
    setIceSaving(true);
    const supabase = getSupabase();
    if (!supabase || !userId) { setIceSaving(false); return; }

    await Promise.all([
      supabase.from("profiles").update({ full_name: fullName || null, phone }).eq("id", userId),
      supabase.from("ice_contacts").upsert({
        profile_id: userId,
        contact_name: iceName,
        contact_phone: icePhone,
        relationship: iceRelation || null,
      }, { onConflict: "profile_id" }),
    ]);

    setIceSaving(false);
    setStep("waiver");
  }

  async function signWaiver() {
    if (!waiverChecked || !club) return;
    setWaiverSaving(true);
    const supabase = getSupabase();
    if (!supabase || !userId) { setWaiverSaving(false); return; }

    const hash = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(`${userId}-${club.id}-${Date.now()}`)
    );
    const hashHex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");

    await supabase.from("waivers").upsert({
      profile_id: userId,
      club_id: club.id,
      signed_at: new Date().toISOString(),
      signature_hash: hashHex,
      ip_address: null,
    }, { onConflict: "profile_id,club_id" });

    // Create member_token for micro-page
    await supabase.from("member_tokens").upsert({ profile_id: userId }, { onConflict: "profile_id" });

    setWaiverSaving(false);
    setStep("success");
  }

  const stepIndex = STEPS.indexOf(step);

  if (clubLoading) {
    return (
      <div className="min-h-screen bg-[#F4F4EE] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#FF5500]" size={32} />
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-[#F4F4EE] flex flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-4xl">🤔</p>
        <h1 className="text-[22px] font-display font-black italic uppercase">Club introuvable</h1>
        <p className="text-[13px] text-[#666562]">Ce lien ne correspond à aucun club actif.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F4EE] flex flex-col">
      {/* Progress bar */}
      {step !== "success" && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-black/5 z-50">
          <motion.div
            className="h-full bg-[#FF5500]"
            initial={{ width: 0 }}
            animate={{ width: `${(stepIndex / (STEPS.length - 1)) * 100}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center p-6 pt-12">
        {/* Club header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 mb-10"
        >
          <div className="w-16 h-16 rounded-[20px] bg-white shadow-sm flex items-center justify-center overflow-hidden">
            {club.logo_url ? (
              <img src={club.logo_url} alt="" className="w-16 h-16 object-cover" />
            ) : (
              <span className="text-3xl">🏃</span>
            )}
          </div>
          <div className="text-center">
            <h1 className="text-[22px] font-display font-black italic uppercase text-black leading-none">
              {club.name}
            </h1>
            {club.city && <p className="text-[12px] text-[#A3A3A3] mt-0.5">{club.city}</p>}
          </div>
        </motion.div>

        <div className="w-full max-w-sm">
          <AnimatePresence mode="wait">

            {/* STEP: PHONE */}
            {step === "phone" && (
              <motion.div key="phone" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
                <div className="bg-white rounded-[28px] border border-black/5 p-8 space-y-6">
                  <div>
                    <div className="w-12 h-12 rounded-[16px] bg-[#FF5500]/10 flex items-center justify-center mb-4">
                      <Phone size={22} className="text-[#FF5500]" />
                    </div>
                    <h2 className="text-[22px] font-display font-black italic uppercase text-black leading-tight">
                      Ton numéro
                    </h2>
                    <p className="text-[13px] text-[#666562] mt-1">
                      On t'envoie un code SMS pour confirmer.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#666562]">
                      Numéro de téléphone
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendOtp()}
                      placeholder="+33 6 12 34 56 78"
                      autoFocus
                      className="w-full h-12 px-4 rounded-[14px] border border-[#E5E7EB] text-base font-medium focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/20 outline-none transition-all"
                    />
                    {otpError && <p className="text-[11px] text-[#EF4444] font-medium">{otpError}</p>}
                  </div>

                  <button
                    onClick={sendOtp}
                    disabled={!phone || otpSending}
                    className="w-full flex items-center justify-center gap-2 bg-[#FF5500] text-white h-12 rounded-full text-[12px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                  >
                    {otpSending ? <Loader2 size={16} className="animate-spin" /> : <>Envoyer le code <ArrowRight size={14} /></>}
                  </button>

                  <p className="text-[10px] text-[#A3A3A3] text-center">
                    En rejoignant, tu acceptes les CGU CAPTEN.
                  </p>
                </div>
              </motion.div>
            )}

            {/* STEP: OTP */}
            {step === "otp" && (
              <motion.div key="otp" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
                <div className="bg-white rounded-[28px] border border-black/5 p-8 space-y-6">
                  <div>
                    <button onClick={() => setStep("phone")} className="flex items-center gap-1 text-[#A3A3A3] hover:text-black transition-colors mb-4">
                      <ChevronLeft size={15} />
                      <span className="text-[11px] font-medium">Retour</span>
                    </button>
                    <h2 className="text-[22px] font-display font-black italic uppercase text-black">
                      Code SMS
                    </h2>
                    <p className="text-[13px] text-[#666562] mt-1">
                      Code envoyé au <strong>{phone}</strong>
                    </p>
                  </div>

                  <div className="flex gap-2 justify-between">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpInput(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className="w-11 h-14 text-center text-[22px] font-black rounded-[14px] border border-[#E5E7EB] focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/20 outline-none transition-all"
                      />
                    ))}
                  </div>

                  {otpVerifyError && (
                    <p className="text-[11px] text-[#EF4444] font-medium text-center">{otpVerifyError}</p>
                  )}

                  <button
                    onClick={verifyOtp}
                    disabled={otp.join("").length < 6 || otpVerifying}
                    className="w-full flex items-center justify-center gap-2 bg-[#FF5500] text-white h-12 rounded-full text-[12px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                  >
                    {otpVerifying ? <Loader2 size={16} className="animate-spin" /> : <>Confirmer <ArrowRight size={14} /></>}
                  </button>

                  <button
                    onClick={sendOtp}
                    className="w-full text-center text-[11px] text-[#A3A3A3] hover:text-black transition-colors"
                  >
                    Renvoyer le code
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP: ICE */}
            {step === "ice" && (
              <motion.div key="ice" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
                <div className="bg-white rounded-[28px] border border-black/5 p-8 space-y-5">
                  <div>
                    <div className="w-12 h-12 rounded-[16px] bg-[#DCFCE7] flex items-center justify-center mb-4">
                      <Shield size={22} className="text-[#22C55E]" />
                    </div>
                    <h2 className="text-[22px] font-display font-black italic uppercase text-black">
                      Ta sécurité
                    </h2>
                    <p className="text-[13px] text-[#666562] mt-1">
                      En cas d'urgence, qui contacter ?
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#666562]">Ton prénom + nom</label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Marie Dupont" className="w-full h-11 px-4 rounded-[12px] border border-[#E5E7EB] text-sm font-medium focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/20 outline-none transition-all" />
                  </div>

                  <div className="border-t border-[#E5E7EB] pt-4 space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#A3A3A3]">Contact d'urgence ICE</p>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#666562]">Nom</label>
                      <input type="text" value={iceName} onChange={(e) => setIceName(e.target.value)} placeholder="Pierre Dupont" className="w-full h-11 px-4 rounded-[12px] border border-[#E5E7EB] text-sm font-medium focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/20 outline-none transition-all" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#666562]">Téléphone</label>
                      <input type="tel" value={icePhone} onChange={(e) => setIcePhone(e.target.value)} placeholder="+33 6 xx xx xx xx" className="w-full h-11 px-4 rounded-[12px] border border-[#E5E7EB] text-sm font-medium focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/20 outline-none transition-all" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#666562]">Relation (optionnel)</label>
                      <input type="text" value={iceRelation} onChange={(e) => setIceRelation(e.target.value)} placeholder="Conjoint·e, parent, ami·e…" className="w-full h-11 px-4 rounded-[12px] border border-[#E5E7EB] text-sm font-medium focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/20 outline-none transition-all" />
                    </div>
                  </div>

                  <button
                    onClick={saveIce}
                    disabled={!iceName || !icePhone || iceSaving}
                    className="w-full flex items-center justify-center gap-2 bg-[#FF5500] text-white h-12 rounded-full text-[12px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                  >
                    {iceSaving ? <Loader2 size={16} className="animate-spin" /> : <>Suivant <ArrowRight size={14} /></>}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP: WAIVER */}
            {step === "waiver" && (
              <motion.div key="waiver" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
                <div className="bg-white rounded-[28px] border border-black/5 p-8 space-y-6">
                  <div>
                    <div className="w-12 h-12 rounded-[16px] bg-[#EDE9FE] flex items-center justify-center mb-4">
                      <FileText size={22} className="text-[#7C3AED]" />
                    </div>
                    <h2 className="text-[22px] font-display font-black italic uppercase text-black">
                      Décharge de responsabilité
                    </h2>
                  </div>

                  <div className="bg-[#F4F4EE] rounded-[16px] p-4 max-h-48 overflow-y-auto text-[12px] text-[#444] leading-relaxed">
                    <p className="font-bold mb-2">DÉCHARGE DE RESPONSABILITÉ — {club.name.toUpperCase()}</p>
                    <p>Je, soussigné·e, déclare participer aux activités sportives organisées par {club.name} en pleine connaissance des risques inhérents à la pratique du sport en plein air.</p>
                    <br />
                    <p>Je certifie être en bonne condition physique et médicale pour pratiquer ces activités. Je décharge {club.name} et ses organisateurs de toute responsabilité en cas d'accident, blessure ou dommage survenant lors des activités, sauf en cas de faute grave ou intentionnelle.</p>
                    <br />
                    <p>Je consens à ce que mes données personnelles soient utilisées dans le cadre des activités du club, conformément au RGPD.</p>
                    <br />
                    <p>Cette décharge a valeur de signature électronique et est horodatée.</p>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <div
                      className={`w-5 h-5 rounded-[6px] border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        waiverChecked ? "border-[#FF5500] bg-[#FF5500]" : "border-[#D1D5DB]"
                      }`}
                      onClick={() => setWaiverChecked(!waiverChecked)}
                    >
                      {waiverChecked && <CheckCircle2 size={12} className="text-white" />}
                    </div>
                    <p className="text-[12px] text-[#444] leading-snug">
                      Je reconnais avoir lu et accepté la décharge de responsabilité ci-dessus.
                    </p>
                  </label>

                  <button
                    onClick={signWaiver}
                    disabled={!waiverChecked || waiverSaving}
                    className="w-full flex items-center justify-center gap-2 bg-[#FF5500] text-white h-12 rounded-full text-[12px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                  >
                    {waiverSaving ? <Loader2 size={16} className="animate-spin" /> : <>Signer & Rejoindre <ArrowRight size={14} /></>}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP: SUCCESS */}
            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <div className="bg-white rounded-[28px] border border-black/5 p-8 text-center space-y-5">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20, delay: 0.1 }}
                    className="w-20 h-20 rounded-full bg-[#DCFCE7] flex items-center justify-center mx-auto"
                  >
                    <CheckCircle2 size={40} className="text-[#22C55E]" />
                  </motion.div>

                  <div>
                    <h2 className="text-[26px] font-display font-black italic uppercase text-black leading-tight">
                      Bienvenue dans<br />le crew !
                    </h2>
                    <p className="text-[13px] text-[#666562] mt-2">
                      Tu es officiellement membre de <strong>{club.name}</strong>.
                    </p>
                  </div>

                  <div className="bg-[#F4F4EE] rounded-[16px] p-4 text-left space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#A3A3A3]">
                      Prochaines étapes
                    </p>
                    {[
                      "📍 Check-in à ta prochaine sortie",
                      "🏅 Débloque ton 1er badge",
                      "💳 Profite des CAPTEN Spots",
                    ].map((item) => (
                      <p key={item} className="text-[12px] text-[#444]">{item}</p>
                    ))}
                  </div>

                  <p className="text-[11px] text-[#A3A3A3]">
                    Le lien vers ton espace membre t'a été envoyé par SMS.
                  </p>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
