"use client";

import React from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { SocialProof } from "@/components/landing/SocialProof";
import { ProblemCards } from "@/components/landing/ProblemCards";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Features } from "@/components/landing/Features";
import { WhyCapten } from "@/components/landing/WhyCapten";
import { RunnerExperience } from "@/components/landing/RunnerExperience";
import { SpotsSection } from "@/components/landing/SpotsSection";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#111111] font-sans antialiased selection:bg-[#FF5500]/15 selection:text-[#FF5500]">
      <Navbar />
      <main>
        <Hero />
        <SocialProof />
        <ProblemCards />
        <HowItWorks />
        <RunnerExperience />
        <Features />
        <WhyCapten />
        <Pricing />
        <FAQ />
        <SpotsSection />
      </main>
      <Footer />
    </div>
  );
}
