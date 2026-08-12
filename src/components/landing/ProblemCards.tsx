"use client";

import React from "react";
import { motion } from "framer-motion";
import { Siren, Scale } from "lucide-react";

const CARDS = [
  {
    icon: Siren,
    title: "Le cauchemar logistique",
    description:
      "Un malaise survient, tu perds de précieuses minutes : aucun accès centralisé aux fiches d'urgence ni aux contacts prioritaires de tes coureurs.",
  },
  {
    icon: Scale,
    title: "Le risque juridique",
    description:
      "Déplacer 40 personnes sur la voie publique sans liste d'émargement engage ta responsabilité. Ton crew a besoin d'un cadre officiel.",
  },
];

export function ProblemCards() {
  return (
    <section className="pb-16 px-5 bg-white">
      <div className="max-w-[1100px] mx-auto grid grid-cols-1 sm:grid-cols-2 gap-5">
        {CARDS.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.08 }}
            className="rounded-2xl border border-[#EAE9E2] bg-[#FAFAF8] p-7 sm:p-8"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#FF5500]/[0.08] flex items-center justify-center mb-5">
              <card.icon className="w-6 h-6 text-[#FF5500]" strokeWidth={2} />
            </div>
            <h3
              className="text-[#1C1B18] mb-2.5 leading-tight"
              style={{ fontSize: "24px", fontWeight: 1000, letterSpacing: "-0.8px" }}
            >
              {card.title}
            </h3>
            <p
              className="text-[#6B6A6A] leading-snug"
              style={{ fontSize: "16px", fontWeight: 500 }}
            >
              {card.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
