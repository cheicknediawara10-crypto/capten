"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const REASSURANCE = ["Sans carte bancaire", "Sans app à installer", "Prêt en 2 minutes"];

export function Hero() {
  return (
    <section className="pt-28 pb-12 px-5 text-center bg-white overflow-hidden">
      {/* Label */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="text-[13px] font-medium text-[#6B6A6A] mb-6 flex items-center justify-center gap-1.5 flex-wrap"
      >
        Le logiciel des fondateurs de Run Clubs
      </motion.p>

      {/* H1 */}
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="text-[#1C1B18] leading-[1.06] max-w-3xl mx-auto mb-5"
        style={{ fontSize: "clamp(36px, 5vw, 48px)", fontWeight: 1000, letterSpacing: "-1.92px" }}
      >
        Tu as créé ce crew pour partager une passion.{" "}
        Pas pour jouer les secrétaires.
      </motion.h1>

      {/* Sous-titre value prop */}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="text-[#6B6A6A] max-w-xl mx-auto mb-8"
        style={{ fontSize: "18px", fontWeight: 500, letterSpacing: "-0.3px", lineHeight: 1.5 }}
      >
        Fini les 200 messages WhatsApp et les Google Forms avant chaque run.
        Inscriptions, présences GPS, fiches d&apos;urgence, registre légal : Capten
        automatise toute la logistique de ton crew — tes coureurs n&apos;ont rien à
        installer. Toi, tu cours.
      </motion.p>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        className="flex items-center justify-center gap-3 flex-wrap"
      >
        <a
          href="/login?mode=signup"
          className="inline-flex items-center justify-center h-12 px-7 rounded-xl bg-[#FF5500] text-white text-[16px] font-semibold hover:bg-[#E04B00] transition-colors shadow-[0_8px_24px_rgba(255,85,0,0.25)]"
        >
          Lancer mon crew
        </a>
        <a
          href="#features"
          className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-[#F4F4EE] text-[#1C1B18] text-[16px] font-semibold hover:bg-[#E9E9DE] transition-colors"
        >
          Voir comment ça marche
        </a>
      </motion.div>

      {/* Micro-réassurance */}
      <motion.ul
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="flex items-center justify-center gap-2.5 flex-wrap mt-7"
      >
        {REASSURANCE.map((r) => (
          <li
            key={r}
            className="inline-flex items-center gap-2 rounded-full bg-[#FAFAF8] border border-[#EAE9E2] pl-2 pr-3.5 py-1.5 text-[13px] font-semibold text-[#52514E]"
          >
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#FF5500]/[0.12]">
              <Check className="w-2.5 h-2.5 text-[#FF5500]" strokeWidth={3.5} />
            </span>
            {r}
          </li>
        ))}
      </motion.ul>

      {/* Visuel produit — preuve immédiate */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative max-w-5xl mx-auto mt-14"
      >
        <div className="rounded-[20px] border border-[#E8E8E8] bg-white shadow-[0_40px_80px_-24px_rgba(28,27,24,0.22)] overflow-hidden">
          {/* Barre de fenêtre */}
          <div className="flex items-center gap-1.5 px-4 h-9 border-b border-[#F0F0EC] bg-[#FAFAF8]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E4E3DC]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#E4E3DC]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#E4E3DC]" />
            <span className="ml-3 text-[11px] font-mono text-[#B0ADA6]">capten.app/dashboard</span>
          </div>
          {/* Mock produit — reflète le produit actuel (aucune feature supprimée) */}
          <div className="flex text-left bg-[#FAFAF8] min-h-[300px] sm:min-h-[380px]">
            {/* Mini sidebar */}
            <div className="hidden sm:flex w-[164px] shrink-0 flex-col gap-1 bg-white border-r border-[#F0F0EC] py-5 px-3">
              <div className="flex items-center gap-2 px-2 mb-4">
                <Image src="/logo.png" alt="" width={70} height={20} className="h-5 w-auto" />
              </div>
              {[
                { l: "Dashboard", active: true },
                { l: "Crew" }, { l: "Runs" }, { l: "Messages" },
                { l: "Spots" }, { l: "Cagnotte" },
              ].map((i) => (
                <div key={i.l} className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium ${i.active ? "bg-[#FF5500]/[0.08] text-[#FF5500]" : "text-[#8A8880]"}`}>
                  <span className={`w-3.5 h-3.5 rounded ${i.active ? "bg-[#FF5500]/30" : "bg-[#E4E3DC]"}`} />
                  {i.l}
                </div>
              ))}
            </div>

            {/* Main */}
            <div className="flex-1 p-5 sm:p-7 min-w-0">
              <p className="text-[11px] text-[#A3A19A]">Salut Captain 👋</p>
              <h3 className="font-display italic font-black uppercase text-[#1C1B18] text-[22px] sm:text-[30px] leading-none tracking-tight mt-0.5 mb-5">
                Mon Crew
              </h3>

              <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-5">
                {[
                  { n: "24", l: "Membres" }, { n: "8", l: "Runs" }, { n: "156", l: "Check-ins" },
                ].map((s) => (
                  <div key={s.l} className="rounded-xl bg-white border border-[#EEEDE7] p-3 sm:p-4">
                    <div className="w-6 h-6 rounded-md bg-[#FF5500]/[0.08] mb-2" />
                    <p className="font-display italic font-black text-[#1C1B18] text-[22px] sm:text-[28px] leading-none">{s.n}</p>
                    <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#A3A19A] mt-1">{s.l}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-white border border-[#EEEDE7] divide-y divide-[#F2F1EB]">
                {[
                  { t: "Run du jeudi · République", d: "Jeu. 19:00 · 8 km" },
                  { t: "Sortie longue · Canal", d: "Dim. 09:30 · 15 km" },
                ].map((r) => (
                  <div key={r.t} className="flex items-center gap-3 p-3">
                    <span className="w-8 h-8 rounded-lg bg-[#F4F4EE] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold text-[#1C1B18] truncate">{r.t}</p>
                      <p className="text-[10px] text-[#A3A19A]">{r.d}</p>
                    </div>
                    <span className="ml-auto text-[9px] font-bold uppercase tracking-wider text-[#FF5500] bg-[#FF5500]/[0.08] px-2 py-0.5 rounded-full shrink-0">Publié</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Fondu bas pour ancrer dans la page */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </motion.div>
    </section>
  );
}
