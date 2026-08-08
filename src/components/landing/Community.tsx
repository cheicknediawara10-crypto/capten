"use client";

import React from "react";
import { Container } from "./Container";
import { motion } from "framer-motion";

const AVATARS = [
  "https://images.pexels.com/photos/7648372/pexels-photo-7648372.jpeg?auto=compress&cs=tinysrgb&w=100",
  "https://images.pexels.com/photos/6777241/pexels-photo-6777241.jpeg?auto=compress&cs=tinysrgb&w=100",
  "https://images.pexels.com/photos/6777248/pexels-photo-6777248.jpeg?auto=compress&cs=tinysrgb&w=100",
  "https://images.pexels.com/photos/6767341/pexels-photo-6767341.jpeg?auto=compress&cs=tinysrgb&w=100",
  "https://images.pexels.com/photos/6764617/pexels-photo-6764617.jpeg?auto=compress&cs=tinysrgb&w=100",
];

const PILLS = ["Check-in GPS", "Fiche d'urgence", "Spots Partenaires"];

export function Community() {
  return (
    <section className="relative bg-[#F7F7F4] py-28 overflow-hidden">

      {/* Giant watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <span className="text-[100px] sm:text-[160px] lg:text-[210px] font-extrabold text-[#0C0C0A]/4 uppercase tracking-tight whitespace-nowrap leading-none">
          RUN COMMUNITY
        </span>
      </div>

      <Container className="relative z-10 max-w-4xl mx-auto text-center">

        {/* Pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}
          className="flex items-center justify-center gap-2 mb-10"
        >
          {PILLS.map((p, i) => (
            <span key={i} className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold ${
              i === 1
                ? "bg-[#FF5500] text-white"
                : "bg-white border border-[#E0E0D8] text-[#0C0C0A]/50"
            }`}>
              {p}
            </span>
          ))}
        </motion.div>

        {/* Text */}
        <motion.p
          initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.1 }}
          className="text-[#0C0C0A] text-lg sm:text-2xl font-semibold leading-relaxed max-w-2xl mx-auto mb-12"
        >
          La performance, c'est bien plus qu'une montre GPS — c'est la communication, la passion et l'impact. CAPTEN aide les fondateurs de Run Clubs à se concentrer sur l'essentiel.
        </motion.p>

        {/* Avatars */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.2 }}
          className="flex items-center justify-center gap-3"
        >
          {AVATARS.map((src, i) => (
            <img key={i} src={src} alt="Captain"
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md" />
          ))}
          <span className="ml-2 text-sm font-bold text-[#0C0C0A]/35">+480 capitaines</span>
        </motion.div>

      </Container>
    </section>
  );
}
