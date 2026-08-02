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

  const navLinks = [
    { label: "Fonctionnalités", href: "#features" },
    { label: "Sécurité", href: "#impact" },
    { label: "Pourquoi CAPTEN", href: "#comparison" },
    { label: "FAQ", href: "#faq" }
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        scrolled
          ? "bg-[#FAFAF8]/85 backdrop-blur-xl py-3.5 border-b border-[#ECECEC] shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
          : "bg-transparent py-6"
      }`}
    >
      <Container className="flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8.5 h-8.5 rounded-xl bg-[#FF5B14] flex items-center justify-center text-white shadow-md shadow-[#FF5B14]/20 group-hover:scale-105 transition-transform duration-300">
            <Zap className="w-4.5 h-4.5 fill-white" />
          </div>
          <span className="font-black text-xl text-[#1D1D1D] tracking-tight">
            CAPTEN
          </span>
        </Link>

        {/* Desktop Menu with Orange Hover Underline */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-[#6E6E6E]">
          {navLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              className="relative py-1 hover:text-[#1D1D1D] transition-colors duration-200 group"
            >
              <span>{link.label}</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FF5B14] rounded-full group-hover:w-full transition-all duration-300 ease-out" />
            </a>
          ))}
        </nav>

        {/* Desktop Right CTA */}
        <div className="hidden sm:flex items-center gap-5">
          <Link
            href="/login"
            className="text-xs font-bold text-[#6E6E6E] hover:text-[#1D1D1D] transition-colors duration-200"
          >
            Connexion
          </Link>
          <Button href="/login?mode=signup" variant="primary" size="sm">
            Lancer mon crew
          </Button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="sm:hidden p-2 text-[#1D1D1D] focus:outline-none cursor-pointer rounded-lg hover:bg-black/5"
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
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="sm:hidden bg-[#FAFAF8] border-b border-[#ECECEC] px-6 py-6 space-y-4 shadow-xl"
          >
            <nav className="flex flex-col gap-4 text-sm font-bold text-[#6E6E6E]">
              {navLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-[#1D1D1D] py-1 border-b border-neutral-100"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="pt-2 flex flex-col gap-3">
              <Button href="/login?mode=signup" variant="primary" size="md" fullWidth>
                Lancer mon crew
              </Button>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center text-xs font-bold text-[#6E6E6E] py-1"
              >
                Connexion
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
