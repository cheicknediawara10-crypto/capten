"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

export function Hero() {
  return (
    <section className="pt-28 pb-16 px-5 text-center bg-white">
      {/* Label */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="text-[13px] font-medium text-[#6B6A6A] mb-6 flex items-center justify-center gap-1.5 flex-wrap"
      >
        Le logiciel de gestion des fondateurs de Run Clubs, Walk Social, Rando &amp; Trail
        <span className="inline-flex items-center gap-1 text-[#FF5500] font-semibold">
          <Star className="w-3 h-3 fill-[#FF5500] shrink-0" />
          100 % Web
        </span>
      </motion.p>

      {/* H1 */}
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="text-[#1C1B18] leading-[1.06] max-w-3xl mx-auto mb-8"
        style={{
          fontSize: "clamp(36px, 5vw, 48px)",
          fontWeight: 1000,
          letterSpacing: "-1.92px",
        }}
      >
        Tu as créé ce crew pour partager une passion.{" "}
        Pas pour jouer les secrétaires.
      </motion.h1>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.12 }}
        className="flex items-center justify-center gap-3 flex-wrap"
      >
        <a
          href="/login?mode=signup"
          className="inline-flex items-center rounded-xl bg-[#FF5500] text-white hover:bg-[#E04B00] transition-colors"
          style={{ fontSize: "16px", fontWeight: 500, padding: "10px 20px" }}
        >
          Lancer mon crew
        </a>
        <a
          href="#features"
          className="inline-flex items-center rounded-xl bg-[#EEEEE4] text-[#1C1B18] hover:bg-[#E5E5DA] transition-colors"
          style={{ fontSize: "18px", fontWeight: 500, padding: "8px 20px" }}
        >
          Voir la démo en 1 min
        </a>
      </motion.div>
    </section>
  );
}
