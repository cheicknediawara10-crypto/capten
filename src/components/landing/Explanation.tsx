"use client";

import React from "react";
import { motion } from "framer-motion";
import { Container } from "./Container";
import { Button } from "./Button";
import { SectionTitle } from "./SectionTitle";
import { ArrowRight } from "lucide-react";

export function Explanation() {
  return (
    <section className="py-20 md:py-28 bg-[#FFFFFF] border-y border-[#ECECEC]">
      <Container className="text-center space-y-10">
        
        <SectionTitle
          badge="COMMENT ÇA MARCHE"
          title={
            <>
              La sérénité d'un club pro.<br />
              La liberté d'un crew informel.
            </>
          }
          subtitle="Centralise tes sorties, réjouis tes membres et génère des revenus pour ton club. Tout est automatisé, tes membres n'ont pas à télécharger la moindre application pour venir."
        />

        <div className="pt-2">
          <Button href="/login?mode=signup" variant="primary" size="lg">
            <span>Lancer mon crew</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-base sm:text-xl font-bold text-[#1D1D1D] leading-relaxed max-w-3xl mx-auto pt-8 border-t border-[#ECECEC]"
        >
          Automatise ton registre de présence, centralise les fiches d'urgence de tes coureurs et pilote tes revenus. Zéro friction : tes membres n'ont rien à installer, tu gères tout depuis ton espace.
        </motion.p>

      </Container>
    </section>
  );
}
