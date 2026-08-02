"use client";

import React from "react";
import { motion } from "framer-motion";
import { Container } from "./Container";
import { Button } from "./Button";

export function Explanation() {
  return (
    <section className="py-16 md:py-24 text-center">
      <Container className="max-w-4xl mx-auto space-y-8">
        
        {/* Badge */}
        <div className="inline-block text-[11px] font-bold uppercase tracking-widest text-[#555450] bg-[#EFEFE8] px-3.5 py-1.5 rounded-full border border-black/5">
          SÉRÉNITÉ & AUTONOMIE
        </div>

        {/* H2 Title */}
        <h2 className="font-extrabold text-3xl sm:text-5xl text-[#1A1918] leading-[1.12] tracking-tight max-w-2xl mx-auto">
          La sérénité d'un club pro. La<br />
          liberté d'un crew informel.
        </h2>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-[#666562] font-medium max-w-2xl mx-auto leading-relaxed">
          Centralise tes sorties, réjouis tes membres et génère des revenus pour ton club. Tout est automatisé, tes membres n'ont pas à télécharger la moindre application pour venir.
        </p>

        {/* Orange Button */}
        <div className="pt-2">
          <Button href="/login?mode=signup" variant="primary" size="md">
            <span>Lancer mon crew →</span>
          </Button>
        </div>

        {/* Text paragraph */}
        <p className="text-base sm:text-xl font-bold text-[#1A1918] leading-relaxed max-w-3xl mx-auto pt-8 border-t border-black/5">
          Automatise ton registre de présence, centralise les fiches d'urgence de tes coureurs et pilote tes revenus. Zéro friction : tes membres n'ont rien à installer, tu gères tout depuis ton espace.
        </p>

      </Container>
    </section>
  );
}
