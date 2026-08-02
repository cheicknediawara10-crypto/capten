"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "./Button";
import { Container } from "./Container";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="pt-32 pb-16 md:pt-44 md:pb-24 overflow-hidden">
      <Container className="text-center space-y-8">
        
        {/* Top Badge Pill */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F5F3EE] border border-[#ECECEC] text-xs font-bold text-[#6E6E6E] shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-[#FF5B14]" />
          <span>Le logiciel web réservé aux organisateurs de Run Clubs</span>
          <span className="text-[#6E6E6E] font-normal">• 100% Web</span>
        </motion.div>

        {/* Hero Gigantic Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-black text-4xl sm:text-6xl md:text-[72px] text-[#1D1D1D] leading-[0.98] tracking-tight max-w-4xl mx-auto"
        >
          Tu as créé ce crew<br />
          pour partager une passion.<br />
          <span className="text-[#FF5B14]">Pas pour jouer les secrétaires.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-xl text-[#6E6E6E] font-medium max-w-2xl mx-auto leading-relaxed"
        >
          Automatise ton registre de présence, centralise les fiches d'urgence de tes coureurs et pilote tes revenus. Zéro friction : tes membres n'ont rien à installer, tu gères tout depuis ton espace.
        </motion.p>

        {/* Dual CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
        >
          <Button href="/login?mode=signup" variant="primary" size="lg" className="w-full sm:w-auto">
            <span>Lancer mon crew</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button href="#features" variant="secondary" size="lg" className="w-full sm:w-auto">
            Voir la démo en 1 min
          </Button>
        </motion.div>

      </Container>
    </section>
  );
}
