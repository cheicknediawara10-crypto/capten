"use client";

import React from "react";
import { motion } from "framer-motion";
import { Container } from "./Container";

export function ProblemCards() {
  return (
    <section id="impact" className="pb-20 md:pb-28">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1 : Le Cauchemar Logistique */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative rounded-[24px] overflow-hidden min-h-[380px] sm:min-h-[420px] flex flex-col justify-between p-8 text-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] group border border-[#ECECEC] cursor-pointer"
          >
            {/* Photo background with zoom on hover */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url('/assets/running_action.png')` }}
            />
            
            {/* Dark gradient overlay that gets darker on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 group-hover:from-black/95 transition-colors duration-500" />

            {/* Icon / Badge top */}
            <div className="relative z-10 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center font-bold text-sm">
              ⚓
            </div>

            {/* Content Bottom */}
            <div className="relative z-10 space-y-2">
              <h3 className="font-extrabold text-2xl text-white tracking-tight">
                Le cauchemar logistique
              </h3>
              <p className="text-sm text-neutral-200 leading-relaxed font-medium">
                Les minutes précieuses perdues au départ à compter les têtes, les relances manuelles sur WhatsApp et l'absence de fiches d'urgence médicales quand un coureur fait une mauvaise chute.
              </p>
            </div>
          </motion.div>

          {/* Card 2 : Le Risque Juridique */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="relative rounded-[24px] overflow-hidden min-h-[380px] sm:min-h-[420px] flex flex-col justify-between p-8 text-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] group border border-[#ECECEC] cursor-pointer"
          >
            {/* Photo background with zoom on hover */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url('/assets/runners_trail.png')` }}
            />
            
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 group-hover:from-black/95 transition-colors duration-500" />

            {/* Icon / Badge top */}
            <div className="relative z-10 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center font-bold text-sm">
              ⚖️
            </div>

            {/* Content Bottom */}
            <div className="relative z-10 space-y-2">
              <h3 className="font-extrabold text-2xl text-white tracking-tight">
                Le risque juridique
              </h3>
              <p className="text-sm text-neutral-200 leading-relaxed font-medium">
                Organiser un groupe sur la voie publique implique votre responsabilité en cas d'accident. Sans registre d'émargement officiel ni décharge, vous restez sans protection légale.
              </p>
            </div>
          </motion.div>

        </div>
      </Container>
    </section>
  );
}
