"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "./Button";
import { Container } from "./Container";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="pt-28 pb-16 md:pt-40 md:pb-20 text-center">
      <Container className="max-w-4xl mx-auto space-y-7">
        
        {/* Top Badge Pill */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EFEFE8] border border-black/5 text-xs font-semibold text-[#555450] shadow-sm"
        >
          <span>Le logiciel web réservé aux organisateurs de Run Clubs</span>
          <span className="text-[#999893]">•</span>
          <span className="text-[#FF5500] font-bold">100% Web</span>
        </motion.div>

        {/* Hero Headline - 4 Exact Lines as in Reference Image */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-extrabold text-4xl sm:text-6xl md:text-[64px] text-[#1A1918] leading-[1.08] tracking-tight max-w-3xl mx-auto"
        >
          Tu as créé ce crew pour<br />
          partager une passion.<br />
          <span className="text-[#FF5500]">Pas pour jouer les</span><br />
          <span className="text-[#FF5500]">secrétaires.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-sm sm:text-base md:text-lg text-[#666562] font-medium max-w-2xl mx-auto leading-relaxed"
        >
          Automatise ton registre de présence, centralise les fiches d'urgence de tes coureurs et pilote tes revenus. Zéro friction : tes membres n'ont rien à installer, tu gères tout depuis ton espace.
        </motion.p>

        {/* Dual Pill Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2"
        >
          <Button href="/login?mode=signup" variant="primary" size="md">
            <span>Lancer mon crew →</span>
          </Button>
          <Button href="#features" variant="outline" size="md">
            Voir les fonctionnalités
          </Button>
        </motion.div>

      </Container>
    </section>
  );
}
