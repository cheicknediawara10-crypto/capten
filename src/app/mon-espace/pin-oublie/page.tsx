"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function PinOubliePage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">

        {/* Logo */}
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
          <div className="w-12 h-12 rounded-2xl bg-[#FFF1EB] flex items-center justify-center mb-5 text-[#FF5500]">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight mb-2">
            Code PIN oublié ?
          </h1>

          <p className="text-sm text-[#6B7280] leading-relaxed mb-6">
            Par mesure de sécurité pour tes données de santé (fiche ICE) et pour éviter les frais SMS, la réinitialisation passe par l’organisateur de ton club.
          </p>

          <div className="space-y-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-4 mb-6 text-xs text-[#4B5563]">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
              <span>Contacte l'organisateur de ton Run Club sur WhatsApp ou Instagram.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
              <span>Il générera un PIN temporaire en 1 clic depuis son tableau de bord.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
              <span>Connecte-toi avec ce PIN pour définir ton nouveau code secret.</span>
            </div>
          </div>

          <div className="space-y-2.5">
            <a
              href="https://wa.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-12 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              Contacter l'organisateur sur WhatsApp
            </a>
          </div>
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
