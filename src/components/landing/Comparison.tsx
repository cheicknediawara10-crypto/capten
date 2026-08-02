"use client";

import React from "react";
import { motion } from "framer-motion";
import { Container } from "./Container";
import { Button } from "./Button";
import { Zap, Check, X } from "lucide-react";

export function Comparison() {
  const comparisonRows = [
    "Informations d'urgence accessibles en 1-clic",
    "Vérification du rôle et présence au lieu par GPS",
    "Rapports de commissions mensuels des commerçants",
    "Recommandations de sécurité sur le trajet",
    "100% Web (0 application à installer)",
    "Téléchargement du registre de présence en PDF",
    "10% de commission sur la consommation café"
  ];

  const captenChecks = [
    "Informations d'urgence",
    "Vérification GPS",
    "Rapports commissions",
    "Recommandations",
    "100% Web (0 app)",
    "Registre PDF certifié",
    "10% commission café"
  ];

  return (
    <section id="comparison" className="py-20 md:py-28">
      <Container className="max-w-5xl mx-auto">
        
        {/* Warm Off-White / Beige Container (#EFEFE8 / #EAEAE3) */}
        <div className="bg-[#EFEFE8] rounded-[32px] p-6 sm:p-12 border border-black/5 space-y-8 relative">
          
          {/* Header */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="font-extrabold text-3xl sm:text-5xl text-[#1A1918] tracking-tight">
              Pourquoi CAPTEN
            </h2>
            <p className="text-xs sm:text-sm text-[#666562] font-medium leading-relaxed">
              CAPTEN est le premier logiciel supersportif spécialement pensé pour la gestion des crews. Il remplace WhatsApp pour la logistique et centralise tout ce qui est vraiment utile pour vos membres.
            </p>
          </div>

          {/* Comparison Table with Central Floating Mobile-Interface Dark Card */}
          <div className="relative pt-2">
            
            {/* Background Table */}
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-black/10 text-xs font-bold text-[#666562] uppercase tracking-wider">
                <span>Fonctionnalités du système</span>
                <span className="pr-4 sm:pr-8">WhatsApp seul</span>
              </div>

              {comparisonRows.map((rowText, rIdx) => (
                <div
                  key={rIdx}
                  className="bg-[#E4E4DC] p-3.5 sm:p-4 rounded-xl flex justify-between items-center text-xs sm:text-sm font-medium text-[#1A1918]"
                >
                  <span className="pr-4">{rowText}</span>
                  <span className="pr-6 sm:pr-10 text-neutral-400 font-bold">
                    <X className="w-4 h-4 inline-block text-neutral-400" />
                  </span>
                </div>
              ))}
            </div>

            {/* CENTRAL FLOATING VERTICAL DARK GLASS CARD (#181716) */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              animate={{ y: [0, -5, 0] }}
              /* @ts-ignore */
              transition={{
                duration: 0.5,
                y: { repeat: Infinity, duration: 5, ease: "easeInOut" }
              }}
              className="w-full md:w-[320px] lg:w-[350px] md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 mt-6 md:mt-0 bg-[#181716] text-white rounded-[28px] p-6 sm:p-8 space-y-6 shadow-[0_30px_70px_rgba(0,0,0,0.55)] border border-white/10 z-20 backdrop-blur-md"
            >
              {/* Card Header Logo */}
              <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
                <div className="w-7 h-7 rounded-lg bg-[#FF5500] flex items-center justify-center shadow-md">
                  <Zap className="w-4 h-4 fill-white" />
                </div>
                <span className="font-extrabold text-sm text-white tracking-wider">
                  CAPTEN
                </span>
              </div>

              {/* 7 Checkmark Items */}
              <div className="space-y-3 text-xs font-medium text-neutral-200">
                {captenChecks.map((cText, cIdx) => (
                  <div key={cIdx} className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-white/20 text-white flex items-center justify-center shrink-0 text-[10px] font-bold">
                      <Check className="w-3 h-3" />
                    </div>
                    <span>{cText}</span>
                  </div>
                ))}
              </div>

              {/* Action Button inside Floating Card */}
              <div className="pt-2">
                <Button href="/login?mode=signup" variant="secondary" size="md" fullWidth>
                  Lancer mon crew →
                </Button>
              </div>

            </motion.div>

          </div>

        </div>

      </Container>
    </section>
  );
}
