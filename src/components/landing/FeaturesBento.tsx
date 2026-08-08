"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  MapPin, ShieldCheck, MessageSquare,
  Users, ClipboardList, Zap, Check
} from "lucide-react";

const FEATURES = [
  {
    icon: MapPin,
    title: "Check-in GPS",
    description: "Tes membres valident leur présence via un lien WhatsApp. Sans appli, sans friction.",
    large: true,
    accent: false,
  },
  {
    icon: ShieldCheck,
    title: "Fiches d'urgence",
    description: "Groupe sanguin, contacts ICE, allergies. Disponibles hors-ligne pour chaque coureur.",
    large: false,
    accent: false,
  },
  {
    icon: MessageSquare,
    title: "WhatsApp automatisé",
    description: "Rappels J-1, confirmation de présence, résumé post-run. Zéro copier-coller.",
    large: false,
    accent: true,
  },
  {
    icon: ClipboardList,
    title: "Liste d'attente active",
    description: "Un désistement ? Le suivant est notifié automatiquement et prend la place.",
    large: false,
    accent: false,
  },
  {
    icon: Users,
    title: "Système Anti-Fantôme",
    description: "Les no-shows répétés sont signalés. Ton crew reste responsable.",
    large: false,
    accent: false,
  },
  {
    icon: Zap,
    title: "Les Spots du Crew",
    description: "Référence tes adresses préférées et offre des avantages exclusifs à ton crew.",
    large: false,
    accent: false,
  },
];

const WA_MESSAGES = [
  { side: "left" as const, text: "⏰ Run demain 20h30 — Tape OUI pour confirmer ta place" },
  { side: "right" as const, text: "OUI" },
  { side: "left" as const, text: "✅ C'est confirmé ! À demain au Trocadéro." },
];

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 90, damping: 20 } },
};

