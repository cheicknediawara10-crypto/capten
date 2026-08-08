"use client";

import React, { useState } from "react";
import { Container } from "./Container";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const RUNNERS = [
  {
    src: "https://images.pexels.com/photos/10313668/pexels-photo-10313668.jpeg?auto=compress&cs=tinysrgb&w=600",
    name: "Sophie D.",
    club: "Paris West Runners",
    featured: false,
  },
  {
    src: "https://images.pexels.com/photos/7523360/pexels-photo-7523360.jpeg?auto=compress&cs=tinysrgb&w=600",
    name: "Marc L.",
    club: "Lyon Urban Crew",
    featured: true,
  },
  {
    src: "https://images.pexels.com/photos/8554979/pexels-photo-8554979.jpeg?auto=compress&cs=tinysrgb&w=600",
    name: "Aïcha B.",
    club: "Bordeaux Runners",
    featured: false,
  },
  {
    src: "https://images.pexels.com/photos/10313667/pexels-photo-10313667.jpeg?auto=compress&cs=tinysrgb&w=600",
    name: "Thomas G.",
    club: "Marseille Run Co",
    featured: false,
  },
];

const TABS = ["Tous", "Paris", "Lyon", "Marseille"];

export function CrewGrid() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="py-20 bg-[#0F0F0D]">
      <Container className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <span className="w-6 h-px bg-[#FF5500]" />
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#FF5500]">Ton crew</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            {TABS.map((t, i) => (
              <button key={i} onClick={() => setActiveTab(i)}
                className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  activeTab === i ? "bg-white text-[#0C0C0A]" : "text-white/30 hover:text-white"
                }`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Photo grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {RUNNERS.map((r, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="relative overflow-hidden rounded-2xl group"
              style={{ aspectRatio: "3/4" }}
            >
              <img src={r.src} alt={r.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0A]/80 via-transparent to-transparent" />

              {r.featured && (
                <div className="absolute bottom-4 left-4 right-4 bg-[#0C0C0A]/80 backdrop-blur-sm border border-white/10 rounded-xl p-3">
                  <div className="font-extrabold text-white text-sm">{r.name}</div>
                  <div className="text-white/50 text-[11px] font-medium">{r.club}</div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Arrow nav */}
        <div className="flex justify-end">
          <button className="w-10 h-10 rounded-full bg-[#FF5500] flex items-center justify-center hover:bg-[#E04B00] transition-colors cursor-pointer">
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>

      </Container>
    </section>
  );
}
