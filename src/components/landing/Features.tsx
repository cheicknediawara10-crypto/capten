"use client";

import React from "react";
import { motion } from "framer-motion";
import { Container } from "./Container";
import { Coffee, MapPin, HeartPulse } from "lucide-react";

export function Features() {
  const featuresList = [
    {
      icon: Coffee,
      iconColor: "text-[#FF5B14]",
      iconBg: "bg-[#FF5B14]/10",
      num: "01",
      title: "10% de commission automatiquement",
      desc: "Touche de la commission automatiquement quand tes membres vont consommer chez les cafés partenaires."
    },
    {
      icon: MapPin,
      iconColor: "text-[#FF5B14]",
      iconBg: "bg-[#FF5B14]/10",
      num: "02",
      title: "Check-in GPS instantané",
      desc: "Valide la présence de tes membres au point de RDV via leur position géolocalisée quand ils sont sous un rayon paramétrable."
    },
    {
      icon: HeartPulse,
      iconColor: "text-[#FF5B14]",
      iconBg: "bg-[#FF5B14]/10",
      num: "03",
      title: "Fiche Santé / ICE",
      desc: "Chaque membre enregistre son groupe sanguin et son contact d'urgence disponible 1-clic pendant les sessions."
    }
  ];

  return (
    <section id="features" className="py-20 md:py-28 bg-[#FFFFFF]">
      <Container>
        
        {/* Unboxed 3 columns feature grid without heavy card borders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {featuresList.map((f, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.15 }}
              className="space-y-4 text-left p-6 rounded-[24px] hover:bg-[#FAFAF8] transition-colors duration-300"
            >
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-2xl ${f.iconBg} ${f.iconColor} flex items-center justify-center`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <span className="font-mono text-xs font-bold text-[#6E6E6E]">{f.num}</span>
              </div>

              <h3 className="font-extrabold text-xl text-[#1D1D1D] tracking-tight">
                {f.title}
              </h3>

              <p className="text-sm text-[#6E6E6E] font-medium leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>

      </Container>
    </section>
  );
}
