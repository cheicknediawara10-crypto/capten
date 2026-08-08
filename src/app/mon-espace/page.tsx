"use client";

import React, { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { loginMembre } from "./actions";

export default function MonEspacePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [dob, setDob]             = useState("");
  const [pin, setPin]             = useState(["", "", "", ""]);
  const [showPin, setShowPin]     = useState(false);
  const [error, setError]         = useState("");
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);

  function handlePinInput(i: number, val: string) {
    if (!/^\d*$/.test(val)) return;
    const next = [...pin];
    next[i] = val.slice(-1);
    setPin(next);
    if (val && i < 3) pinRefs.current[i + 1]?.focus();
  }

  function handlePinKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !pin[i] && i > 0) {
      pinRefs.current[i - 1]?.focus();
    }
  }

  function handlePinPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    const next = ["", "", "", ""];
    digits.split("").forEach((d, i) => { next[i] = d; });
    setPin(next);
    pinRefs.current[Math.min(digits.length, 3)]?.focus();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const pinStr = pin.join("");
    if (!firstName || !lastName || !dob || pinStr.length < 4) {
      setError("Remplis tous les champs pour continuer.");
      return;
    }
    startTransition(async () => {
      const res = await loginMembre({
        first_name: firstName,
        last_name: lastName,
        date_of_birth: dob,
        pin: pinStr,
      });
      if ("error" in res) {
        setError(res.error);
        setPin(["", "", "", ""]);
        pinRefs.current[0]?.focus();
      } else {
        router.push("/mon-espace/profil");
      }
    });
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Link href="/">
            <img src="/logo.png" alt="CAPTEN" className="h-8 w-auto" />
          </Link>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
          className="bg-white rounded-3xl border border-[#E8E8E8] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
        >
          <div className="mb-7">
            <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight mb-1">
              Mon espace membre
            </h1>
            <p className="text-sm text-[#6B7280]">
              Identifie-toi pour accéder à ta page.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Prénom + Nom */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] block mb-1.5">
                  Prénom
                </label>
                <input
                  type="text"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ahmed"
                  className="capten-input"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] block mb-1.5">
                  Nom
                </label>
                <input
                  type="text"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Diallo"
                  className="capten-input"
                  required
                />
              </div>
            </div>

            {/* Date de naissance */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] block mb-1.5">
                Date de naissance
              </label>
              <input
                type="date"
                autoComplete="bday"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="capten-input"
                required
              />
            </div>

            {/* PIN */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                  Code PIN
                </label>
                <button
                  type="button"
                  onClick={() => setShowPin((s) => !s)}
                  className="flex items-center gap-1 text-[11px] text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
                >
                  {showPin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {showPin ? "Masquer" : "Afficher"}
                </button>
              </div>
              <div className="flex gap-3" onPaste={handlePinPaste}>
                {pin.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => { pinRefs.current[i] = el; }}
                    type={showPin ? "text" : "password"}
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handlePinInput(i, e.target.value)}
                    onKeyDown={(e) => handlePinKeyDown(i, e)}
                    className="w-full h-14 text-center text-xl font-bold border border-[#E8E8E8] rounded-xl bg-[#F5F5F3] text-[#111111] focus:outline-none focus:border-[#FF5500] focus:ring-2 focus:ring-[#FF5500]/10 focus:bg-white transition-all"
                    required
                  />
                ))}
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3"
                >
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600 font-medium leading-snug">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full h-12 bg-[#FF5500] hover:bg-[#E04B00] disabled:opacity-60 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors shadow-[0_4px_14px_rgba(255,85,0,0.25)] hover:shadow-[0_6px_20px_rgba(255,85,0,0.35)] cursor-pointer"
            >
              {isPending
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <>Accéder à mon espace <ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </form>
        </motion.div>

        {/* Links */}
        <div className="mt-5 text-center space-y-3">
          <Link
            href="/mon-espace/pin-oublie"
            className="block text-xs text-[#9CA3AF] hover:text-[#FF5500] transition-colors font-medium"
          >
            Code PIN oublié ?
          </Link>
          <p className="text-xs text-[#9CA3AF]">
            Pas encore membre ?{" "}
            <span className="text-[#6B7280]">
              Demande le lien d'inscription à ton organisateur.
            </span>
          </p>
        </div>

      </div>
    </div>
  );
}
