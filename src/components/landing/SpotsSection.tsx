"use client";

import React from "react";
import { motion } from "framer-motion";

const SAMPLE_SPOTS = [
  {
    emoji: "☕",
    nom: "Le café du coin",
    mot: "Notre QG d'après-run",
    avantage: "🎁 -10% sur présentation de la page Capten",
  },
  {
    emoji: "👟",
    nom: "Ton shop running",
    mot: "Où on achète tous nos pompes",
    avantage: "🎁 Conseils perso pour les membres du crew",
  },
  {
    emoji: "🦵",
    nom: "Le kiné du quartier",
    mot: "Celui qui connaît tous nos bobos",
    avantage: "🎁 Créneaux prioritaires pour le crew",
  },
];

export function SpotsSection() {
  return (
    <section className="py-20 px-5 bg-[#FAFAF8] border-t border-b border-[#E8E8E8]">
      <div className="max-w-[1100px] mx-auto text-center">

        {/* Title & Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="mb-14 max-w-2xl mx-auto"
        >
          <h2
            className="text-[#111111] leading-tight mb-3 italic uppercase font-black tracking-tight"
            style={{ fontSize: "clamp(36px, 5vw, 48px)" }}
          >
            LES SPOTS DU CREW
          </h2>
          <p
            className="text-[#6B7280] leading-snug"
            style={{ fontSize: "18px", fontWeight: 500 }}
          >
            Le café d&apos;après-run, le shop, le kiné — le territoire de ton crew
          </p>
        </motion.div>

        {/* 3 Sample Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10">
          {SAMPLE_SPOTS.map((spot, i) => (
            <motion.div
              key={spot.nom}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-white rounded-2xl border border-[#E8E8E8] p-6 text-left flex flex-col justify-between hover:border-[#D0D0D0] hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all"
            >
              <div>
                <div className="text-3xl mb-3">{spot.emoji}</div>
                <h3 className="font-extrabold text-base text-[#111111] mb-1">
                  {spot.nom}
                </h3>
                <p className="text-xs text-[#6B7280] italic mb-4">
                  « {spot.mot} »
                </p>
              </div>
              <div className="mt-auto">
                <span className="inline-block bg-[#FF5C00] text-white text-[11px] font-bold px-3 py-1.5 rounded-full leading-snug">
                  {spot.avantage}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Disclaimer Line */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-xs text-[#9CA3AF] font-medium"
        >
          Zéro paiement, zéro commission — juste les bonnes adresses de ton crew.
        </motion.p>

      </div>
    </section>
  );
}
