"use client";

import React from "react";
import { motion } from "framer-motion";
import { Container } from "./Container";

export function ProblemCards() {
  return (
    <section id="impact" className="pb-16 md:pb-24">
      <Container className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Card 1 : Le Cauchemar Logistique */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative rounded-[24px] overflow-hidden min-h-[360px] sm:min-h-[400px] flex flex-col justify-between p-8 text-white shadow-xl group border border-black/5 cursor-pointer"
          >
            {/* Photo Background */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
              style={{ backgroundImage: `url('/assets/running_action.png')` }}
            />
            
            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 group-hover:from-black/95 transition-colors duration-500" />

            {/* Top Badge Icon */}
            <div className="relative z-10 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center font-bold text-xs shadow-sm">
              ⚓
            </div>

            {/* Bottom Content */}
            <div className="relative z-10 space-y-2">
              <h3 className="font-extrabold text-xl sm:text-2xl text-white tracking-tight">
                Le cauchemar logistique
              </h3>
              <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-medium">
                Les minutes précieuses perdues au départ à compter les têtes, les relances manuelles sur WhatsApp et l'absence de fiches d'urgence médicales quand un coureur fait une mauvaise chute.
              </p>
            </div>
          </motion.div>

          {/* Card 2 : Le Risque Juridique */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="relative rounded-[24px] overflow-hidden min-h-[360px] sm:min-h-[400px] flex flex-col justify-between p-8 text-white shadow-xl group border border-black/5 cursor-pointer"
          >
            {/* Photo Background */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
              style={{ backgroundImage: `url('/assets/runners_trail.png')` }}
            />
            
            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 group-hover:from-black/95 transition-colors duration-500" />

            {/* Top Badge Icon */}
            <div className="relative z-10 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center font-bold text-xs shadow-sm">
              ⚖️
            </div>

            {/* Bottom Content */}
            <div className="relative z-10 space-y-2">
              <h3 className="font-extrabold text-xl sm:text-2xl text-white tracking-tight">
                Le risque juridique
              </h3>
              <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-medium">
                Organiser un groupe sur la voie publique implique votre responsabilité en cas d'accident. Sans registre d'émargement officiel ni décharge, vous restez sans protection légale.
              </p>
            </div>
          </motion.div>

        </div>
      </Container>
    </section>
  );
}
