"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

const SHADOW =
  "rgba(37,38,29,0.15) 0px 0.84px 0.84px -0.47px, rgba(37,38,29,0.15) 0px 1.99px 1.99px -0.94px, rgba(37,38,29,0.14) 0px 3.63px 3.63px -1.41px, rgba(37,38,29,0.14) 0px 6.04px 6.04px -1.88px, rgba(37,38,29,0.13) 0px 9.75px 9.75px -2.34px, rgba(37,38,29,0.12) 0px 15.96px 15.96px -2.81px, rgba(37,38,29,0.1) 0px 27.48px 27.48px -3.28px, rgba(37,38,29,0.05) 0px 50px 50px -3.75px";

const FREE: { label: string; ok: boolean }[] = [
  { label: "1 session par mois", ok: true },
  { label: "Jusqu'à 20 membres", ok: true },
  { label: "Lien d'inscription unique", ok: true },
  { label: "Tableau de bord basique", ok: true },
  { label: "Check-in GPS", ok: false },
  { label: "WhatsApp automatisé", ok: false },
  { label: "Les Spots du Crew", ok: false },
];

const PRO = [
  "Membres & sessions illimités",
  "Check-in GPS natif",
  "WhatsApp automatisé (200 msg/mois)",
  "Fiches ICE",
  "Registre légal horodaté (PDF/CSV)",
  "Les Spots du Crew illimités",
  "Support prioritaire",
];

export function Pricing() {
  return (
    <section className="py-20 px-5 bg-white" id="tarifs">
      <div className="max-w-[1100px] mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="text-center mb-14"
        >
          <p
            className="text-[#1C1B18] mb-5 uppercase"
            style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.72px" }}
          >
            Tarifs
          </p>
          <h2
            className="text-[#1C1B18] leading-tight mb-4"
            style={{ fontSize: "40px", fontWeight: 1000, letterSpacing: "-1.6px" }}
          >
            Simple. Transparent. Sans surprise.
          </h2>
          <p
            className="text-[#6B6A6A] max-w-lg mx-auto leading-snug"
            style={{ fontSize: "20px", fontWeight: 500, letterSpacing: "-0.4px" }}
          >
            Commence gratuitement jusqu'à ton Aha Moment, passe Pro quand tu es prêt.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="flex flex-col sm:flex-row items-stretch gap-6 max-w-[860px] mx-auto">

          {/* Découverte */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="flex-1 flex flex-col rounded-3xl border border-[#E8E6E3] bg-[#FAFAF8] p-8"
          >
            <div className="mb-6">
              <span
                className="inline-block bg-[#ECECEA] text-[#6B6A6A] rounded-full px-3 py-1 mb-5"
                style={{ fontSize: "13px", fontWeight: 600 }}
              >
                Découverte
              </span>
              <div className="flex items-end gap-1 mb-2">
                <span
                  className="text-[#1C1B18] leading-none"
                  style={{ fontSize: "52px", fontWeight: 1000, letterSpacing: "-2px" }}
                >
                  Gratuit
                </span>
              </div>
              <p className="text-[#B0ACAA]" style={{ fontSize: "15px", fontWeight: 500 }}>
                Pour toujours
              </p>
            </div>

            <ul className="flex flex-col gap-3.5 mb-8 flex-1">
              {FREE.map((f) => (
                <li key={f.label} className="flex items-center gap-3">
                  {f.ok ? (
                    <span className="w-5 h-5 rounded-full bg-[#ECECEA] flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-[#6B6A6A]" strokeWidth={2.5} />
                    </span>
                  ) : (
                    <span className="w-5 h-5 flex items-center justify-center shrink-0">
                      <X className="w-3.5 h-3.5 text-[#C0BCBA]" strokeWidth={2} />
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: 500,
                      color: f.ok ? "#1C1B18" : "#C0BCBA",
                    }}
                  >
                    {f.label}
                  </span>
                </li>
              ))}
            </ul>

            <a
              href="/login?mode=signup"
              className="w-full inline-flex items-center justify-center rounded-xl bg-[#EEEEE4] text-[#1C1B18] hover:bg-[#E5E5DA] transition-colors"
              style={{ fontSize: "16px", fontWeight: 600, padding: "13px 24px" }}
            >
              Commencer gratuitement
            </a>
          </motion.div>

          {/* Captain Pro */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="flex-1 flex flex-col rounded-3xl p-8"
            style={{ background: "rgb(28,27,24)", boxShadow: SHADOW }}
          >
            <div className="mb-6">
              <span
                className="inline-block bg-[#FF5500] text-white rounded-full px-3 py-1 mb-5"
                style={{ fontSize: "13px", fontWeight: 600 }}
              >
                Captain Pro
              </span>
              <div className="flex items-end gap-1.5 mb-2">
                <span
                  className="text-white leading-none"
                  style={{ fontSize: "52px", fontWeight: 1000, letterSpacing: "-2px" }}
                >
                  29€
                </span>
                <span
                  className="text-white/40 mb-2"
                  style={{ fontSize: "18px", fontWeight: 500 }}
                >
                  /mois
                </span>
              </div>
              <p className="text-white/40" style={{ fontSize: "15px", fontWeight: 500 }}>
                Sans engagement · résiliable à tout moment
              </p>
            </div>

            <ul className="flex flex-col gap-3.5 mb-8 flex-1">
              {PRO.map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#FF5500] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-white" strokeWidth={2.5} />
                  </span>
                  <span style={{ fontSize: "16px", fontWeight: 500, color: "rgba(255,255,255,0.8)" }}>
                    {f}
                  </span>
                </li>
              ))}
            </ul>

            <a
              href="/login?mode=signup"
              className="w-full inline-flex items-center justify-center rounded-xl bg-[#FF5500] text-white hover:bg-[#E04B00] transition-colors"
              style={{ fontSize: "16px", fontWeight: 600, padding: "13px 24px" }}
            >
              Lancer mon crew
            </a>

            <p className="text-white/30 text-center mt-3" style={{ fontSize: "13px", fontWeight: 500 }}>
              Paiement Stripe sécurisé · RGPD compliant
            </p>
          </motion.div>
        </div>

        {/* Aha Moment callout */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="max-w-[860px] mx-auto mt-5 rounded-2xl border border-[#EBEBEB] bg-[#FAFAF8] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3"
        >
          <p className="text-[#6B6A6A]" style={{ fontSize: "14px", fontWeight: 500 }}>
            Le paywall se déclenche au <strong className="text-[#1C1B18]">21ème membre</strong> ou à la <strong className="text-[#1C1B18]">première activation GPS</strong> — tu découvres la valeur avant de payer.
          </p>
          <div className="flex gap-2 shrink-0">
            <span className="bg-[#EEEEE4] text-[#6B6A6A] px-2.5 py-1 rounded-lg text-xs font-bold">21e membre</span>
            <span className="bg-[#EEEEE4] text-[#6B6A6A] px-2.5 py-1 rounded-lg text-xs font-bold">GPS activé</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
