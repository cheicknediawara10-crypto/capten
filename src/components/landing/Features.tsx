"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPinned, MapPin, Heart, Gauge, Route, UserPlus } from "lucide-react";

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
    icon: MapPinned,
    title: "Les Spots du Crew",
    description: "Tes adresses (cafés, shops, kinés) avec avantages négociés pour tes membres. Ton crew a son identité locale.",
  },
];

export function Features() {
  return (
    <section className="py-16 px-5 bg-white">
      <div className="max-w-[1100px] mx-auto">
        {/* Statement */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-[#1C1B18] leading-[1.12] text-center mb-14"
          style={{ fontSize: "30px", fontWeight: 1000, letterSpacing: "-1.2px" }}
        >
          Sécurise tes coureurs, automatise la présence et donne à chacun son allure et son parcours — sans jamais imposer d&apos;appli à ta communauté.{" "}
          Zéro friction : tes membres n&apos;ont rien à installer, tu pilotes tout depuis ton cockpit.
        </motion.p>

        {/* 3 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-16">
          {COLS.map((col, i) => (
            <motion.div
              key={col.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="text-center"
            >
              <h3
                className="flex items-start justify-center gap-1.5 text-[#1C1B18] leading-snug mb-3"
                style={{ fontSize: "24px", fontWeight: 1000, letterSpacing: "-0.96px" }}
              >
                <col.icon className="w-5 h-5 text-[#FF5500] shrink-0" strokeWidth={2} />
                {col.title}
              </h3>
              <p
                className="text-[#6B6A6A] leading-snug"
                style={{ fontSize: "18px", fontWeight: 500 }}
              >
                {col.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
