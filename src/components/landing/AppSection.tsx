"use client";

import React from "react";
import { Container } from "./Container";
import { motion } from "framer-motion";
import { Check, Clock, Users, MapPin } from "lucide-react";

const MEMBERS = [
  { name: "Aïcha B.", time: "20:31", status: "present" },
  { name: "Marc L.", time: "20:32", status: "present" },
  { name: "Sophie D.", time: "20:33", status: "present" },
  { name: "Thomas G.", time: "—", status: "waiting" },
];

export function AppSection() {
  return (
    <section className="py-24 bg-[#0C0C0A]">
      <Container className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left — Dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-[#111110] border border-white/8 rounded-3xl p-6 shadow-2xl"
          >
            {/* Mockup header */}
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/6">
              <div>
                <div className="text-[10px] font-bold tracking-widest uppercase text-white/30 mb-1">Mon Crew</div>
                <div className="text-sm font-extrabold text-white">Run du vendredi soir</div>
              </div>
              <div className="flex items-center gap-1.5 bg-[#FF5500]/15 border border-[#FF5500]/20 px-3 py-1.5 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-pulse" />
                <span className="text-[10px] font-bold text-[#FF5500]">Live</span>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { icon: Users, val: "18", label: "Présents" },
                { icon: Clock, val: "20:30", label: "Heure RDV" },
                { icon: MapPin, val: "GPS", label: "Validé" },
              ].map(({ icon: Icon, val, label }, i) => (
                <div key={i} className="bg-[#0C0C0A] border border-white/5 rounded-xl p-3 text-center">
                  <Icon className="w-3.5 h-3.5 text-[#FF5500] mx-auto mb-1.5" />
                  <div className="text-sm font-extrabold text-white">{val}</div>
                  <div className="text-[9px] text-white/30 font-medium">{label}</div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              {["Présents", "En attente", "Archives"].map((t, i) => (
                <button key={i} className={`px-3 py-1 rounded-full text-[10px] font-bold cursor-pointer ${
                  i === 0 ? "bg-[#FF5500] text-white" : "text-white/30"
                }`}>{t}</button>
              ))}
            </div>

            {/* Member list */}
            <div className="space-y-2">
              {MEMBERS.map((m, i) => (
                <div key={i} className="flex items-center justify-between bg-[#0C0C0A] border border-white/4 rounded-xl px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ${
                      m.status === "present" ? "bg-[#FF5500]/20 text-[#FF5500]" : "bg-white/6 text-white/30"
                    }`}>
                      {m.status === "present" ? <Check className="w-3 h-3" /> : "⏳"}
                    </div>
                    <span className="text-xs font-semibold text-white">{m.name}</span>
                  </div>
                  <span className="text-[10px] text-white/30 font-medium">{m.time}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — heading */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="w-6 h-px bg-[#FF5500]" />
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#FF5500]">Le cockpit</span>
            </div>
            <h2 className="font-extrabold text-4xl sm:text-5xl text-white leading-[1.05] tracking-tight mb-6">
              Suivi en temps réel.<br />
              <span className="text-white/25">Zéro stress.</span>
            </h2>
            <p className="text-white/40 text-sm font-medium leading-relaxed mb-8 max-w-sm">
              Ton cockpit CAPTEN centralise présences GPS, fiches d'urgence et statistiques du crew. Tu sais en 2 secondes qui est là, qui est en retard, et qui est en sécurité.
            </p>
            <div className="space-y-3">
              {[
                "Registre horodaté officiel",
                "Fiches d'urgence accessibles en 1 clic",
                "Rappels WhatsApp automatiques",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#FF5500]/20 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-[#FF5500]" />
                  </div>
                  <span className="text-sm text-white/60 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </Container>
    </section>
  );
}
