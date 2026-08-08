"use client";

import React from "react";
import { motion } from "framer-motion";
import { Container } from "./Container";
import { Button } from "./Button";
import { Check, X } from "lucide-react";

const rows = [
  "Fiche d'urgence accessible en 1 clic",
  "Registre horodaté automatique par GPS",
  "Rappels automatiques avant chaque départ",
  "1 seul lien fixe partagé dans le groupe",
  "100 % Web (0 application à installer)",
  "Historique complet et archives des sorties",
  "Les Spots du Crew — Adresses & Avantages",
];

export function Comparison() {
  return (
    <section id="comparison" className="py-20 md:py-28 bg-[#111110]">
      <Container className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="w-6 h-px bg-[#FF5500]" />
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#FF5500]">Pourquoi CAPTEN</span>
            </div>
            <h2 className="font-extrabold text-4xl sm:text-5xl text-white leading-[1.0] tracking-tight">
              Avant vs après.<br />
              <span className="text-white/25">La différence en un tableau.</span>
            </h2>
          </div>
          <p className="text-white/35 text-sm font-medium max-w-xs leading-relaxed">
            CAPTEN s'ajoute à ton groupe WhatsApp existant. Zéro changement d'habitude.
          </p>
        </div>

        {/* Table */}
        <div className="relative">
          {/* Header row */}
          <div className="grid grid-cols-12 pb-3 border-b border-white/8 text-[11px] font-bold text-white/25 uppercase tracking-widest mb-2">
            <div className="col-span-7">Fonctionnalité</div>
            <div className="col-span-3 text-center">CAPTEN</div>
            <div className="col-span-2 text-right">Sans CAPTEN</div>
          </div>

          {/* Data rows */}
          <div className="space-y-1.5">
            {rows.map((row, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="grid grid-cols-12 bg-[#0C0C0A] border border-white/5 rounded-xl px-5 py-3.5 items-center hover:border-white/10 transition-colors"
              >
                <div className="col-span-7 text-sm font-medium text-white/70">{row}</div>
                <div className="col-span-3 flex justify-center">
                  <div className="w-6 h-6 rounded-full bg-[#FF5500]/20 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-[#FF5500]" />
                  </div>
                </div>
                <div className="col-span-2 flex justify-end pr-2">
                  <X className="w-4 h-4 text-white/20" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Floating CTA card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 bg-[#0C0C0A] border border-[#FF5500]/20 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#FF5500]/15 flex items-center justify-center shrink-0">
                <img src="/logo.png" alt="CAPTEN" className="h-5 w-auto brightness-0 invert" />
              </div>
              <div>
                <div className="font-extrabold text-white text-sm">CAPTEN PRO — 14 jours gratuits</div>
                <div className="text-white/35 text-xs font-medium mt-0.5">Sans carte bancaire · Résiliable à tout moment</div>
              </div>
            </div>
            <Button href="/login?mode=signup" variant="primary" size="md">
              Lancer mon crew →
            </Button>
          </motion.div>

        </div>
      </Container>
    </section>
  );
}
