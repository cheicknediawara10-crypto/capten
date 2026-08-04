"use client";

import React from "react";
import { motion } from "framer-motion";
import { Container } from "./Container";
import { Smartphone, MapPin, FileCheck } from "lucide-react";

export function Features() {
  const featuresList = [
    {
      icon: Smartphone,
      title: "100% Web, 0 app requise",
      desc: "Tes membres n'ont rien à télécharger. Ils s'inscrivent et scannent leur présence en 2 secondes."
    },
    {
      icon: MapPin,
      title: "Check-in GPS instantané",
      desc: "Sur le lieu de rendez-vous, l'inscription est validée instantanément. Mesure la réelle présence."
    },
    {
      icon: FileCheck,
      title: "Registre horodaté d'urgence",
      desc: "Conserve l'historique officiel de chaque sortie avec l'ensemble des présences en cas de contrôle ou d'incident."
    }
  ];

  return (
    <section id="features" className="py-12 md:py-16">
      <Container className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {featuresList.map((f, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="space-y-4 p-6 rounded-[24px]"
            >
              {/* Dark Square Icon Pill */}
              <div className="w-10 h-10 mx-auto rounded-xl bg-[#1A1918] text-white flex items-center justify-center shadow-sm">
                <f.icon className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="font-extrabold text-base sm:text-lg text-[#1A1918] tracking-tight leading-snug">
                {f.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#666562] font-medium leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
