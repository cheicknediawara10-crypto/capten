"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const POINTS = ["Sans app à installer", "Sans compte à créer", "20 secondes chrono"];

export function RunnerExperience() {
  return (
    <section className="py-16 px-5 bg-[#FAFAF8]">
      <div className="max-w-[1000px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Copy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <p className="text-[#FF5500] mb-4 uppercase" style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.72px" }}>
            Côté coureur
          </p>
          <h2 className="text-[#1C1B18] leading-[1.08] mb-4" style={{ fontSize: "34px", fontWeight: 1000, letterSpacing: "-1.4px" }}>
            Tes coureurs jouent le jeu. Vraiment.
          </h2>
          <p className="text-[#6B6A6A] leading-snug mb-6" style={{ fontSize: "18px", fontWeight: 500 }}>
            Le frein n°1 d&apos;un outil, c&apos;est que personne ne s&apos;en sert. Avec Capten, tes coureurs
            s&apos;inscrivent depuis ton lien en 20 secondes — prénom, date de naissance, un code PIN, et c&apos;est réglé.
            Même ton pote de 55 ans le fait sans t&apos;appeler.
          </p>
          <ul className="flex flex-col gap-2.5">
            {POINTS.map((p) => (
              <li key={p} className="inline-flex items-center gap-2.5 text-[15px] font-semibold text-[#1C1B18]">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#FF5500]/[0.12]">
                  <Check className="w-3 h-3 text-[#FF5500]" strokeWidth={3.5} />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Mock écran mobile d'inscription (ce que le coureur voit) */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="justify-self-center w-full max-w-[300px]"
        >
          <div className="rounded-[26px] border border-[#E8E8E8] bg-white p-3 shadow-[0_30px_60px_-24px_rgba(28,27,24,0.28)]">
            <div className="rounded-[18px] bg-[#FAFAF8] border border-[#F0F0EC] p-5">
              {/* Header club */}
              <div className="flex items-center gap-2.5 mb-5">
                <span className="w-9 h-9 rounded-xl bg-[#FF5500]/[0.1] flex items-center justify-center text-[#FF5500] text-[15px] font-black">D</span>
                <div className="min-w-0">
                  <p className="text-[13px] font-extrabold text-[#1C1B18] leading-none">DIAWARA CLUB</p>
                  <p className="text-[10px] text-[#A3A19A] mt-1">Rejoindre le crew</p>
                </div>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#A3A19A] mb-3">Étape 1 / 4 · Tes infos</p>
              {/* Champs factices */}
              <div className="space-y-2.5">
                {["Prénom", "Nom", "Date de naissance"].map((f) => (
                  <div key={f} className="rounded-xl bg-white border border-[#EEEDE7] px-3 py-2.5">
                    <p className="text-[9px] uppercase tracking-wider text-[#B0ADA6]">{f}</p>
                    <div className="h-2.5 mt-1.5 rounded bg-[#F0F0EC]" style={{ width: f === "Date de naissance" ? "55%" : "72%" }} />
                  </div>
                ))}
              </div>
              <div className="mt-4 h-10 rounded-xl bg-[#FF5500] flex items-center justify-center text-white text-[12px] font-bold">
                Continuer
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
