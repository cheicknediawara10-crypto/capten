"use client";

import React from "react";
import { motion } from "framer-motion";
import { Container } from "./Container";
import { Button } from "./Button";
import { Zap, Check, X } from "lucide-react";

export function Comparison() {
  const comparisonRows = [
    "Fiche d'urgence accessible en 1 clic",
    "Registre horodaté automatique par GPS",
    "Rappels automatiques avant chaque départ",
    "1 seul lien fixe partagé dans le groupe",
    "100 % Web (0 application à installer)",
    "Historique complet et archives des sorties",
    "10 % de commission automatique Spots"
  ];

  return (
    <section id="comparison" className="py-20 md:py-28">
      <Container className="max-w-5xl mx-auto">
        
        <div className="space-y-10">
          
          {/* Header */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="font-extrabold text-3xl sm:text-5xl text-[#25261D] tracking-tight">
              Pourquoi CAPTEN
            </h2>
            <p className="text-xs sm:text-sm text-[#6B6A6A] font-medium leading-relaxed">
              CAPTEN s'ajoute à ton groupe WhatsApp existant pour apporter la sécurité, la géolocalisation et des revenus automatiques. Zéro changement d'habitude pour tes membres.
            </p>
          </div>

          {/* 3 Columns Comparison Table (Left: Feature, Middle: CAPTEN Floating Dark Card, Right: Ton Dimanche Soir) */}
          <div className="relative pt-4">
            
            {/* Background Table Rows */}
            <div className="space-y-3">
              <div className="grid grid-cols-12 pb-3 border-b border-black/10 text-xs font-bold text-[#6B6A6A] uppercase tracking-wider">
                <div className="col-span-8 sm:col-span-9">Fonctionnalités</div>
                <div className="col-span-4 sm:col-span-3 text-right pr-4">Ton dimanche soir</div>
              </div>

              {comparisonRows.map((rowText, rIdx) => (
                <div
                  key={rIdx}
                  className="grid grid-cols-12 bg-[#25261D]/5 p-3.5 sm:p-4 rounded-[12px] items-center text-xs sm:text-sm font-medium text-[#25261D]"
                >
                  <div className="col-span-8 sm:col-span-9 pr-4">{rowText}</div>
                  <div className="col-span-4 sm:col-span-3 text-right pr-4 text-neutral-400 font-bold">
                    <X className="w-4 h-4 inline-block text-neutral-400" />
                  </div>
                </div>
              ))}
            </div>

            {/* CENTRAL FLOATING DARK CARD (#25261D) */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              animate={{ y: [0, -5, 0] }}
              transition={{
                duration: 0.5,
                y: { repeat: Infinity, duration: 5, ease: "easeInOut" }
              }}
              className="w-full md:w-[300px] lg:w-[330px] md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 mt-6 md:mt-0 bg-[#25261D] text-white rounded-[24px] p-6 sm:p-8 space-y-6 shadow-[0_30px_70px_rgba(0,0,0,0.55)] border border-white/10 z-20"
            >
              {/* Header Logo */}
              <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                <div className="w-6 h-6 rounded-lg bg-[#FF5500] flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 fill-white" />
                </div>
                <span className="font-extrabold text-sm text-white tracking-wider">
                  CAPTEN
                </span>
              </div>

              {/* 7 Checkmark Items */}
              <div className="space-y-3 text-xs font-medium text-neutral-200">
                {comparisonRows.map((_, cIdx) => (
                  <div key={cIdx} className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-white/20 text-white flex items-center justify-center shrink-0 text-[10px] font-bold">
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="truncate">{comparisonRows[cIdx]}</span>
                  </div>
                ))}
              </div>

              {/* Action Button inside Floating Card */}
              <div className="pt-2">
                <Button href="/login?mode=signup" variant="secondary" size="md" fullWidth>
                  Lancer mon crew
                </Button>
              </div>

            </motion.div>

          </div>

        </div>

      </Container>
    </section>
  );
}
