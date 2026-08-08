"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { requestPinReset } from "@/app/mon-espace/actions";

export default function PinOubliePage() {
  const [email, setEmail]   = useState("");
  const [sent, setSent]     = useState(false);
  const [error, setError]   = useState("");
  const [isPending, start]  = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const clean = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setError("Adresse e-mail invalide.");
      return;
    }
    start(async () => {
      const res = await requestPinReset(clean);
      if ("error" in res) { setError(res.error); return; }
      setSent(true);
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
            {!sent ? (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="mb-7">
                  <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight mb-1">
                    Code PIN oublié
                  </h1>
                  <p className="text-sm text-[#6B7280]">
                    Saisis l&apos;adresse e-mail utilisée lors de ton inscription. Tu recevras un lien magique valable 15 minutes.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#9CA3AF] block mb-1.5">
                      Adresse e-mail
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                      <input
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ahmed@exemple.fr"
                        className="capten-input pl-10"
                        required
                      />
                    </div>
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
                    disabled={isPending}
                    className="w-full h-12 bg-[#FF5500] hover:bg-[#E04B00] disabled:opacity-60 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    {isPending
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : "Recevoir le lien magique"
                    }
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#DCFCE7] flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-7 h-7 text-[#22C55E]" />
                </div>
                <h2 className="text-lg font-extrabold text-[#111111] mb-2">E-mail envoyé !</h2>
                <p className="text-sm text-[#6B7280] leading-relaxed">
                  Si cette adresse correspond à un compte membre, tu vas recevoir un e-mail avec un lien valable <strong>15 minutes</strong>.
                </p>
                <p className="text-xs text-[#9CA3AF] mt-3">
                  Pense à vérifier tes spams.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="mt-5 text-center">
          <Link
            href="/mon-espace"
            className="inline-flex items-center gap-1.5 text-xs text-[#9CA3AF] hover:text-[#FF5500] transition-colors font-medium"
          >
            <ArrowLeft className="w-3 h-3" />
            Retour à la connexion
          </Link>
        </div>

      </div>
    </div>
  );
}
