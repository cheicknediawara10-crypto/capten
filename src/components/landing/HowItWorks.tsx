"use client";

import React from "react";
import { motion } from "framer-motion";
import { Settings2, Share2, MapPin } from "lucide-react";

const STEPS = [
  {
    n: "1",
    icon: Settings2,
    title: "Crée ton crew",
    desc: "Nomme ton club, ajoute ton logo. Prêt en 2 minutes, sans carte bancaire.",
  },
  {
    n: "2",
    icon: Share2,
    title: "Partage ton lien",
    desc: "Tes coureurs s'inscrivent en 20 secondes depuis ton lien — sans app, sans compte, et gratuit pour eux.",
  },
  {
    n: "3",
    icon: MapPin,
    title: "Ils pointent, tu gères",
    desc: "Check-in GPS au départ, registre horodaté automatique. Fini les appels au mégaphone et les coureurs fantômes.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 px-5 bg-white text-center" id="features">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
        className="max-w-[736px] mx-auto"
      >
        <p className="text-[#FF5500] mb-4 uppercase" style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.72px" }}>
          Comment ça marche
        </p>
        <h2 className="text-[#1C1B18] leading-[1.06] mb-4" style={{ fontSize: "40px", fontWeight: 1000, letterSpacing: "-1.6px" }}>
          Ton crew organisé en 3 étapes. Sans prise de tête.
        </h2>
      </motion.div>

      {/* 3 étapes */}
      <div className="max-w-[920px] mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 mt-12 text-left">
        {STEPS.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.1 }}
          >
            <div className="flex items-center gap-3 mb-3.5">
              <span className="w-9 h-9 rounded-full bg-[#FF5500] text-white flex items-center justify-center shrink-0" style={{ fontSize: "16px", fontWeight: 1000 }}>
                {s.n}
              </span>
              <s.icon className="w-5 h-5 text-[#FF5500]" strokeWidth={2} />
            </div>
            <h3 className="text-[#1C1B18] mb-2 leading-tight" style={{ fontSize: "20px", fontWeight: 1000, letterSpacing: "-0.6px" }}>
              {s.title}
            </h3>
            <p className="text-[#6B6A6A] leading-snug" style={{ fontSize: "16px", fontWeight: 500 }}>
              {s.desc}
            </p>
          </motion.div>
        ))}
      </div>

      {/* CTA + teaser prix (visible mid-page) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="mt-12 flex flex-col items-center gap-3"
      >
        <a
          href="/login?mode=signup"
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF5500] text-white hover:bg-[#E04B00] transition-colors"
          style={{ fontSize: "16px", fontWeight: 600, padding: "13px 28px" }}
        >
          Lancer mon crew →
        </a>
        <p className="text-[13px] font-medium text-[#8A8880]">
          Découverte gratuite · Captain Pro 29,99&nbsp;€/mois · 14 jours d&apos;essai sans carte
        </p>
      </motion.div>
    </section>
  );
}
