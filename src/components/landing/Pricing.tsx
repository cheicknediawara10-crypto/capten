"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const STARTER = [
  "Jusqu'à 50 membres",
  "5 sorties / mois",
  "GPS Check-in",
  "Fiches ICE membres",
  "3 badges automatiques",
  "Dashboard basique",
];

const PRO = [
  "Membres illimités",
  "Sorties illimitées",
  "Tous les 6 badges",
  "CAPTEN Spots (cagnotte)",
  "Stats & analytics avancées",
  "Export CSV des présences",
  "QR code personnalisé",
  "Support prioritaire",
];

function CheckIcon({ color = "white" }: { color?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
      <circle cx="7" cy="7" r="6.5" stroke={color} strokeOpacity="0.25"/>
      <path d="M4.5 7L6.5 9L9.5 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function Pricing() {
  return (
    <section id="pricing" className="bg-[#0C0C0C] py-24 md:py-32 relative overflow-hidden">
      {/* Grain */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
        }}
      />

      {/* Orange glow on the right card */}
      <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FF5500] rounded-full opacity-[0.04] blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#FF5500] mb-4"
          >
            Tarifs
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: 0.05 }}
            className="font-display text-[clamp(40px,5.5vw,70px)] italic font-black uppercase text-white leading-[0.95] tracking-tighter"
          >
            SIMPLE.
            <br />
            <span className="text-white/20">TRANSPARENT.</span>
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4 max-w-[860px]">
          {/* Starter */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.25, 0, 0, 1] }}
            className="bg-white/[0.04] border border-white/10 rounded-[24px] p-8"
          >
            <div className="mb-8">
              <p className="text-[11px] font-mono text-white/30 uppercase tracking-widest mb-2">STARTER</p>
              <div className="flex items-end gap-2 mb-1">
                <span className="text-[52px] font-black italic text-white leading-none">0€</span>
                <span className="text-[13px] text-white/30 mb-2">/ mois</span>
              </div>
              <p className="text-[13px] text-white/40 font-medium">Pour commencer, sans risque.</p>
            </div>

            <ul className="space-y-3 mb-8">
              {STARTER.map((item) => (
                <li key={item} className="flex items-center gap-3 text-[13px] text-white/60 font-medium">
                  <CheckIcon color="white" />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/login"
              className="block text-center bg-white/8 hover:bg-white/14 text-white text-[13px] font-black uppercase tracking-wide rounded-[12px] px-5 py-3.5 transition-all duration-200 border border-white/10"
            >
              Commencer gratuitement
            </Link>
          </motion.div>

          {/* Pro */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.25, 0, 0, 1] }}
            className="bg-[#FF5500] border border-[#FF5500] rounded-[24px] p-8 relative overflow-hidden"
          >
            {/* Top badge */}
            <div className="absolute top-6 right-6 bg-black/15 text-black/70 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
              Recommandé
            </div>

            <div className="mb-8">
              <p className="text-[11px] font-mono text-black/50 uppercase tracking-widest mb-2">PRO</p>
              <div className="flex items-end gap-2 mb-1">
                <span className="text-[52px] font-black italic text-black leading-none">29€</span>
                <span className="text-[13px] text-black/50 mb-2">/ mois</span>
              </div>
              <p className="text-[13px] text-black/60 font-medium">Pour les organisateurs sérieux.</p>
            </div>

            <ul className="space-y-3 mb-8">
              {PRO.map((item) => (
                <li key={item} className="flex items-center gap-3 text-[13px] text-black/80 font-medium">
                  <CheckIcon color="black" />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/login"
              className="block text-center bg-black hover:bg-[#1A1918] text-white text-[13px] font-black uppercase tracking-wide rounded-[12px] px-5 py-3.5 transition-all duration-200"
            >
              Commencer — 14 jours offerts
            </Link>
          </motion.div>
        </div>

        {/* Footnote */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-[12px] text-white/25 font-mono"
        >
          Pas de CB requise pour le plan Starter · Annulation à tout moment · TVA incluse pour les comptes français
        </motion.p>
      </div>
    </section>
  );
}
