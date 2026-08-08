"use client";

import React from "react";
import { motion } from "framer-motion";

export function HowItWorks() {
  return (
    <section className="py-16 px-5 bg-white text-center" id="features">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
        className="max-w-[736px] mx-auto"
      >
        <p
          className="text-[#1C1B18] mb-6 uppercase"
          style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.72px" }}
        >
          Comment ça marche
        </p>

        <h2
          className="text-[#1C1B18] leading-[1.06] mb-5"
          style={{ fontSize: "40px", fontWeight: 1000, letterSpacing: "-1.6px" }}
        >
          La sérénité d&apos;un club pro.{" "}
          La liberté d&apos;un crew informel.
        </h2>

        <p
          className="text-[#6B6A6A] leading-snug mb-8 max-w-lg mx-auto"
          style={{ fontSize: "20px", fontWeight: 500, letterSpacing: "-0.4px" }}
        >
          Centralise tes sorties, sécurise tes membres et génère des revenus pour ton club.
          Tout est géré au même endroit, sans imposer la moindre application à ta communauté.
        </p>

        <a
          href="/login?mode=signup"
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF5500] text-white hover:bg-[#E04B00] transition-colors"
          style={{ fontSize: "20px", fontWeight: 500, letterSpacing: "-0.4px", padding: "10px 24px" }}
        >
          Lancer mon crew →
        </a>
      </motion.div>
    </section>
  );
}
