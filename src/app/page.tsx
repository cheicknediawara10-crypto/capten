"use client";

import React from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { ProblemCards } from "@/components/landing/ProblemCards";
import { Explanation } from "@/components/landing/Explanation";
import { Features } from "@/components/landing/Features";
import { Comparison } from "@/components/landing/Comparison";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";

/* ═══════════════════════════════════════════════════════════════
   CAPTEN 2026 — Senior Staff Frontend & UI Engineer Architecture
   Modular, pixel-perfect, clean components adhering to the exact spec.
═══════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1D1D1D] font-sans antialiased selection:bg-[#FF5B14]/20 selection:text-[#FF5B14]">
      {/* Fixed Navbar */}
      <Navbar />

      {/* Main Page Sections */}
      <main>
        {/* 1. Hero Section */}
        <Hero />

        {/* 2. Problem Impact Cards */}
        <ProblemCards />

        {/* 3. Explanation Section */}
        <Explanation />

        {/* 4. Features Section */}
        <Features />

        {/* 5. Comparison Section */}
        <Comparison />

        {/* 6. FAQ Accordion Section */}
        <FAQ />
      </main>

      {/* 7. Footer */}
      <Footer />
    </div>
  );
}
