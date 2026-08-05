"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="bg-[#FF5500] py-24 md:py-36 relative overflow-hidden">
      {/* Decorative large type in background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
        <span
          className="font-display italic font-black uppercase text-black/[0.04] whitespace-nowrap"
          style={{ fontSize: "clamp(100px, 20vw, 260px)", lineHeight: 1, letterSpacing: "-0.04em" }}
        >
          CAPTEN
        </span>
      </div>

      <div className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-8 text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="text-[11px] font-mono uppercase tracking-[0.2em] text-black/40 mb-6"
        >
          Prêt à courir plus loin ?
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ delay: 0.05, duration: 0.6, ease: [0.25, 0, 0, 1] }}
          className="font-display text-[clamp(44px,7.5vw,100px)] italic font-black uppercase text-black leading-[0.9] tracking-tighter mb-6"
        >
          STOP AUX<br />
          TABLEURS.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ delay: 0.15 }}
          className="text-[16px] sm:text-[18px] text-black/60 font-medium max-w-[480px] mx-auto mb-10"
        >
          Rejoins 500+ organisateurs qui ont dit stop aux tableurs et aux nuits à gérer des listes.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-black hover:bg-[#1A1918] text-white text-[14px] font-black uppercase tracking-wide rounded-[12px] px-8 py-4 transition-all duration-200 hover:scale-[1.02]"
          >
            Créer mon club maintenant
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <p className="text-[12px] text-black/45 font-mono">
            Gratuit · Pas de CB · En ligne en 2 min
          </p>
        </motion.div>
      </div>
    </section>
  );
}
