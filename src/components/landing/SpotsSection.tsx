"use client";

import React from "react";
import { motion } from "framer-motion";
import { Coffee, Footprints, Activity, Gift, ShieldCheck } from "lucide-react";

const SAMPLE_SPOTS = [
  {
    Icon: Coffee,
    categorie: "Café",
    nom: "Le café du coin",
    mot: "Notre QG d'après-run",
    avantage: "-10% sur présentation de la page Capten",
  },
  {
    Icon: Footprints,
    categorie: "Shop running",
    nom: "Ton shop running",
    mot: "Où on achète tous nos pompes",
    avantage: "Conseils perso pour les membres du crew",
  },
  {
    Icon: Activity,
    categorie: "Kiné",
    nom: "Le kiné du quartier",
    mot: "Celui qui connaît tous nos bobos",
    avantage: "Créneaux prioritaires pour le crew",
  },
];

export function SpotsSection() {
  return (
    <section className="relative py-24 px-5 bg-[#FAFAF8] border-t border-b border-[#E8E8E8] overflow-hidden">
      {/* Faint map-dot texture — evokes "territoire" without gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage: "radial-gradient(#E4E3DC 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, #000 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, #000 30%, transparent 75%)",
        }}
      />

      <div className="relative max-w-[1100px] mx-auto text-center">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="mb-14 max-w-2xl mx-auto"
        >
          <p
            className="text-[#FF5500] mb-4 uppercase"
            style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.9px" }}
          >
            Recommandé par ton crew
          </p>
          <h2
            className="text-[#1C1B18] leading-[1.05] mb-4"
            style={{ fontSize: "clamp(32px, 5vw, 44px)", fontWeight: 1000, letterSpacing: "-1.6px" }}
          >
            Les Spots du Crew
          </h2>
          <p
            className="text-[#6B6A6A] leading-snug"
            style={{ fontSize: "19px", fontWeight: 500, letterSpacing: "-0.4px" }}
          >
            Le café d&apos;après-run, le shop, le kiné — le territoire de ton crew.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-[960px] mx-auto">
          {SAMPLE_SPOTS.map((spot, i) => (
            <motion.div
              key={spot.nom}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.09 }}
              className="group bg-white rounded-[22px] border border-[#EAE9E2] p-6 text-left flex flex-col hover:border-[#D8D6CC] hover:-translate-y-1 hover:shadow-[0_16px_40px_-12px_rgba(28,27,24,0.12)] transition-all duration-300"
            >
              {/* Top: icon tile + category chip */}
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-[16px] bg-[#FF5500]/[0.08] flex items-center justify-center group-hover:bg-[#FF5500]/[0.14] transition-colors">
                  <spot.Icon className="w-[22px] h-[22px] text-[#FF5500]" strokeWidth={2} />
                </div>
                <span
                  className="text-[#A3A19A] uppercase"
                  style={{ fontSize: "10.5px", fontWeight: 700, letterSpacing: "1px" }}
                >
                  {spot.categorie}
                </span>
              </div>

              {/* Name + founder note */}
              <h3
                className="text-[#1C1B18] leading-tight mb-1.5"
                style={{ fontSize: "19px", fontWeight: 800, letterSpacing: "-0.5px" }}
              >
                {spot.nom}
              </h3>
              <p
                className="text-[#8A8880] italic leading-snug"
                style={{ fontSize: "13.5px", fontWeight: 500 }}
              >
                « {spot.mot} »
              </p>

              {/* Divider */}
              <div className="h-px bg-[#EFEEE7] my-5" />

              {/* Avantage — treated as a real negotiated perk, not a marketing pill */}
              <div className="flex items-start gap-2.5 mt-auto">
                <span className="w-7 h-7 rounded-full bg-[#FF5500]/10 flex items-center justify-center shrink-0">
                  <Gift className="w-3.5 h-3.5 text-[#FF5500]" strokeWidth={2.2} />
                </span>
                <span
                  className="text-[#3A3833] leading-snug pt-0.5"
                  style={{ fontSize: "13.5px", fontWeight: 600 }}
                >
                  {spot.avantage}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Reassurance pill — disarms the "is this a payment system?" fear */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-11 flex justify-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-white border border-[#E8E7E0] px-4 py-2">
            <ShieldCheck className="w-4 h-4 text-[#9CA3AF] shrink-0" strokeWidth={2} />
            <p style={{ fontSize: "13px", fontWeight: 500 }}>
              <span className="text-[#1C1B18] font-semibold">Zéro paiement, zéro commission</span>
              <span className="text-[#8A8880]"> — juste les bonnes adresses de ton crew.</span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
