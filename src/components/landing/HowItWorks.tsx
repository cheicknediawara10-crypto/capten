"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const STEPS = [
  {
    number: "01",
    emoji: "⚡",
    title: "Crée ton club",
    body: "Inscris-toi en 2 minutes. Nomme ton club, configure ton premier run. Ton lien d'invitation est prêt.",
    time: "2 min",
  },
  {
    number: "02",
    emoji: "📲",
    title: "Invite ton crew",
    body: "Partage le lien — sur WhatsApp, Instagram, où tu veux. Tes membres rejoignent en autonomie, renseignent leur fiche ICE, signent la décharge numérique.",
    time: "30 sec par membre",
  },
  {
    number: "03",
    emoji: "🏃",
    title: "Lance ta sortie",
    body: "Le jour J, tes membres check-inent par GPS. Les badges se débloquent automatiquement. Tu regardes les stats en live. Tu cours.",
    time: "Temps réel",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="bg-[#0C0C0C] py-24 md:py-32 relative overflow-hidden">
      {/* Grain */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
        }}
      />

      <div className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="mb-20 lg:mb-28">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#FF5500] mb-4"
          >
            Comment ça marche
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: 0.05 }}
            className="font-display text-[clamp(40px,5.5vw,72px)] italic font-black uppercase text-white leading-[0.95] tracking-tighter"
          >
            3 ÉTAPES.
            <br />
            <span className="text-white/20">C&apos;EST TOUT.</span>
          </motion.h2>
        </div>

        {/* Steps */}
        <div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-12 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-12 left-[calc(33.33%+2rem)] right-[calc(33.33%+2rem)] h-px bg-gradient-to-r from-white/10 via-[#FF5500]/40 to-white/10" />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: [0.25, 0, 0, 1] }}
              className="relative"
            >
              {/* Number + Emoji */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-white/[0.04] border border-white/10 rounded-[20px] flex flex-col items-center justify-center shrink-0">
                  <span className="text-[28px] leading-none">{step.emoji}</span>
                  <span className="text-[10px] font-mono text-white/25 mt-1">{step.number}</span>
                </div>
                <div className="flex-1 h-px bg-white/8 lg:hidden" />
              </div>

              <h3 className="text-[20px] font-bold text-white mb-3">{step.title}</h3>
              <p className="text-[14px] text-white/45 leading-relaxed font-medium mb-5">{step.body}</p>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/8">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF5500]" />
                <span className="text-[10px] font-mono text-white/40">{step.time}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-20 lg:mt-24 pt-12 border-t border-white/8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
        >
          <p className="text-[17px] text-white/50 font-medium max-w-md">
            Premier run organisé en moins de 5 minutes, chrono.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-white hover:bg-[#FF5500] text-black text-[13px] font-black uppercase tracking-wide rounded-[10px] px-6 py-3.5 transition-all duration-200 hover:scale-[1.02] whitespace-nowrap"
          >
            Lancer mon crew
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M2 9L9 2M9 2H3.5M9 2V7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
