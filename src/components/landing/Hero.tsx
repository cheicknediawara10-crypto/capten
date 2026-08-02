"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "./Button";
import { Container } from "./Container";
import { ArrowRight, Play } from "lucide-react";

export function Hero() {
  return (
    <section className="pt-36 pb-20 md:pt-48 md:pb-32 overflow-hidden relative">
      <Container className="text-center space-y-10">
        
        {/* Top Badge Pill */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#F5F3EE] border border-[#ECECEC] text-xs font-bold text-[#6E6E6E] shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-[#FF5B14] animate-pulse" />
          <span>Le logiciel web réservé aux organisateurs de Run Clubs</span>
          <span className="text-[#6E6E6E] font-normal">• 100% Web</span>
        </motion.div>

        {/* Hero Gigantic Headline (72px, font-black, line-height 0.95, tracking -0.035em) */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-black text-4xl sm:text-6xl lg:text-[72px] text-[#1D1D1D] leading-[0.95] tracking-[-0.035em] max-w-5xl mx-auto"
        >
          Tu as créé ce crew<br />
          pour partager une passion.<br />
          <span className="text-[#FF5B14]">Pas pour jouer les secrétaires.</span>
        </motion.h1>

        {/* Subtitle (20px, max-w-2xl) */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-base sm:text-xl text-[#6E6E6E] font-medium max-w-2xl mx-auto leading-[1.6]"
        >
          Automatise ton registre de présence, centralise les fiches d'urgence de tes coureurs et pilote tes revenus. Zéro friction : tes membres n'ont rien à installer, tu gères tout depuis ton espace.
        </motion.p>

        {/* Dual CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
        >
          <Button href="/login?mode=signup" variant="primary" size="lg" className="w-full sm:w-auto">
            <span>Lancer mon crew</span>
            <ArrowRight className="w-4.5 h-4.5 ml-2" />
          </Button>
          <Button href="#features" variant="secondary" size="lg" className="w-full sm:w-auto">
            <Play className="w-4 h-4 mr-2 fill-current" />
            Voir la démo en 1 min
          </Button>
        </motion.div>

      </Container>
    </section>
  );
}
