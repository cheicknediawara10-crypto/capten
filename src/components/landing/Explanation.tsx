"use client";

import React from "react";
import { Container } from "./Container";
import { motion } from "framer-motion";
import { MapPin, HeartPulse, Percent } from "lucide-react";

const features = [
  {
    icon: MapPin,
    tag: "Check-in GPS",
    title: "Présence validée sur le lieu, en 2 secondes.",
    desc: "Sur le lieu de rendez-vous, chaque membre scanne et sa présence est enregistrée instantanément. Registre horodaté, certifié, téléchargeable. Tes membres n'ont rien à installer.",
    stat: "2s",
    statLabel: "pour émarger",
    img: "/assets/running_action.png",
    reverse: false,
  },
  {
    icon: HeartPulse,
    tag: "Fiche d'urgence",
    title: "Chaque coureur a une fiche médicale accessible en 1 clic.",
    desc: "Contact ICE, groupe sanguin, allergies, traitement. Renseignée par le membre en 30 secondes depuis son téléphone. Consultable uniquement par le Capitaine en session active.",
    stat: "30s",
    statLabel: "pour créer la fiche",
    img: "/assets/runners_trail.png",
    reverse: true,
  },
  {
    icon: MapPin,
    tag: "Les Spots du Crew",
    title: "Les adresses préférées de ton crew avec réductions exclusives.",
    desc: "Référence les cafés, shops de running et kinés de ton quartier. Offre des réductions et avantages négociés à tes membres sur simple présentation de leur carte.",
    stat: "100%",
    statLabel: "liberté & zéro gestion",
    img: "/assets/runners_social.png",
    reverse: false,
  },
];

export function Explanation() {
  return (
    <section id="features" className="py-24 md:py-32 bg-[#0C0C0A]">
      <Container className="max-w-6xl mx-auto">

        {/* Section header */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-5">
            <span className="w-6 h-px bg-[#FF5500]" />
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#FF5500]">Fonctionnalités</span>
          </div>
          <h2 className="font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white leading-[1.0] tracking-tight max-w-2xl">
            Tout ce dont ton crew a besoin.{" "}
            <span className="text-white/25">Rien de plus.</span>
          </h2>
        </div>

        {/* Alternating feature rows */}
        <div className="space-y-24">
          {features.map((f, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center`}
            >
              {/* Text side */}
              <div className={`space-y-6 ${f.reverse ? "lg:order-last" : ""}`}>
                <span className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-[#FF5500] bg-[#FF5500]/8 px-3 py-1.5 rounded-full border border-[#FF5500]/15">
                  <f.icon className="w-3.5 h-3.5" />
                  {f.tag}
                </span>
                <h3 className="font-extrabold text-2xl sm:text-3xl text-white leading-[1.2] tracking-tight">
                  {f.title}
                </h3>
                <p className="text-white/40 text-base leading-relaxed font-medium">
                  {f.desc}
                </p>
                {/* Stat pill */}
                <div className="inline-flex items-baseline gap-2 bg-[#111110] border border-white/8 px-6 py-3 rounded-xl">
                  <span className="text-3xl font-extrabold text-[#FF5500]">{f.stat}</span>
                  <span className="text-sm text-white/40 font-medium">{f.statLabel}</span>
                </div>
              </div>

              {/* Photo side */}
              <div className={`relative rounded-3xl overflow-hidden aspect-[4/3] ${f.reverse ? "lg:order-first" : ""}`}>
                <img
                  src={f.img}
                  alt={f.tag}
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0A]/70 via-[#0C0C0A]/10 to-transparent" />
                {/* Tag overlay */}
                <div className="absolute top-4 left-4 bg-[#0C0C0A]/80 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-lg text-[11px] font-extrabold text-white flex items-center gap-1.5">
                  <f.icon className="w-3.5 h-3.5 text-[#FF5500]" />
                  {f.tag}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </Container>
    </section>
  );
}
