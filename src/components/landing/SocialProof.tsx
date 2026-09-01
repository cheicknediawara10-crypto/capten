"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Percent, Unlock, Instagram } from "lucide-react";

// ⚠️ Témoignages : uniquement de VRAIS retours de capitaines (jamais inventés).
// Chaque citation doit être validée par la personne avant mise en ligne publique.
const TESTIMONIALS: { quote: string; name: string; crew: string; instagram?: string }[] = [
  {
    quote:
      "Mon crew est 100 % filles, et on se retrouve parfois à plus de 100 au départ. Capten, c'est exactement ce qu'il me faut pour gérer tout ce monde sans y passer mes soirées.",
    name: "Sasaa",
    crew: "Coach & fondatrice d'un run club 100 % filles",
    instagram: "https://www.instagram.com/coachsasaa",
  },
];

function igHandle(url: string) {
  try { return "@" + new URL(url).pathname.replace(/\//g, ""); } catch { return ""; }
}

const TRUST = [
  { icon: ShieldCheck, label: "Fait en France" },
  { icon: Lock, label: "Données hébergées en Europe · RGPD" },
  { icon: Percent, label: "0 % de commission sur tes cagnottes" },
  { icon: Unlock, label: "Sans engagement, résiliable en 1 clic" },
];

function initials(name: string) {
  return name.trim().slice(0, 2).toUpperCase();
}

export function SocialProof() {
  const hasTestimonials = TESTIMONIALS.length > 0;
  const single = TESTIMONIALS.length === 1;

  return (
    <section className="py-10 px-5 bg-white">
      <div className="max-w-[1000px] mx-auto space-y-7">
        {hasTestimonials && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={`grid gap-5 ${single ? "grid-cols-1 max-w-2xl mx-auto" : "grid-cols-1 sm:grid-cols-3"}`}
          >
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.name}
                className="rounded-2xl border border-[#EAE9E2] bg-[#FAFAF8] p-6 sm:p-7 text-center"
              >
                <blockquote className="text-[#1C1B18] leading-snug font-medium" style={{ fontSize: single ? "19px" : "15px" }}>
                  « {t.quote} »
                </blockquote>
                <figcaption className="mt-5 flex items-center justify-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-[#FF5500]/[0.12] text-[#FF5500] flex items-center justify-center shrink-0" style={{ fontSize: "14px", fontWeight: 1000 }}>
                    {initials(t.name)}
                  </span>
                  <span className="text-left leading-tight">
                    <span className="block text-[14px] font-extrabold text-[#1C1B18]">{t.name}</span>
                    <span className="block text-[12px] text-[#8A8880]">{t.crew}</span>
                    {t.instagram && (
                      <a
                        href={t.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-1 text-[12px] font-semibold text-[#FF5500] hover:underline"
                      >
                        <Instagram className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                        {igHandle(t.instagram)}
                      </a>
                    )}
                  </span>
                </figcaption>
              </figure>
            ))}
          </motion.div>
        )}

        {/* Signaux de confiance factuels — toujours affichés */}
        <motion.ul
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className={`flex flex-wrap items-center justify-center gap-x-7 gap-y-3 ${hasTestimonials ? "border-t border-[#EEEDE7] pt-7" : "border-y border-[#EEEDE7] py-6"}`}
        >
          {TRUST.map((t) => (
            <li key={t.label} className="inline-flex items-center gap-2 text-[13px] font-medium text-[#6B6A6A]">
              <t.icon className="w-4 h-4 text-[#FF5500] shrink-0" strokeWidth={2} />
              {t.label}
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
