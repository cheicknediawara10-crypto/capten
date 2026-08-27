"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPinned, MapPin, Heart } from "lucide-react";

const COLS = [
  {
    icon: MapPinned,
    title: "Les Spots du Crew",
    description: "Tes adresses préférées (cafés, shops, kinés) avec avantages exclusifs pour tes membres. Ton crew a son identité locale.",
  },
  {
    icon: MapPin,
    title: "Check-in GPS instantané",
    description: "Valide les présences réelles au point de rendez-vous et mesure l'engagement de ton crew sortie après sortie.",
  },
  {
    icon: Heart,
    title: "Contact d'Urgence",
    description: "Chaque membre renseigne son contact prioritaire joignable en 1 clic en cas d'incident sur le parcours.",
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
          Automatise ton registre de présence, centralise les fiches d&apos;urgence de tes coureurs et crée l&apos;identité locale de ton crew.{" "}
          Zéro friction : tes membres n&apos;ont rien à installer, tu gères tout depuis ton espace.
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
