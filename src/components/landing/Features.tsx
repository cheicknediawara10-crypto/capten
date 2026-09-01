"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPin, Heart, Gauge, Route, UserPlus, Sparkles } from "lucide-react";

const COLS = [
  {
    icon: Heart,
    title: "Contact d'urgence",
    description: "Chaque coureur renseigne son contact prioritaire, joignable en 1 clic si un incident survient sur le parcours.",
  },
  {
    icon: MapPin,
    title: "Check-in 1-clic par GPS",
    description: "Le coureur valide sa présence d'un geste au point de départ. Registre horodaté, zéro appel manuel, zéro fantôme.",
  },
  {
    icon: Gauge,
    title: "Sas d'allure",
    description: "Chacun choisit son rythme à l'inscription (Cool, Rythmé, Fast). Fini le tri au mégaphone et la peur du débutant de se faire lâcher.",
  },
  {
    icon: Route,
    title: "Tracé Strava en 1 clic",
    description: "Partage le parcours (Strava, Komoot, GPX). Tes coureurs le chargent sur leur montre en une seconde — zéro DM avant le départ.",
  },
  {
    icon: UserPlus,
    title: "Invité Express",
    description: "Un pote imprévu sur le trottoir ? Ajoute-le en 3 secondes depuis ton cockpit, sans formulaire ni friction.",
  },
  {
    icon: Sparkles,
    title: "Copilote du capitaine",
    description: "Tes annonces, relances et messages WhatsApp prêts à envoyer en 1 clic. La charge mentale de la semaine, en moins.",
  },
];

export function Features() {
  return (
    <section className="py-16 px-5 bg-white">
      <div className="max-w-[1100px] mx-auto">
        {/* Kicker + statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <p className="text-[#FF5500] mb-4 uppercase" style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.72px" }}>
            Tout ce que Capten gère pour toi
          </p>
          <p
            className="text-[#1C1B18] leading-[1.12]"
            style={{ fontSize: "30px", fontWeight: 1000, letterSpacing: "-1.2px" }}
          >
            Sécurise tes coureurs, automatise la présence et donne à chacun son allure et son parcours — sans jamais imposer d&apos;appli à ta communauté.
          </p>
        </motion.div>

        {/* Cards — flex centré : 5 blocs → 3 + 2 centrés, jamais de trou disgracieux */}
        <div className="flex flex-wrap justify-center gap-5">
          {COLS.map((col, i) => (
            <motion.div
              key={col.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4, boxShadow: "0 18px 44px -18px rgba(28,27,24,0.18)", transition: { duration: 0.2 } }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              className="group w-full sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.834rem)] rounded-[20px] border border-[#EAE9E2] bg-[#FAFAF8] p-7 hover:bg-white hover:border-[#FF5500]/40 transition-colors duration-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#FF5500]/[0.08] flex items-center justify-center mb-5 group-hover:bg-[#FF5500] transition-colors duration-300">
                <col.icon className="w-6 h-6 text-[#FF5500] group-hover:text-white transition-colors duration-300" strokeWidth={2} />
              </div>
              <h3
                className="text-[#1C1B18] mb-2.5 leading-tight"
                style={{ fontSize: "22px", fontWeight: 1000, letterSpacing: "-0.8px" }}
              >
                {col.title}
              </h3>
              <p className="text-[#6B6A6A] leading-snug" style={{ fontSize: "16px", fontWeight: 500 }}>
                {col.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
