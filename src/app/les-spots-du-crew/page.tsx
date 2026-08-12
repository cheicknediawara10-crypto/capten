"use client";

import React from "react";
import { motion } from "framer-motion";
import { Coffee, Footprints, Activity, Gift, ShieldCheck, MapPin, Plus, Share2 } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

const SPOTS = [
  { Icon: Coffee, cat: "Café", nom: "Le café du coin", mot: "Notre QG d'après-run", avantage: "-10% sur présentation de la page Capten" },
  { Icon: Footprints, cat: "Shop running", nom: "Ton shop running", mot: "Où on achète tous nos pompes", avantage: "Conseils perso pour les membres du crew" },
  { Icon: Activity, cat: "Kiné", nom: "Le kiné du quartier", mot: "Celui qui connaît tous nos bobos", avantage: "Créneaux prioritaires pour le crew" },
];

const STEPS = [
  { Icon: Plus, title: "Tu ajoutes tes adresses", desc: "Café, shop, kiné, ostéo… depuis ton espace, en 30 secondes. Tu écris un mot et l'avantage que tu as négocié à l'oral." },
  { Icon: Share2, title: "Ton crew les découvre", desc: "Les spots apparaissent sur ta page d'inscription et sur la fiche de chaque membre. Aucune app à installer." },
  { Icon: ShieldCheck, title: "Zéro finance, zéro friction", desc: "Capten n'encaisse rien et ne prend aucune commission. L'avantage est appliqué à l'oral par le commerçant — on affiche juste l'info." },
];

export default function LesSpotsDuCrewPage() {
  return (
    <div className="min-h-screen bg-white text-[#111111] font-sans antialiased">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-14 px-5 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="text-[#FF5500] mb-4 uppercase" style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.9px" }}
        >
          Recommandé par ton crew
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
          className="text-[#1C1B18] leading-[1.05] max-w-2xl mx-auto mb-5"
          style={{ fontSize: "clamp(34px, 5vw, 48px)", fontWeight: 1000, letterSpacing: "-1.8px" }}
        >
          Les Spots du Crew
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
          className="text-[#6B6A6A] max-w-xl mx-auto mb-8"
          style={{ fontSize: "19px", fontWeight: 500, letterSpacing: "-0.3px", lineHeight: 1.5 }}
        >
          Le café d&apos;après-run, le shop, le kiné — le territoire de ton crew.
          Tes bonnes adresses et les avantages que tu as négociés, réunis au même endroit.
        </motion.p>
        <motion.a
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.15 }}
          href="/login?mode=signup"
          className="inline-flex items-center justify-center h-12 px-7 rounded-xl bg-[#FF5500] text-white text-[16px] font-semibold hover:bg-[#E04B00] transition-colors shadow-[0_8px_24px_rgba(255,85,0,0.25)]"
        >
          Lancer mon crew
        </motion.a>
      </section>

      {/* Exemples de spots */}
      <section className="px-5 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-[960px] mx-auto">
          {SPOTS.map((s, i) => (
            <motion.div
              key={s.nom}
              initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.09 }}
              className="group bg-white rounded-[22px] border border-[#EAE9E2] p-6 flex flex-col hover:border-[#D8D6CC] hover:-translate-y-1 hover:shadow-[0_16px_40px_-12px_rgba(28,27,24,0.12)] transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-[16px] bg-[#FF5500]/[0.08] flex items-center justify-center">
                  <s.Icon className="w-[22px] h-[22px] text-[#FF5500]" strokeWidth={2} />
                </div>
                <span className="text-[#A3A19A] uppercase" style={{ fontSize: "10.5px", fontWeight: 700, letterSpacing: "1px" }}>{s.cat}</span>
              </div>
              <h3 className="text-[#1C1B18] leading-tight mb-1.5" style={{ fontSize: "19px", fontWeight: 800, letterSpacing: "-0.5px" }}>{s.nom}</h3>
              <p className="text-[#8A8880] italic leading-snug" style={{ fontSize: "13.5px", fontWeight: 500 }}>« {s.mot} »</p>
              <div className="h-px bg-[#EFEEE7] my-5" />
              <div className="flex items-start gap-2.5 mt-auto">
                <span className="w-7 h-7 rounded-full bg-[#FF5500]/10 flex items-center justify-center shrink-0">
                  <Gift className="w-3.5 h-3.5 text-[#FF5500]" strokeWidth={2.2} />
                </span>
                <span className="text-[#3A3833] leading-snug pt-0.5" style={{ fontSize: "13.5px", fontWeight: 600 }}>{s.avantage}</span>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#FAFAF8] border border-[#E8E7E0] px-4 py-2">
            <ShieldCheck className="w-4 h-4 text-[#9CA3AF] shrink-0" strokeWidth={2} />
            <p style={{ fontSize: "13px", fontWeight: 500 }}>
              <span className="text-[#1C1B18] font-semibold">Zéro paiement, zéro commission</span>
              <span className="text-[#8A8880]"> — juste les bonnes adresses de ton crew.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="px-5 py-20">
        <div className="max-w-[1000px] mx-auto">
          <h2 className="text-center text-[#1C1B18] mb-14" style={{ fontSize: "clamp(28px, 4vw, 38px)", fontWeight: 1000, letterSpacing: "-1.2px" }}>
            Comment ça marche
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#FF5500]/[0.08] flex items-center justify-center mx-auto mb-4">
                  <s.Icon className="w-6 h-6 text-[#FF5500]" strokeWidth={2} />
                </div>
                <h3 className="text-[#1C1B18] mb-2" style={{ fontSize: "18px", fontWeight: 800, letterSpacing: "-0.4px" }}>{s.title}</h3>
                <p className="text-[#6B6A6A] leading-snug" style={{ fontSize: "15px", fontWeight: 500 }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="px-5 pb-24">
        <div className="max-w-[860px] mx-auto rounded-[28px] bg-[#1C1B18] text-center px-6 py-14">
          <h2 className="text-white mb-3" style={{ fontSize: "clamp(26px, 4vw, 34px)", fontWeight: 1000, letterSpacing: "-1px" }}>
            Donne un territoire à ton crew
          </h2>
          <p className="text-white/60 max-w-md mx-auto mb-7" style={{ fontSize: "17px", fontWeight: 500 }}>
            Les Spots sont dispos sur tous les plans, gratuit compris.
          </p>
          <a
            href="/login?mode=signup"
            className="inline-flex items-center justify-center h-12 px-8 rounded-xl bg-[#FF5500] text-white text-[16px] font-semibold hover:bg-[#E04B00] transition-colors"
          >
            Lancer mon crew
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
