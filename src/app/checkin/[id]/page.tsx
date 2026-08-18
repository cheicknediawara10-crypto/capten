"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, QrCode, Loader2, CheckCircle2, XCircle, Wifi, ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";
import { getCheckinContext, submitCheckin, type CheckinContext } from "../actions";
import { loginMembre } from "@/app/mon-espace/actions";

const Html5QrcodeScanner = dynamic(
  () => import("@/components/checkin/QrScanner"),
  { ssr: false, loading: () => <div className="h-64 bg-white/5 rounded-[20px] animate-pulse" /> }
);

type CheckinState = "idle" | "identify" | "locating" | "scanning" | "submitting" | "success" | "out_of_range" | "error";

export default function CheckinPage() {
  const { id } = useParams<{ id: string }>();
  const [ctx, setCtx] = useState<CheckinContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [state, setState] = useState<CheckinState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [pending, setPending] = useState<null | "gps" | "qr">(null);

  useEffect(() => {
    (async () => {
      const res = await getCheckinContext(id);
      if ("error" in res) { setNotFound(true); setLoading(false); return; }
      setCtx(res);
      setLoading(false);
    })();
  }, [id]);

  const membreName = ctx?.membreName ?? null;
  const identified = !!ctx?.membreId;
  const gpsEnabled = ctx?.gpsEnabled ?? false;
  const title = ctx?.event.title ?? "";

  function handleResult(r: Awaited<ReturnType<typeof submitCheckin>>) {
    switch (r.status) {
      case "success": setState("success"); break;
      case "out_of_range": setState("out_of_range"); break;
      case "need_login": setState("identify"); break;
      case "not_member":
        setState("error");
        setErrorMsg("Tu n'es pas encore inscrit dans ce crew. Rejoins-le via le lien de ton organisateur, puis reviens pointer.");
        break;
      default:
        setState("error");
        setErrorMsg(r.message || "Une erreur est survenue.");
    }
  }

  // Lance une action : identifie d'abord si besoin, sinon exécute.
  function start(method: "gps" | "qr") {
    if (!identified) { setPending(method); setState("identify"); return; }
    if (method === "gps") gpsCheckin();
    else setState("scanning");
  }

  async function afterIdentified(method: "gps" | "qr" | null) {
    const res = await getCheckinContext(id);
    if (!("error" in res)) setCtx(res);
    if (method === "gps") gpsCheckin();
    else if (method === "qr") setState("scanning");
    else setState("idle");
  }

  async function gpsCheckin() {
    if (!navigator.geolocation) {
      setState("error");
      setErrorMsg("La géolocalisation n'est pas disponible sur cet appareil.");
      return;
    }
    setState("locating");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setState("submitting");
        const r = await submitCheckin({ eventId: id, method: "gps", lat: pos.coords.latitude, lng: pos.coords.longitude });
        handleResult(r);
      },
      () => {
        setState("error");
        setErrorMsg("Impossible d'obtenir ta position. Autorise la géolocalisation.");
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  async function handleQrScan(result: string) {
    if (result.includes(id)) {
      setState("submitting");
      const r = await submitCheckin({ eventId: id, method: "qr" });
      handleResult(r);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1D1D1D] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#FF5500]" size={32} />
      </div>
    );
  }

  if (notFound || !ctx) {
    return (
      <div className="min-h-screen bg-[#1D1D1D] flex flex-col items-center justify-center gap-4 p-8 text-center">
        <XCircle size={48} className="text-[#EF4444]" />
        <p className="text-white text-[16px] font-black uppercase">Run introuvable</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1D1D1D] flex flex-col items-center justify-center p-6">
      <AnimatePresence mode="wait">

        {/* SUCCESS */}
        {state === "success" && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} transition={{ duration: 0.5, delay: 0.1 }} className="w-28 h-28 rounded-full bg-[#22C55E]/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={56} className="text-[#22C55E]" />
            </motion.div>
            <h1 className="text-[36px] font-display font-black italic uppercase text-white leading-tight">Check-in<br />validé !</h1>
            <p className="text-[#A3A3A3] text-[14px] mt-3">{title}</p>
            {membreName && <p className="text-[#22C55E] text-[13px] font-bold mt-1">{membreName}, tu es pointé ✓</p>}
            <div className="relative w-32 h-32 mx-auto mt-8">
              {[1, 2, 3].map((i) => (
                <motion.div key={i} className="absolute inset-0 rounded-full border border-[#22C55E]/30" initial={{ scale: 1, opacity: 0.6 }} animate={{ scale: 2 + i * 0.5, opacity: 0 }} transition={{ duration: 2, delay: i * 0.4, repeat: Infinity }} />
              ))}
              <div className="absolute inset-0 rounded-full bg-[#22C55E]/10 flex items-center justify-center">
                <MapPin size={28} className="text-[#22C55E]" />
              </div>
            </div>
          </motion.div>
        )}

        {/* OUT OF RANGE */}
        {state === "out_of_range" && (
          <motion.div key="range" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="w-24 h-24 rounded-full bg-[#F59E0B]/20 flex items-center justify-center mx-auto mb-6">
              <MapPin size={48} className="text-[#F59E0B]" />
            </div>
            <h1 className="text-[28px] font-display font-black italic uppercase text-white">Trop loin du point RDV</h1>
            <p className="text-[#A3A3A3] text-[13px] mt-2 max-w-xs mx-auto">
              Rapproche-toi du point de rendez-vous (rayon : {ctx.event.checkin_radius_meters}m) ou utilise le QR Code.
            </p>
            <button onClick={() => setState("scanning")} className="mt-6 flex items-center gap-2 mx-auto px-6 py-3 rounded-full border border-white/20 text-white text-[12px] font-black uppercase tracking-widest hover:border-white transition-all">
              <QrCode size={14} /> Scanner le QR Code
            </button>
          </motion.div>
        )}

        {/* ERROR */}
        {state === "error" && (
          <motion.div key="error" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <XCircle size={56} className="text-[#EF4444] mx-auto mb-4" />
            <h1 className="text-[24px] font-display font-black italic uppercase text-white">Oups</h1>
            <p className="text-[#A3A3A3] text-[13px] mt-2 max-w-xs mx-auto">{errorMsg}</p>
            <button onClick={() => setState("idle")} className="mt-6 px-6 py-3 rounded-full border border-white/20 text-white text-[12px] font-black uppercase tracking-widest hover:border-white transition-all">
              Réessayer
            </button>
          </motion.div>
        )}

        {/* LOCATING */}
        {state === "locating" && (
          <motion.div key="locating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-6">
              {[1, 2, 3].map((i) => (
                <motion.div key={i} className="absolute inset-0 rounded-full border border-[#FF5500]/40" initial={{ scale: 1, opacity: 0.8 }} animate={{ scale: 1.5 + i * 0.5, opacity: 0 }} transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity }} />
              ))}
              <div className="absolute inset-0 rounded-full bg-[#FF5500]/20 flex items-center justify-center">
                <MapPin size={32} className="text-[#FF5500]" />
              </div>
            </div>
            <h1 className="text-[22px] font-display font-black italic uppercase text-white">Localisation en cours…</h1>
            <p className="text-[#A3A3A3] text-[13px] mt-2">Reste immobile quelques secondes.</p>
          </motion.div>
        )}

        {/* SUBMITTING */}
        {state === "submitting" && (
          <motion.div key="submitting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <Loader2 size={48} className="animate-spin text-[#FF5500] mx-auto mb-4" />
            <p className="text-white text-[16px] font-black uppercase">Enregistrement…</p>
          </motion.div>
        )}

        {/* IDENTIFY — connexion membre par PIN */}
        {state === "identify" && (
          <IdentifyForm
            onCancel={() => setState("idle")}
            onSuccess={() => { const m = pending; setPending(null); afterIdentified(m); }}
          />
        )}

        {/* QR SCANNING */}
        {state === "scanning" && (
          <motion.div key="scanning" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
            <h1 className="text-[22px] font-display font-black italic uppercase text-white mb-4 text-center">Scanner le QR Code</h1>
            <Html5QrcodeScanner onScan={handleQrScan} />
            <button onClick={() => setState("idle")} className="w-full mt-4 py-3 rounded-full border border-white/20 text-white text-[12px] font-black uppercase tracking-widest hover:border-white transition-all">
              Annuler
            </button>
          </motion.div>
        )}

        {/* IDLE */}
        {state === "idle" && (
          <motion.div key="idle" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm text-center">
            <div className="mb-8">
              <Wifi size={40} className="text-[#FF5500] mx-auto mb-4" />
              <h1 className="text-[28px] font-display font-black italic uppercase text-white leading-tight">Check-in</h1>
              <p className="text-[#A3A3A3] text-[14px] mt-2">{title}</p>
              {membreName && <p className="text-[#FF5500] text-[13px] font-bold mt-1">Salut {membreName.split(" ")[0]} 👋</p>}
            </div>

            <div className="space-y-3">
              {gpsEnabled && (
                <button onClick={() => start("gps")} className="w-full flex items-center justify-center gap-3 bg-[#FF5500] text-white h-14 rounded-full text-[13px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all active:scale-95">
                  <MapPin size={18} /> Check-in par GPS
                </button>
              )}
              <button onClick={() => start("qr")} className={`w-full flex items-center justify-center gap-3 h-14 rounded-full text-[13px] font-black uppercase tracking-widest transition-all active:scale-95 ${gpsEnabled ? "border border-white/20 text-white hover:border-white hover:bg-white/5" : "bg-[#FF5500] text-white hover:bg-white hover:text-black"}`}>
                <QrCode size={18} /> Scanner le QR Code
              </button>
            </div>

            <p className="text-[10px] text-[#555555] mt-6">
              {identified
                ? (gpsEnabled ? "Le GPS est recommandé. Le QR Code est disponible auprès de l'organisateur." : "Scanne le QR Code affiché par ton organisateur pour valider ta présence.")
                : "On te demandera juste ton nom, ta date de naissance et ton code PIN pour t'identifier."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Mini-formulaire d'identification (Nom + DDN + PIN) ───────────────────────
function IdentifyForm({ onCancel, onSuccess }: { onCancel: () => void; onSuccess: () => void }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [pin, setPin] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!firstName.trim() || !lastName.trim() || !dob || pin.length !== 4) {
      setError("Renseigne ton prénom, ton nom, ta date de naissance et ton PIN à 4 chiffres.");
      return;
    }
    setError(""); setSaving(true);
    const res = await loginMembre({ first_name: firstName, last_name: lastName, date_of_birth: dob, pin });
    setSaving(false);
    if ("error" in res) { setError(res.error); return; }
    onSuccess();
  }

  const input = "w-full h-12 px-4 rounded-[14px] bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/20 outline-none transition-all";

  return (
    <motion.div key="identify" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
      <h1 className="text-[24px] font-display font-black italic uppercase text-white text-center leading-tight">C'est toi ?</h1>
      <p className="text-[#A3A3A3] text-[13px] mt-2 mb-6 text-center">Identifie-toi pour valider ta présence.</p>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Prénom" autoComplete="given-name" className={input} />
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Nom" autoComplete="family-name" className={input} />
        </div>
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-1.5">Date de naissance</label>
          <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} max={new Date().toISOString().split("T")[0]} style={{ colorScheme: "dark" }} className={input} />
        </div>
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-white/50 mb-1.5">Code PIN</label>
          <input value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" placeholder="• • • •" className={`${input} text-center tracking-[0.5em] font-bold`} />
          <div className="text-right mt-2">
            <a href="/mon-espace/pin-oublie" className="text-[12px] font-semibold text-white/45 hover:text-[#FF5500] transition-colors">
              J&apos;ai oublié mon PIN
            </a>
          </div>
        </div>
      </div>

      {error && <p className="text-[#EF4444] text-[12px] mt-3 text-center">{error}</p>}

      <button onClick={submit} disabled={saving} className="w-full mt-5 flex items-center justify-center gap-2 bg-[#FF5500] text-white h-14 rounded-full text-[13px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all active:scale-95 disabled:opacity-50">
        {saving ? <Loader2 size={16} className="animate-spin" /> : <>Valider <ArrowRight size={16} /></>}
      </button>
      <button onClick={onCancel} className="w-full mt-3 py-3 text-white/50 text-[12px] font-bold uppercase tracking-widest hover:text-white transition-colors">
        Annuler
      </button>
    </motion.div>
  );
}
