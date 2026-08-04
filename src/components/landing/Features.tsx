"use client";

import React from "react";
import { motion } from "framer-motion";
import { Container } from "./Container";
import { Coffee, MapPin, HeartPulse } from "lucide-react";

export function Features() {
  const featuresList = [
    {
      icon: Coffee,
      title: "10 % de commission Automatiquement",
      desc: "10 % de commission reversés à ton crew sur chaque conso payée chez vos partenaires."
    },
    {
      icon: MapPin,
      title: "Check-in GPS instantané",
      desc: "Valide les présences réelles au point de rendez-vous et mesure l'engagement de ton crew sortie après sortie."
    },
    {
      icon: HeartPulse,
      title: "Fiche Santé",
      desc: "Chaque membre renseigne son contact prioritaire et ses infos médicales en 30 secondes."
    }
  ];

  return (
    <section id="features" className="pb-20 md:pb-28">
      <Container className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {featuresList.map((f, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="space-y-3 p-6 rounded-[24px]"
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-[#E1E3D3] border border-black/5 flex items-center justify-center text-[#FF5500]">
                <f.icon className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h4 className="font-extrabold text-lg text-[#25261D] tracking-tight leading-snug">
                {f.title}
              </h4>
              <p className="text-xs sm:text-sm text-[#6B6A6A] font-medium leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
