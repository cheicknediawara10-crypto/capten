"use client";

import React from "react";
import { Container } from "./Container";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const AVATARS = [
  "https://images.pexels.com/photos/7648372/pexels-photo-7648372.jpeg?auto=compress&cs=tinysrgb&w=80",
  "https://images.pexels.com/photos/6777241/pexels-photo-6777241.jpeg?auto=compress&cs=tinysrgb&w=80",
  "https://images.pexels.com/photos/6767341/pexels-photo-6767341.jpeg?auto=compress&cs=tinysrgb&w=80",
  "https://images.pexels.com/photos/6764617/pexels-photo-6764617.jpeg?auto=compress&cs=tinysrgb&w=80",
];

export function MissionRow() {
  return (
    <section className="py-16 bg-[#F7F7F4] border-y border-[#E8E8E0]">
      <Container className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10"
        >

          {/* Left — avatars + tagline */}
          <div className="flex items-start gap-4 max-w-sm">
            <div className="flex -space-x-2.5 shrink-0">
              {AVATARS.map((src, i) => (
                <img key={i} src={src} alt="Captain"
                  className="w-10 h-10 rounded-full object-cover border-2 border-[#F7F7F4]" />
              ))}
            </div>
            <p className="text-[#0C0C0A]/45 text-sm font-medium leading-relaxed">
              Construite par des coureurs pour des coureurs, notre mission est d'inspirer, challenger et fédérer les communautés sportives.
            </p>
          </div>

          {/* Right — heading + CTA */}
          <div className="md:text-right">
            <h3 className="font-extrabold text-2xl sm:text-3xl text-[#0C0C0A] leading-tight tracking-tight mb-5">
              Libérer les Run Clubs<br />
              <span className="text-[#FF5500]">pour un futur plus fort.</span>
            </h3>
            <Link href="/login?mode=signup"
              className="inline-flex items-center gap-2 bg-[#FF5500] hover:bg-[#E04B00] text-white text-sm font-bold px-5 py-2.5 rounded-full transition-colors">
              Commencer maintenant
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </motion.div>
      </Container>
    </section>
  );
}
