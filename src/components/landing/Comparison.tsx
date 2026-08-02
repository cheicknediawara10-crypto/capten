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
    <section id="comparison" className="py-24 md:py-36">
      <Container>
        
        {/* Soft Beige Section Background Container (#F5F3EE / #EFEFE9) */}
        <div className="bg-[#F5F3EE] rounded-[32px] p-6 sm:p-12 border border-[#ECECEC] space-y-10 relative shadow-sm">
          
          {/* Section Header */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="font-extrabold text-3xl sm:text-5xl text-[#1D1D1D] tracking-tight">
              Pourquoi CAPTEN
            </h2>
            <p className="text-sm sm:text-base text-[#6E6E6E] font-medium leading-relaxed">
              CAPTEN est le premier logiciel supersportif spécialement pensé pour la gestion des crews. Il remplace WhatsApp pour la logistique et centralise tout ce qui est vraiment utile pour vos membres.
            </p>
          </div>

          {/* Comparison Table with Central Floating Mobile-Interface Dark Card */}
          <div className="relative pt-4">
            
            {/* Background Table */}
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-4 border-b border-black/10 text-xs font-bold text-[#6E6E6E] uppercase tracking-wider">
                <span>Fonctionnalités du système</span>
                <span className="pr-4 sm:pr-8">WhatsApp seul</span>
              </div>

              {comparisonRows.map((rowText, rIdx) => (
                <div
                  key={rIdx}
                  className="bg-[#EBE8E1] p-4 rounded-[12px] flex justify-between items-center text-xs sm:text-sm font-medium text-[#1D1D1D]"
                >
                  <span className="pr-4">{rowText}</span>
                  <span className="pr-6 sm:pr-10 text-neutral-400 font-bold">
                    <X className="w-4 h-4 inline-block text-neutral-400" />
                  </span>
                </div>
              ))}
            </div>

            {/* CENTRAL FLOATING DARK GLASS CARD (#1D1D1D) WITH DISCRETE FLOATING ANIMATION */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              animate={{ y: [0, -6, 0] }}
              /* Smooth floating micro-interaction */
              /* @ts-ignore */
              transition={{
                y: {
                  repeat: Infinity,
                  duration: 5,
                  ease: "easeInOut"
                }
              }}
              className="w-full md:w-[320px] lg:w-[360px] md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 mt-6 md:mt-0 bg-gradient-to-b from-[#282725] to-[#1D1D1D] text-white rounded-[24px] p-6 sm:p-8 space-y-6 shadow-[0_32px_80px_rgba(0,0,0,0.45)] border border-white/15 z-20 backdrop-blur-md"
            >
              {/* Card Header Logo */}
              <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
                <div className="w-7 h-7 rounded-lg bg-[#FF5B14] flex items-center justify-center shadow-md shadow-[#FF5B14]/30">
                  <Zap className="w-4 h-4 fill-white" />
                </div>
                <span className="font-extrabold text-sm text-white tracking-wider">
                  CAPTEN PRO
                </span>
              </div>

              {/* 7 Checkmark Items */}
              <div className="space-y-3 text-xs font-medium text-neutral-200">
                {captenChecks.map((cText, cIdx) => (
                  <div key={cIdx} className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-[10px] font-bold">
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
