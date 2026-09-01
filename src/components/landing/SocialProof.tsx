"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Percent, Unlock } from "lucide-react";

// ⚠️ Témoignages : NE JAMAIS en inventer (fausse preuve sociale = interdit).
// Remplir avec de VRAIS retours de capitaines pilotes (prénom, crew, ville).
// Tant que ce tableau est vide → on affiche uniquement des signaux de confiance
// FACTUELS (ci-dessous), zéro fausse citation.
const TESTIMONIALS: { quote: string; name: string; crew: string }[] = [];

const TRUST = [
  { icon: ShieldCheck, label: "Fait en France" },
  { icon: Lock, label: "Données hébergées en Europe · RGPD" },
  { icon: Percent, label: "0 % de commission sur tes cagnottes" },
  { icon: Unlock, label: "Sans engagement, résiliable en 1 clic" },
];

export function SocialProof() {
  return (
    <section className="px-5 bg-white">
      <div className="max-w-[1000px] mx-auto border-y border-[#EEEDE7] py-6">
        {TESTIMONIALS.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="rounded-2xl border border-[#EAE9E2] bg-[#FAFAF8] p-5">
                <blockquote className="text-[15px] text-[#1C1B18] leading-snug font-medium">« {t.quote} »</blockquote>
                <figcaption className="mt-3 text-[12px] text-[#8A8880]">
                  <span className="font-bold text-[#1C1B18]">{t.name}</span> — {t.crew}
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <motion.ul
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3"
          >
            {TRUST.map((t) => (
              <li key={t.label} className="inline-flex items-center gap-2 text-[13px] font-medium text-[#6B6A6A]">
                <t.icon className="w-4 h-4 text-[#FF5500] shrink-0" strokeWidth={2} />
                {t.label}
              </li>
            ))}
          </motion.ul>
        )}
      </div>
    </section>
  );
}
