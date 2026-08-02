"use client";

import React from "react";
import { Container } from "./Container";
import { Button } from "./Button";

export function Explanation() {
  return (
    <section className="py-16 md:py-24 text-center">
      <Container className="max-w-4xl mx-auto space-y-8">
        
        {/* Badge */}
        <div className="inline-block text-[11px] font-bold uppercase tracking-widest text-[#25261D] bg-[#E1E3D3] px-3.5 py-1.5 rounded-full border border-black/5">
          COMMENT ÇA MARCHE
        </div>

        {/* H2 Title */}
        <h2 className="font-extrabold text-3xl sm:text-5xl text-[#25261D] leading-[1.12] tracking-tight max-w-2xl mx-auto">
          La sérénité d’un club pro. La liberté d’un crew informel.
        </h2>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-[#6B6A6A] font-medium max-w-2xl mx-auto leading-relaxed">
          Centralise tes sorties, sécurise tes membres et génère des revenus pour ton club. Tout est géré au même endroit, sans imposer la moindre application à ta communauté.
        </p>

        {/* Button */}
        <div className="pt-2">
          <Button href="/login?mode=signup" variant="primary" size="md">
            <span>Lancer mon crew →</span>
          </Button>
        </div>

        {/* Big Text Paragraph */}
        <p className="text-base sm:text-xl font-bold text-[#25261D] leading-relaxed max-w-3xl mx-auto pt-8 border-t border-black/5">
          Automatise ton registre de présence, centralise les fiches d’urgence de tes coureurs et pilote tes revenus. Zéro friction : tes membres n’ont rien à installer, tu gères tout depuis ton espace.
        </p>

      </Container>
    </section>
  );
}
