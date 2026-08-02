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
import { FramerBadge } from "@/components/landing/FramerBadge";

/* ═══════════════════════════════════════════════════════════════
   CAPTEN 2026 — Official Landing Page
   Canvas: #F4F4EE | Accent: #FF5500 | Typography: Clean upright bold
═══════════════════════════════════════════════════════════════ */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F4F4EE] text-[#1A1918] font-sans antialiased selection:bg-[#FF5500]/20 selection:text-[#FF5500]">
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

      {/* 8. Fixed Floating Badge */}
      <FramerBadge />
    </div>
  );
}
