"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

const FEATURES = [
  "Fiche d'urgence accessible en 1 clic",
  "Registre horodaté automatique par GPS",
  "Rappels automatiques avant chaque départ",
  "1 seul lien fixe partagé dans le groupe",
  "100 % Web (0 application à installer)",
  "Historique complet et archives des runs",
  "Les Spots du Crew — Tes adresses, tes avantages",
];

const SHADOW =
  "rgba(37,38,29,0.15) 0px 0.84px 0.84px -0.47px, rgba(37,38,29,0.15) 0px 1.99px 1.99px -0.94px, rgba(37,38,29,0.14) 0px 3.63px 3.63px -1.41px, rgba(37,38,29,0.14) 0px 6.04px 6.04px -1.88px, rgba(37,38,29,0.13) 0px 9.75px 9.75px -2.34px, rgba(37,38,29,0.12) 0px 15.96px 15.96px -2.81px, rgba(37,38,29,0.1) 0px 27.48px 27.48px -3.28px, rgba(37,38,29,0.05) 0px 50px 50px -3.75px";

const SHADE_L = "rgba(37,38,29,0.05)";
const SHADE_R = "rgba(251,252,242,0.05)";
const ROW_H = 72;
const HEADER_H = 80;
const CTA_H = 94;
const SIDE_H = HEADER_H + FEATURES.length * ROW_H; // 584px
const CENTER_H = SIDE_H + CTA_H; // 678px

export function WhyCapten() {
  return (
    <section className="py-16 px-5 bg-white" id="spots">
      <div className="max-w-[1100px] mx-auto">
        {/* Heading — left-aligned, max 640px */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="mb-10 text-center mx-auto"
          style={{ maxWidth: "640px" }}
        >
          <h2
            className="text-[#1C1B18] leading-tight mb-4"
            style={{ fontSize: "40px", fontWeight: 1000, letterSpacing: "-1.6px" }}
          >
            Pourquoi CAPTEN
          </h2>
          <p
            className="text-[#6B6A6A] leading-snug"
            style={{ fontSize: "20px", fontWeight: 500, letterSpacing: "-0.4px" }}
          >
            CAPTEN s&apos;ajoute à ton groupe WhatsApp existant pour apporter la
            sécurité, la géolocalisation et l&apos;identité locale de ton crew. Zéro
            changement d&apos;habitude pour tes membres.
          </p>
        </motion.div>

        {/* Comparison — 3-column flex, center card floats */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="hidden lg:flex items-start mx-auto"
          style={{ maxWidth: "960px" }}
        >
          {/* LEFT — feature name column */}
          <div
            className="flex flex-col"
            style={{ width: "320px", height: `${SIDE_H}px` }}
          >
            {/* Header placeholder (shaded to match visual rhythm) */}
            <div style={{ height: `${HEADER_H}px`, display: "flex", alignItems: "flex-end" }}>
              <div
                style={{
                  width: "100%",
                  height: `${ROW_H}px`,
                  background: SHADE_L,
                  borderRadius: "12px 0 0 12px",
                }}
              />
            </div>
            {/* Feature rows */}
            {FEATURES.map((feat, i) => (
              <div
                key={feat}
                style={{
                  height: `${ROW_H}px`,
                  background: i % 2 === 0 ? SHADE_L : "transparent",
                  borderRadius: "12px 0 0 12px",
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: "20px",
                  paddingRight: "12px",
                }}
              >
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: 500,
                    color: "#1C1B18",
                    lineHeight: 1.4,
                  }}
                >
                  {feat}
                </span>
              </div>
            ))}
          </div>

          {/* CENTER — dark floating card */}
          <div
            style={{
              width: "320px",
              height: `${CENTER_H}px`,
              background: "rgb(28,27,24)",
              borderRadius: "24px",
              boxShadow: SHADOW,
              position: "relative",
              zIndex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* Logo header */}
            <div
              style={{
                height: `${HEADER_H}px`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                src="/logo.png"
                alt="CAPTEN"
                width={120}
                height={38}
                className="h-[38px] w-auto brightness-0 invert"
                priority
              />
            </div>

            {/* Checkmark rows */}
            {FEATURES.map((feat, i) => (
              <div
                key={feat}
                style={{
                  width: "100%",
                  height: `${ROW_H}px`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "#FF5500",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Check
                    style={{ width: "13px", height: "13px", color: "white", strokeWidth: 2.5 }}
                  />
                </span>
              </div>
            ))}

            {/* CTA */}
            <div
              style={{
                height: `${CTA_H}px`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                paddingLeft: "24px",
                paddingRight: "24px",
              }}
            >
              <a
                href="/login?mode=signup"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "12px",
                  background: "#EEEEE4",
                  color: "#1C1B18",
                  fontSize: "20px",
                  fontWeight: 500,
                  letterSpacing: "-0.4px",
                  padding: "12px 16px",
                  whiteSpace: "nowrap",
                  textDecoration: "none",
                  width: "100%",
                }}
              >
                Lancer mon crew
              </a>
            </div>
          </div>

          {/* RIGHT — "Ton dimanche soir" column */}
          <div
            className="flex flex-col"
            style={{ width: "320px", height: `${SIDE_H}px` }}
          >
            {/* Header with label */}
            <div
              style={{
                height: `${HEADER_H}px`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                paddingLeft: "12px",
                paddingRight: "20px",
              }}
            >
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: 500,
                  color: "#6B6A6A",
                  textAlign: "center",
                  lineHeight: 1.4,
                }}
              >
                Ton dimanche soir
              </span>
            </div>
            {/* X rows */}
            {FEATURES.map((feat, i) => (
              <div
                key={feat}
                style={{
                  height: `${ROW_H}px`,
                  background: i % 2 === 0 ? SHADE_R : "transparent",
                  borderRadius: "0 12px 12px 0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X style={{ width: "16px", height: "16px", color: "#B0ACAA", strokeWidth: 2 }} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Version mobile — liste empilée (hauteurs auto, zéro chevauchement) */}
        <div className="lg:hidden max-w-md mx-auto">
          <div style={{ background: "rgb(28,27,24)", borderRadius: "24px", boxShadow: SHADOW }} className="p-6">
            <div className="flex items-center justify-center mb-5">
              <Image
                src="/logo.png"
                alt="CAPTEN"
                width={110}
                height={34}
                className="h-[34px] w-auto brightness-0 invert"
              />
            </div>
            <ul className="space-y-3.5">
              {FEATURES.map((feat) => (
                <li key={feat} className="flex items-start gap-3">
                  <span
                    style={{ background: "#FF5500" }}
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  >
                    <Check style={{ width: "13px", height: "13px", color: "white", strokeWidth: 2.5 }} />
                  </span>
                  <span className="text-white text-[15px] font-medium leading-snug">{feat}</span>
                </li>
              ))}
            </ul>
            <a
              href="/login?mode=signup"
              style={{ background: "#EEEEE4", color: "#1C1B18" }}
              className="mt-6 block text-center rounded-xl py-3.5 text-[17px] font-medium"
            >
              Lancer mon crew
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
