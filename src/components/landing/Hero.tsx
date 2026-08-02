"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "./Button";
import { Container } from "./Container";

export function Hero() {
  return (
    <section className="pt-28 pb-16 md:pt-40 md:pb-20 text-center">
      <Container className="max-w-4xl mx-auto space-y-7">
        
        {/* Top Badge Pill */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E1E3D3] border border-black/5 text-xs font-semibold text-[#25261D] shadow-sm"
        >
          <span>Le logiciel de gestion des fondateurs de Run Clubs, Walk Social, Rando & Trail</span>
          <span className="text-[#6B6A6A]">•</span>
          <span className="text-[#FF5500] font-bold">100 % Web</span>
        </motion.div>

        {/* Hero H1 Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-extrabold text-4xl sm:text-6xl md:text-[62px] text-[#25261D] leading-[1.08] tracking-tight max-w-4xl mx-auto"
        >
          Tu as créé ce crew pour partager une passion. Pas pour jouer les secrétaires.
        </motion.h1>

        {/* Dual Pill Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2"
        >
          <Button href="/login?mode=signup" variant="primary" size="md">
            <span>Lancer mon crew</span>
          </Button>
          <Button href="#features" variant="secondary" size="md">
            Voir la démo en 1 min
          </Button>
        </motion.div>

      </Container>
    </section>
  );
}
