"use client";

import React from "react";
import Link from "next/link";
import { Container } from "./Container";
import { Button } from "./Button";
import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-20 md:py-28 bg-[#FAFAF8]">
      <Container className="space-y-16">
        
        {/* Dark Banner Box (#1D1D1D) */}
        <div className="bg-[#1D1D1D] text-white rounded-[24px] p-8 sm:p-14 text-center space-y-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <h2 className="font-extrabold text-3xl sm:text-5xl text-white leading-tight tracking-tight">
              TON CREW MÉRITE MIEUX QU'UN SIMPLE FIL WHATSAPP.
            </h2>
            <p className="text-sm text-neutral-300 font-medium leading-relaxed">
              Automatise la gestion de tes sorties dès aujourd'hui et offre une vraie expérience professionnelle à tes membres.
            </p>
            <div className="pt-4">
              <Button href="/login?mode=signup" variant="primary" size="lg">
                Créer mon espace organisateur →
              </Button>
            </div>
          </div>
        </div>

        {/* Minimal Bottom Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-8 border-t border-[#ECECEC] text-xs font-bold text-[#6E6E6E]">
          
          {/* Logo Left */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#FF5B14] flex items-center justify-center text-white text-[10px]">
              <Zap className="w-3.5 h-3.5 fill-white" />
            </div>
            <span className="text-[#1D1D1D] font-extrabold">CAPTEN</span>
          </div>

          {/* Social & Legal Links */}
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="space-x-3">
              <span className="text-[#1D1D1D] font-extrabold">CONTACT</span>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-[#1D1D1D] transition-colors">
                Instagram
              </a>
            </div>

            <div className="space-x-4">
              <span className="text-[#1D1D1D] font-extrabold">LÉGAL</span>
              <Link href="/rgpd" className="hover:text-[#1D1D1D] transition-colors">
                Politique de confidentialité
              </Link>
              <Link href="/cgu" className="hover:text-[#1D1D1D] transition-colors">
                Conditions d'utilisation
              </Link>
            </div>
          </div>

          {/* Copyright & Made in France Badge */}
          <div className="flex items-center gap-3">
            <span>© 2026 CAPTEN</span>
            <span className="px-2.5 py-1 rounded-full bg-[#F5F3EE] text-[10px] font-extrabold text-[#1D1D1D] border border-[#ECECEC]">
              Made in France 🇫🇷
            </span>
          </div>

        </div>

      </Container>
    </footer>
  );
}