export function FeaturesBento() {
  const [col1, col2, col3a, col3b, col4a, col4b] = FEATURES;

  return (
    <section id="features" className="bg-[#FAFAF8] py-28 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 text-[#FF5500] text-[11px] font-bold tracking-[0.18em] uppercase mb-4">
            <span className="w-4 h-px bg-[#FF5500]" />
            Fonctionnalités
            <span className="w-4 h-px bg-[#FF5500]" />
          </div>
          <h2 className="font-extrabold text-[42px] sm:text-[54px] text-[#111111] leading-tight tracking-tight">
            Tout ce dont tu as besoin.<br />
            <span className="text-[#6B7280]">Rien de superflu.</span>
          </h2>
        </motion.div>

        {/* Bento grid */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{ show: { transition: { staggerChildren: 0.04 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {/* Col 1 — large card (spans 2 rows) */}
          <motion.div
            variants={item}
            whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 20 } }}
            className="lg:row-span-2 bg-white border border-[#E8E8E8] rounded-2xl p-7 flex flex-col justify-between hover:border-[#D0D0D0] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-200 cursor-default"
          >
            <div>
              <div className="w-10 h-10 bg-[#FF5500]/10 rounded-xl flex items-center justify-center mb-5">
                <col1.icon className="w-5 h-5 text-[#FF5500]" />
              </div>
              <h3 className="font-extrabold text-lg text-[#111111] mb-3">{col1.title}</h3>
              <p className="text-[#6B7280] text-sm leading-relaxed">{col1.description}</p>
            </div>
            {/* Mini validation UI */}
            <div className="mt-8 bg-[#F5F5F3] rounded-xl p-4 border border-[#E8E8E8]">
              <div className="text-[10px] font-bold tracking-widest uppercase text-[#9CA3AF] mb-3">Validation en direct</div>
              <div className="space-y-2">
                {["Sophie D.", "Marc L.", "Aïcha B."].map((name, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-xs text-[#374151] font-semibold">{name}</span>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                      <span className="text-[10px] text-[#6B7280] font-medium">GPS ✓</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Row 1 — Fiches d'urgence + WhatsApp */}
          {/* Fiches d'urgence */}
          <motion.div
            variants={item}
            whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 20 } }}
            className="bg-white border border-[#E8E8E8] rounded-2xl p-7 hover:border-[#D0D0D0] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-200 cursor-default"
          >
            <div className="w-10 h-10 bg-[#FF5500]/10 rounded-xl flex items-center justify-center mb-5">
              <col2.icon className="w-5 h-5 text-[#FF5500]" />
            </div>
            <h3 className="font-extrabold text-base text-[#111111] mb-2">{col2.title}</h3>
            <p className="text-sm leading-relaxed text-[#6B7280]">{col2.description}</p>
          </motion.div>

          {/* WhatsApp automatisé — Accent card avec chat bubbles */}
          <motion.div
            variants={item}
            whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 20 } }}
            className="bg-[#FF5500] border border-transparent rounded-2xl p-7 flex flex-col cursor-default"
          >
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-5">
              <col3a.icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-extrabold text-base text-white mb-2">{col3a.title}</h3>
            {/* Chat bubbles UI */}
            <div className="mt-auto pt-4 space-y-2">
              {WA_MESSAGES.map((msg, i) => (
                <div key={i} className={`flex ${msg.side === "right" ? "justify-end" : "justify-start"}`}>
                  <div className={`text-[10px] font-medium px-3 py-1.5 rounded-2xl max-w-[90%] leading-relaxed ${
                    msg.side === "right"
                      ? "bg-white text-[#FF5500] font-bold rounded-br-sm"
                      : "bg-white/20 text-white rounded-bl-sm"
                  }`}>{msg.text}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Liste d'attente — col 4, row 1 */}
          <motion.div
            variants={item}
            whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 20 } }}
            className="bg-white border border-[#E8E8E8] rounded-2xl p-7 hover:border-[#D0D0D0] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-200 cursor-default"
          >
            <div className="w-10 h-10 bg-[#FF5500]/10 rounded-xl flex items-center justify-center mb-5">
              <col3b.icon className="w-5 h-5 text-[#FF5500]" />
            </div>
            <h3 className="font-extrabold text-base text-[#111111] mb-2">{col3b.title}</h3>
            <p className="text-sm leading-relaxed text-[#6B7280]">{col3b.description}</p>
          </motion.div>

          {/* Row 2 — Système Anti-Fantôme */}
          <motion.div
            variants={item}
            whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 20 } }}
            className="bg-white border border-[#E8E8E8] rounded-2xl p-7 hover:border-[#D0D0D0] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-200 cursor-default"
          >
            <div className="w-10 h-10 bg-[#FF5500]/10 rounded-xl flex items-center justify-center mb-5">
              <col4a.icon className="w-5 h-5 text-[#FF5500]" />
            </div>
            <h3 className="font-extrabold text-base text-[#111111] mb-2">{col4a.title}</h3>
            <p className="text-sm leading-relaxed text-[#6B7280]">{col4a.description}</p>
          </motion.div>

          {/* Revenus Spots */}
          <motion.div
            variants={item}
            whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 20 } }}
            className="bg-white border border-[#E8E8E8] rounded-2xl p-7 hover:border-[#D0D0D0] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-200 cursor-default"
          >
            <div className="w-10 h-10 bg-[#FF5500]/10 rounded-xl flex items-center justify-center mb-5">
              <col4b.icon className="w-5 h-5 text-[#FF5500]" />
            </div>
            <h3 className="font-extrabold text-base text-[#111111] mb-2">{col4b.title}</h3>
            <p className="text-sm leading-relaxed text-[#6B7280]">{col4b.description}</p>
          </motion.div>

          {/* Stat card — 14j */}
          <motion.div
            variants={item}
            whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 20 } }}
            className="bg-[#111111] rounded-2xl p-7 flex flex-col justify-between cursor-default"
          >
            <div className="text-[52px] font-extrabold text-white leading-none">
              0<span className="text-[#FF5500]">€</span>
            </div>
            <div>
              <div className="text-white font-bold text-base mb-1">Pour toujours</div>
              <div className="text-white/50 text-sm">Gratuit. Passe Pro quand tu veux.</div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
