"use client";

import React from "react";
import { Container } from "./Container";
import { Button } from "./Button";
import { MapPin, HeartPulse, Percent, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

export function Explanation() {
  const bentoCards = [
    {
      icon: MapPin,
      bgColor: "bg-[#FDF6F0]",
      accentColor: "text-[#FF5500]",
      badge: "Check-in GPS",
      title: "Check-in GPS",
      desc: "Saisie immédiate au point de RDV sans téléchargement.",
      img: "/assets/running_action.png"
    },
    {
      icon: HeartPulse,
      bgColor: "bg-[#F4F3ED]",
      accentColor: "text-[#1A1918]",
      badge: "Fiche Santé",
      title: "Fiche Santé",
      desc: "Renseignée en 30 sec par le membre. Accessible en 1 clic en cas de pépin.",
      img: "/assets/runners_trail.png"
    },
    {
      icon: Percent,
      bgColor: "bg-[#FFF8F4]",
      accentColor: "text-[#FF5500]",
      badge: "Cagnotte",
      title: "10% de commissions. Automatiquement.",
      desc: "10% sur la conso de tes membres reversés direct à la cagnotte du club.",
      img: "/assets/runners_social.png"
    },
    {
      icon: MessageCircle,
      bgColor: "bg-[#F4F3ED]",
      accentColor: "text-[#1A1918]",
      badge: "WhatsApp",
      title: "Fini le chaos WhatsApp.",
      desc: "Un seul lien pour toutes tes sorties. Plus de sondages sans fin ni messages perdus.",
      img: "/assets/hero_runners.png"
    }
  ];

  return (
    <section className="py-16 md:py-24">
      <Container className="max-w-6xl mx-auto space-y-20">
        
        {/* Statement Paragraph (Centered) */}
        <div className="max-w-4xl mx-auto text-center border-t border-black/5 pt-12">
          <p className="text-xl sm:text-3xl font-extrabold text-[#1A1918] leading-[1.25] tracking-tight">
            Automatise ton registre de présence, centralise les fiches d’urgence de tes coureurs et pilote tes revenus. Zéro friction : tes membres n’ont rien à installer, tu gères tout depuis ton espace.
          </p>
        </div>

        {/* Comment ça marche - Split Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column (Sticky Text & CTA) */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-[#1A1918] bg-[#E1E3D3] px-3.5 py-1.5 rounded-full border border-black/5">
              COMMENT ÇA MARCHE
            </div>

            <h2 className="font-extrabold text-3xl sm:text-5xl text-[#1A1918] leading-[1.12] tracking-tight">
              La sérénité d’un club pro. La liberté d’un crew informel.
            </h2>

            <p className="text-sm sm:text-base text-[#666562] font-medium leading-relaxed">
              Des milliers de sorties, des milliers de membres gérés. Tout est centralisé au même endroit, sans imposer la moindre application à ta communauté.
            </p>

            <div className="pt-4">
              <Button href="/login?mode=signup" variant="dark" size="md">
                Lancer mon crew →
              </Button>
            </div>
          </div>

          {/* Right Column (2x2 Bento Cards Grid) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {bentoCards.map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-[#EFEFE8] rounded-[24px] p-6 space-y-4 border border-black/5 flex flex-col justify-between hover:shadow-md transition-shadow duration-200"
              >
                {/* Thumbnail / Image Card */}
                <div className="h-32 w-full rounded-2xl overflow-hidden relative bg-white border border-black/5 shadow-inner">
                  <img
                    src={card.img}
                    alt={card.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur px-2.5 py-1 rounded-lg border border-black/5 text-[11px] font-extrabold text-[#1A1918] flex items-center gap-1.5 shadow-sm">
                    <card.icon className={`w-3.5 h-3.5 ${card.accentColor}`} />
                    <span>{card.title}</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="space-y-1.5 text-left">
                  <h3 className="font-extrabold text-base text-[#1A1918] tracking-tight">
                    {card.title}
                  </h3>
                  <p className="text-xs text-[#666562] font-medium leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>

      </Container>
    </section>
  );
}
