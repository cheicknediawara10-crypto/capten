"use client";

import { motion } from "framer-motion";

const TESTIMONIALS = [
  {
    quote: "En 2 semaines, j'ai réglé le problème des fiches ICE pour 120 coureurs. CAPTEN m'a sauvé d'une vraie galère administrative.",
    name: "Marine D.",
    role: "Fondatrice · Lyon Run Collective",
    members: "124 membres",
    avatar: "M",
    color: "#FF5500",
  },
  {
    quote: "Le QR code en live au départ de chaque trail, c'est juste magique. Plus de liste sur papier qui disparaît sous la pluie.",
    name: "Thomas B.",
    role: "Capitaine · Paris Trail Club",
    members: "87 membres",
    avatar: "T",
    color: "#6366F1",
  },
  {
    quote: "Les CAPTEN Spots rapportent 150€/mois à notre cagnotte. On a pu financer nos dossards de fin d'année. Incroyable.",
    name: "Léa M.",
    role: "Organisatrice · Run Social Bordeaux",
    members: "203 membres",
    avatar: "L",
    color: "#22C55E",
  },
];

export function Testimonials() {
  return (
    <section className="bg-[#F4F4EE] py-24 md:py-32 border-b border-[#1A1918]/8">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="mb-14">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#FF5500] mb-4"
          >
            Témoignages
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: 0.05 }}
            className="font-display text-[clamp(36px,5vw,64px)] italic font-black uppercase text-[#1A1918] leading-[0.95] tracking-tighter max-w-2xl"
          >
            ILS ONT LANCÉ.<br />
            <span className="text-[#1A1918]/20">ILS TÉMOIGNENT.</span>
          </motion.h2>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.25, 0, 0, 1] }}
              className="bg-white rounded-[20px] p-8 border border-[#1A1918]/8 shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.08)] transition-all duration-300"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <svg key={j} width="14" height="14" viewBox="0 0 14 14" fill={t.color}>
                    <path d="M7 1L8.5 5.5H13L9.25 8.25L10.5 13L7 10.5L3.5 13L4.75 8.25L1 5.5H5.5L7 1Z"/>
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="text-[15px] text-[#1A1918] leading-relaxed font-medium mb-8">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[13px] font-black shrink-0"
                  style={{ backgroundColor: t.color }}
                >
                  {t.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-[#1A1918]">{t.name}</p>
                  <p className="text-[11px] text-[#1A1918]/40 font-medium truncate">{t.role}</p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1A1918]/5 shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                  <span className="text-[9px] font-mono text-[#1A1918]/40">{t.members}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom social proof bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-center"
        >
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {["#FF5500", "#6366F1", "#22C55E", "#F59E0B", "#EC4899"].map((color, j) => (
                <div
                  key={j}
                  className="w-7 h-7 rounded-full border-2 border-[#F4F4EE] flex items-center justify-center text-[10px] text-white font-bold"
                  style={{ backgroundColor: color }}
                >
                  {["M", "T", "L", "A", "S"][j]}
                </div>
              ))}
            </div>
            <p className="text-[13px] text-[#1A1918]/50 font-medium">
              Rejoint par <span className="font-bold text-[#1A1918]">500+ organisateurs</span>
            </p>
          </div>
          <div className="w-px h-6 bg-[#1A1918]/10 hidden sm:block" />
          <div className="flex items-center gap-2">
            {Array.from({ length: 5 }).map((_, j) => (
              <svg key={j} width="14" height="14" viewBox="0 0 14 14" fill="#FF5500">
                <path d="M7 1L8.5 5.5H13L9.25 8.25L10.5 13L7 10.5L3.5 13L4.75 8.25L1 5.5H5.5L7 1Z"/>
              </svg>
            ))}
            <p className="text-[13px] text-[#1A1918]/50 font-medium ml-1">
              <span className="font-bold text-[#1A1918]">4.9 / 5</span> note moyenne
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
