"use client";

import React from "react";
import { Container } from "./Container";
import { Button } from "./Button";
import { motion } from "framer-motion";

export function PricingCTA() {
  return (
    <section className="py-24 bg-[#0C0C0A]">
      <Container className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

          {/* Left — photo card with badge */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative rounded-3xl overflow-hidden aspect-[4/3]"
          >
            <img
              src="https://images.pexels.com/photos/29840338/pexels-photo-29840338.jpeg?auto=compress&cs=tinysrgb&w=900"
              alt="Running"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0A]/75 to-[#0C0C0A]/10" />

            {/* Rating card */}
            <div className="absolute bottom-6 left-6 bg-[#0C0C0A]/85 backdrop-blur-sm border border-white/10 rounded-2xl px-5 py-4">
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-extrabold text-white">4.9</span>
                <span className="text-white/35 font-medium text-sm">/5.0</span>
              </div>
              <div className="text-[9px] font-bold tracking-[0.18em] uppercase text-white/30">
                Satisfaction capitaines
              </div>
            </div>
          </motion.div>

          {/* Right — CTA text */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:pl-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="w-6 h-px bg-[#FF5500]" />
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#FF5500]">Tarifs</span>
            </div>

            <h2 className="font-extrabold text-4xl sm:text-5xl text-white leading-[1.0] tracking-tight mb-6">
              Prêt à prendre le contrôle de ton crew ?
            </h2>

            <p className="text-white/35 text-sm font-medium leading-relaxed mb-8 max-w-xs">
              14 jours gratuits. Toutes les fonctionnalités, sans engagement. Aucune carte bancaire requise.
            </p>

            <div className="mb-8">
              <div className="text-[42px] font-extrabold text-white leading-none">
                29,99 <span className="text-white/25 text-2xl font-semibold">€/mois</span>
              </div>
              <div className="text-sm text-white/30 font-medium mt-2">Sans engagement, résiliable en 1 clic.</div>
            </div>

            <Button href="/login?mode=signup" variant="primary" size="lg">
              Essai gratuit — 14 jours ↗
            </Button>

          </motion.div>

        </div>
      </Container>
    </section>
  );
}
