"use client";

import React, { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, AlertCircle, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import { resetPin } from "@/app/mon-espace/actions";

function PinBoxes({
  digits, setDigits, refs, show,
}: {
  digits: string[];
  setDigits: (d: string[]) => void;
  refs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  show: boolean;
}) {
  function handleInput(i: number, val: string) {
    if (!/^\d*$/.test(val)) return;
    const next = [...digits]; next[i] = val.slice(-1); setDigits(next);
    if (val && i < 3) refs.current[i + 1]?.focus();
  }
  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  }
  function handlePaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!text) return;
    const next = [...digits];
    text.split("").forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    refs.current[Math.min(text.length, 3)]?.focus();
    e.preventDefault();
  }
  return (
    <div className="flex gap-3 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type={show ? "text" : "password"}
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleInput(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="w-14 h-14 text-center text-xl font-extrabold border-2 border-[#E8E8E8] rounded-xl focus:border-[#FF5500] focus:outline-none transition-colors bg-[#FAFAF8] text-[#111111]"
        />
      ))}
    </div>
  );
}

export default function ResetPinPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();

  const [pin, setPin]             = useState(["", "", "", ""]);
  const [pinConfirm, setPinConfirm] = useState(["", "", "", ""]);
  const [showPin, setShowPin]     = useState(false);
  const [error, setError]         = useState("");
  const [done, setDone]           = useState(false);
  const [isPending, start]        = useTransition();

  const pinRefs  = useRef<(HTMLInputElement | null)[]>([]);
  const pinCRefs = useRef<(HTMLInputElement | null)[]>([]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const p = pin.join(""); const c = pinConfirm.join("");
    if (p.length < 4) { setError("Choisis un code PIN à 4 chiffres."); return; }
    if (p !== c) { setError("Les deux codes ne correspondent pas."); setPinConfirm(["","","",""]); pinCRefs.current[0]?.focus(); return; }

    start(async () => {
      const res = await resetPin(token, p);
      if ("error" in res) { setError(res.error); return; }
      setDone(true);
      setTimeout(() => router.push("/mon-espace/profil"), 2000);
    });
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">

        <div className="flex justify-center mb-10">
          <Link href="/">
            <img src="/logo.png" alt="CAPTEN" className="h-8 w-auto" />
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
          className="bg-white rounded-3xl border border-[#E8E8E8] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
        >
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#DCFCE7] flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-7 h-7 text-[#22C55E]" />
                </div>
                <h2 className="text-lg font-extrabold text-[#111111] mb-2">Code PIN mis à jour !</h2>
                <p className="text-sm text-[#6B7280]">
                  Tu vas être redirigé vers ton espace membre…
                </p>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="mb-7">
                  <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight mb-1">
                    Nouveau code PIN
                  </h1>
                  <p className="text-sm text-[#6B7280]">
                    Choisis un nouveau code PIN à 4 chiffres. Tu l&apos;utiliseras pour te connecter à ton espace.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                        Code PIN
                      </label>
                      <button type="button" onClick={() => setShowPin((s) => !s)}
                        className="flex items-center gap-1 text-[11px] text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
                        {showPin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        {showPin ? "Masquer" : "Afficher"}
                      </button>
                    </div>
                    <PinBoxes digits={pin} setDigits={setPin} refs={pinRefs} show={showPin} />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] block mb-3">
                      Confirme ton PIN
                    </label>
                    <PinBoxes digits={pinConfirm} setDigits={setPinConfirm} refs={pinCRefs} show={showPin} />
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3"
                      >
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-red-600 font-medium">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    disabled={isPending || pin.join("").length < 4}
                    className="w-full h-12 bg-[#FF5500] hover:bg-[#E04B00] disabled:opacity-50 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    {isPending
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : "Enregistrer mon nouveau PIN"
                    }
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {!done && (
          <div className="mt-5 text-center">
            <Link
              href="/mon-espace/pin-oublie"
              className="inline-flex items-center gap-1.5 text-xs text-[#9CA3AF] hover:text-[#FF5500] transition-colors font-medium"
            >
              <ArrowLeft className="w-3 h-3" />
              Nouvelle demande de lien
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
