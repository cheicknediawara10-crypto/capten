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
            <div className="absolute inset-0 bg-gradient-to-t from-[#25261D]/90 via-[#25261D]/40 to-transparent group-hover:from-black/95 transition-colors duration-500" />

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
                Un malaise survient, tu perds de précieuses minutes car tu n'as aucun accès centralisé aux dossiers médicaux ou contacts d'urgence de tes coureurs.
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
            <div className="absolute inset-0 bg-gradient-to-t from-[#25261D]/90 via-[#25261D]/40 to-transparent group-hover:from-black/95 transition-colors duration-500" />

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
                Déplacer 40 personnes sur la voie publique sans liste d'émargement engage ta responsabilité. Ton crew a besoin d'un cadre officiel.
              </p>
            </div>
          </motion.div>

        </div>
      </Container>
    </section>
  );
}
