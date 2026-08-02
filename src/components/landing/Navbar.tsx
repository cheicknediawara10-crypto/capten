"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, Menu, X } from "lucide-react";
import { Button } from "./Button";
import { Container } from "./Container";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#FAFAF8]/90 backdrop-blur-md py-3.5 border-b border-[#ECECEC] shadow-sm"
          : "bg-transparent py-5"
      }`}
    >
      <Container className="flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-[#FF5B14] flex items-center justify-center text-white shadow-md shadow-[#FF5B14]/20 group-hover:scale-105 transition-transform">
            <Zap className="w-4 h-4 fill-white" />
          </div>
          <span className="font-black text-xl text-[#1D1D1D] tracking-tight">
            CAPTEN
          </span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-[#6E6E6E]">
          <a href="#features" className="hover:text-[#1D1D1D] transition-colors">Fonctionnalités</a>
          <a href="#impact" className="hover:text-[#1D1D1D] transition-colors">Sécurité</a>
          <a href="#comparison" className="hover:text-[#1D1D1D] transition-colors">Pourquoi CAPTEN</a>
          <a href="#faq" className="hover:text-[#1D1D1D] transition-colors">FAQ</a>
        </nav>

        {/* Desktop Right CTA */}
        <div className="hidden sm:flex items-center gap-4">
          <Link href="/login" className="text-xs font-bold text-[#6E6E6E] hover:text-[#1D1D1D] transition-colors">
            Connexion
          </Link>
          <Button href="/login?mode=signup" variant="primary" size="sm">
            Lancer mon crew
          </Button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="sm:hidden p-2 text-[#1D1D1D] focus:outline-none cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

      </Container>

      {/* Mobile Animated Dropdown Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="sm:hidden bg-[#FAFAF8] border-b border-[#ECECEC] px-6 py-6 space-y-4"
          >
            <nav className="flex flex-col gap-4 text-sm font-bold text-[#6E6E6E]">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#1D1D1D]">Fonctionnalités</a>
              <a href="#impact" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#1D1D1D]">Sécurité</a>
              <a href="#comparison" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#1D1D1D]">Pourquoi CAPTEN</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#1D1D1D]">FAQ</a>
            </nav>
            <div className="pt-2 flex flex-col gap-3">
              <Button href="/login?mode=signup" variant="primary" size="md" fullWidth>
                Lancer mon crew
              </Button>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-center text-xs font-bold text-[#6E6E6E]">
                Connexion
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
