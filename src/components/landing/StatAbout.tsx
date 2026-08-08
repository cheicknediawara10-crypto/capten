"use client";

import React from "react";
import { motion } from "framer-motion";
import { Container } from "./Container";

export function StatAbout() {
  return (
    <section className="bg-[#111110] border-t border-white/5 py-20">
      <Container className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

          {/* Left — big number */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-[100px] lg:text-[130px] font-extrabold text-[#FF5500] leading-none tracking-tight">
              500<span className="text-white/15">+</span>
            </div>
            <div className="text-xs font-bold tracking-[0.2em] uppercase text-white/25 mt-3">
              Capitaines actifs en France
            </div>
          </motion.div>

          {/* Right — about text */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="w-6 h-px bg-[#FF5500]" />
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#FF5500]">À Propos</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed font-medium mb-5">
              Nous croyons que la performance d'un Run Club va bien au-delà de la course — c'est la communication, la sécurité et l'impact sur la communauté locale.
            </p>
            <p className="text-white/30 text-sm leading-relaxed font-medium">
              Construite par des coureurs pour des coureurs, notre mission est d'inspirer les fondateurs de Run Clubs à développer des communautés sûres, engagées et pérennes.
            </p>
          </motion.div>

        </div>
      </Container>
    </section>
  );
}
